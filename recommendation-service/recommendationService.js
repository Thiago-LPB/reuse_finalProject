import express from "express";
import pool from "../database/db.js";

const app = express();
app.use(express.json());

// Registrar visualização de jogo
app.post("/recommendations/view", async (req, res) => {
  try {
    const { email, gameId } = req.body;
    
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    const userId = userResult.rows[0].id;
    
    await pool.query(
      'INSERT INTO game_views (user_id, game_id) VALUES ($1, $2)',
      [userId, gameId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    res.status(500).json({ error: "Erro ao registrar visualização" });
  }
});

// Obter recomendações personalizadas para um usuário
app.get("/recommendations/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    const userId = userResult.rows[0].id;
    
    const recommendations = await pool.query(`
      WITH user_categories AS (
        SELECT DISTINCT g.category_id, COUNT(*) as category_count
        FROM user_games ug
        JOIN games g ON ug.game_id = g.id
        WHERE ug.user_id = $1
        GROUP BY g.category_id
        ORDER BY category_count DESC
        LIMIT 3
      ),
      user_tags AS (
        SELECT DISTINCT gt.tag_id, COUNT(*) as tag_count
        FROM user_games ug
        JOIN game_tags gt ON ug.game_id = gt.game_id
        WHERE ug.user_id = $1
        GROUP BY gt.tag_id
        ORDER BY tag_count DESC
        LIMIT 5
      ),
      owned_games AS (
        SELECT game_id FROM user_games WHERE user_id = $1
      ),
      cart_games AS (
        SELECT game_id FROM cart_items WHERE user_id = $1
      )
      SELECT DISTINCT g.id, g.name, g.description, g.price, g.img, 
             g.rating, g.developer, g.total_purchases, c.name as category,
             (
               CASE 
                 WHEN g.category_id IN (SELECT category_id FROM user_categories) THEN 3
                 ELSE 0
               END +
               CASE 
                 WHEN EXISTS (
                   SELECT 1 FROM game_tags gt 
                   WHERE gt.game_id = g.id AND gt.tag_id IN (SELECT tag_id FROM user_tags)
                 ) THEN 2
                 ELSE 0
               END +
               CASE 
                 WHEN g.rating >= 4.5 THEN 1
                 ELSE 0
               END
             ) as relevance_score
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.id NOT IN (SELECT game_id FROM owned_games)
        AND g.id NOT IN (SELECT game_id FROM cart_games)
      ORDER BY relevance_score DESC, g.rating DESC, g.total_purchases DESC
      LIMIT $2
    `, [userId, limit]);
    
    res.json(recommendations.rows);
  } catch (error) {
    console.error('Erro ao obter recomendações:', error);
    res.status(500).json({ error: "Erro ao obter recomendações" });
  }
});

// Obter jogos similares a um jogo específico
app.get("/recommendations/similar/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    const similarGames = await pool.query(`
      WITH game_info AS (
        SELECT category_id FROM games WHERE id = $1
      ),
      source_game_tags AS (
        SELECT tag_id FROM game_tags WHERE game_id = $1
      )
      SELECT DISTINCT g.id, g.name, g.description, g.price, g.img, 
             g.rating, g.developer, c.name as category,
             (
               CASE WHEN g.category_id = (SELECT category_id FROM game_info) THEN 2 ELSE 0 END +
               CASE 
                 WHEN EXISTS (
                   SELECT 1 FROM game_tags gt 
                   WHERE gt.game_id = g.id AND gt.tag_id IN (SELECT tag_id FROM source_game_tags)
                 ) THEN 1 
                 ELSE 0 
               END
             ) as similarity_score
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.id != $1
      ORDER BY similarity_score DESC, g.rating DESC
      LIMIT $2
    `, [gameId, limit]);
    
    res.json(similarGames.rows);
  } catch (error) {
    console.error('Erro ao obter jogos similares:', error);
    res.status(500).json({ error: "Erro ao obter jogos similares" });
  }
});

// Obter jogos mais populares
app.get("/recommendations/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.category;
    
    let query = `
      SELECT g.id, g.name, g.description, g.price, g.img, 
             g.rating, g.developer, g.total_purchases,
             c.name as category
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
    `;
    
    const params = [limit];
    
    if (categoryId) {
      query += ' WHERE g.category_id = $2';
      params.push(categoryId);
    }
    
    query += ' ORDER BY g.total_purchases DESC, g.rating DESC LIMIT $1';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter jogos populares:', error);
    res.status(500).json({ error: "Erro ao obter jogos populares" });
  }
});

// Obter estatísticas de preferências do usuário
app.get("/recommendations/stats/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    const userId = userResult.rows[0].id;
    
    const favoriteCategories = await pool.query(`
      SELECT c.name, COUNT(*) as count
      FROM user_games ug
      JOIN games g ON ug.game_id = g.id
      JOIN categories c ON g.category_id = c.id
      WHERE ug.user_id = $1
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 5
    `, [userId]);
    
    const favoriteTags = await pool.query(`
      SELECT t.name, COUNT(*) as count
      FROM user_games ug
      JOIN game_tags gt ON ug.game_id = gt.game_id
      JOIN tags t ON gt.tag_id = t.id
      WHERE ug.user_id = $1
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 5
    `, [userId]);
    
    const totalGames = await pool.query(
      'SELECT COUNT(*) as count FROM user_games WHERE user_id = $1',
      [userId]
    );
    
    const totalSpent = await pool.query(
      'SELECT COALESCE(SUM(price_paid), 0) as total FROM purchase_history WHERE user_id = $1',
      [userId]
    );
    
    res.json({
      favoriteCategories: favoriteCategories.rows,
      favoriteTags: favoriteTags.rows,
      totalGames: parseInt(totalGames.rows[0].count),
      totalSpent: parseFloat(totalSpent.rows[0].total)
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: "Erro ao obter estatísticas" });
  }
});

// Obter recomendações baseadas em tendências (jogos mais vistos recentemente)
app.get("/recommendations/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    
    const trendingGames = await pool.query(`
      SELECT g.id, g.name, g.description, g.price, g.img, 
             g.rating, g.developer, c.name as category,
             COUNT(DISTINCT gv.user_id) as view_count,
             COUNT(DISTINCT ph.user_id) as purchase_count
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN game_views gv ON g.id = gv.game_id 
        AND gv.viewed_at >= NOW() - INTERVAL '1 day' * $2
      LEFT JOIN purchase_history ph ON g.id = ph.game_id 
        AND ph.purchased_at >= NOW() - INTERVAL '1 day' * $2
      GROUP BY g.id, c.name
      ORDER BY (COUNT(DISTINCT gv.user_id) * 0.7 + COUNT(DISTINCT ph.user_id) * 0.3) DESC,
               g.rating DESC
      LIMIT $1
    `, [limit, days]);
    
    res.json(trendingGames.rows);
  } catch (error) {
    console.error('Erro ao obter jogos em tendência:', error);
    res.status(500).json({ error: "Erro ao obter jogos em tendência" });
  }
});

// Obter lançamentos recentes que podem interessar ao usuário
app.get("/recommendations/new-releases/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const daysOld = parseInt(req.query.days) || 30;
    
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    const userId = userResult.rows[0].id;
    
    const newReleases = await pool.query(`
      WITH user_preferences AS (
        SELECT DISTINCT g.category_id
        FROM user_games ug
        JOIN games g ON ug.game_id = g.id
        WHERE ug.user_id = $1
      ),
      owned_games AS (
        SELECT game_id FROM user_games WHERE user_id = $1
      ),
      cart_games AS (
        SELECT game_id FROM cart_items WHERE user_id = $1
      )
      SELECT g.id, g.name, g.description, g.price, g.img, 
             g.rating, g.developer, g.release_date, c.name as category,
             CASE WHEN g.category_id IN (SELECT category_id FROM user_preferences) 
                  THEN 1 ELSE 0 END as matches_preference
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.release_date >= NOW() - INTERVAL '1 day' * $3
        AND g.id NOT IN (SELECT game_id FROM owned_games)
        AND g.id NOT IN (SELECT game_id FROM cart_games)
      ORDER BY matches_preference DESC, g.rating DESC, g.release_date DESC
      LIMIT $2
    `, [userId, limit, daysOld]);
    
    res.json(newReleases.rows);
  } catch (error) {
    console.error('Erro ao obter lançamentos:', error);
    res.status(500).json({ error: "Erro ao obter lançamentos" });
  }
});

// Obter recomendações para novos usuários (sem histórico)
app.get("/recommendations/for-new-users", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recommendations = await pool.query(`
      SELECT g.id, g.name, g.description, g.price, g.img, 
             g.rating, g.developer, c.name as category,
             g.total_purchases,
             (g.rating * 0.6 + (g.total_purchases::float / NULLIF((SELECT MAX(total_purchases) FROM games), 0)) * 0.4) as score
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.rating >= 4.0
      ORDER BY score DESC, g.total_purchases DESC
      LIMIT $1
    `, [limit]);
    
    res.json(recommendations.rows);
  } catch (error) {
    console.error('Erro ao obter recomendações para novos usuários:', error);
    res.status(500).json({ error: "Erro ao obter recomendações" });
  }
});

// Obter recomendações baseadas em categoria específica
app.get("/recommendations/by-category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const email = req.query.email;
    
    let excludeQuery = '';
    let params = [categoryName, limit];
    
    if (email) {
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userResult.rows.length > 0) {
        excludeQuery = `
          AND g.id NOT IN (SELECT game_id FROM user_games WHERE user_id = ${userResult.rows[0].id})
          AND g.id NOT IN (SELECT game_id FROM cart_items WHERE user_id = ${userResult.rows[0].id})
        `;
      }
    }
    
    const categoryGames = await pool.query(`
      SELECT g.id, g.name, g.description, g.price, g.img, 
             g.rating, g.developer, c.name as category
      FROM games g
      JOIN categories c ON g.category_id = c.id
      WHERE c.name = $1
      ${excludeQuery}
      ORDER BY g.rating DESC, g.total_purchases DESC
      LIMIT $2
    `, params);
    
    res.json(categoryGames.rows);
  } catch (error) {
    console.error('Erro ao obter jogos por categoria:', error);
    res.status(500).json({ error: "Erro ao obter jogos por categoria" });
  }
});

app.listen(8084, () => console.log("Recommendation Service rodando na porta 8084"));

export default app;
