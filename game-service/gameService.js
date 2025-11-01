import express from "express";
import pool from "../database/db.js";
import sortRoutes from "./routes/sortRoutes.js";
const app = express();
app.use(express.json());

// Rota modular para ordenar jogos
app.use("/sort", sortRoutes);

// Listar todos os jogos com filtros
app.get("/games", async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'rating',
      order = 'DESC',
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT g.id, g.name, g.description, g.price, g.img, g.rating, 
             g.developer, g.release_date, g.total_purchases,
             c.name as category,
             COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN game_tags gt ON g.id = gt.game_id
      LEFT JOIN tags t ON gt.tag_id = t.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND g.price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND g.price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    if (search) {
      query += ` AND (g.name ILIKE $${paramCount} OR g.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY g.id, c.name`;

    // Validar sortBy
    const validSortColumns = ['rating', 'price', 'name', 'total_purchases', 'release_date'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'rating';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY g.${sortColumn} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar jogos:", error);
    res.status(500).json({ error: "Erro ao listar jogos" });
  }
});

// Buscar jogo por ID
app.get("/games/:id", async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);

    const result = await pool.query(`
      SELECT g.id, g.name, g.description, g.price, g.img, g.rating, 
             g.developer, g.release_date, g.total_purchases,
             c.name as category,
             COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
               FILTER (WHERE t.name IS NOT NULL), '[]') as tags
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN game_tags gt ON g.id = gt.game_id
      LEFT JOIN tags t ON gt.tag_id = t.id
      WHERE g.id = $1
      GROUP BY g.id, c.name
    `, [gameId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    // Buscar reviews
    const reviewsResult = await pool.query(`
      SELECT r.rating, r.comment, r.created_at, u.email as user_email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.game_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [gameId]);

    const game = result.rows[0];
    game.reviews = reviewsResult.rows;

    res.json(game);
  } catch (error) {
    console.error("Erro ao buscar jogo:", error);
    res.status(500).json({ error: "Erro ao buscar jogo" });
  }
});

// Listar categorias
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.description, COUNT(g.id) as game_count
      FROM categories c
      LEFT JOIN games g ON c.id = g.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
});

// Listar tags
app.get("/tags", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.name, COUNT(gt.game_id) as game_count
      FROM tags t
      LEFT JOIN game_tags gt ON t.id = gt.tag_id
      GROUP BY t.id
      ORDER BY game_count DESC, t.name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar tags:", error);
    res.status(500).json({ error: "Erro ao listar tags" });
  }
});

// Adicionar review
app.post("/games/:id/review", async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const { userEmail, rating, comment } = req.body;

    // Buscar user ID
    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [userEmail]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    const userId = userResult.rows[0].id;

    // Verificar se o usuário possui o jogo
    const ownsGame = await pool.query(
      "SELECT id FROM user_games WHERE user_id = $1 AND game_id = $2",
      [userId, gameId]
    );

    if (ownsGame.rows.length === 0) {
      return res.status(403).json({ error: "Você precisa possuir o jogo para avaliá-lo" });
    }

    // Inserir ou atualizar review
    await pool.query(`
      INSERT INTO reviews (user_id, game_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, game_id) 
      DO UPDATE SET rating = $3, comment = $4, created_at = CURRENT_TIMESTAMP
    `, [userId, gameId, rating, comment]);

    // Atualizar rating médio do jogo
    const avgResult = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM reviews WHERE game_id = $1",
      [gameId]
    );

    await pool.query(
      "UPDATE games SET rating = $1 WHERE id = $2",
      [parseFloat(avgResult.rows[0].avg_rating).toFixed(2), gameId]
    );

    res.json({ success: true, message: "Review adicionada com sucesso" });
  } catch (error) {
    console.error("Erro ao adicionar review:", error);
    res.status(500).json({ error: "Erro ao adicionar review" });
  }
});

// Buscar jogos por tag
app.get("/tags/:tagName/games", async (req, res) => {
  try {
    const { tagName } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const result = await pool.query(`
      SELECT DISTINCT g.id, g.name, g.description, g.price, g.img, g.rating,
             c.name as category
      FROM games g
      JOIN game_tags gt ON g.id = gt.game_id
      JOIN tags t ON gt.tag_id = t.id
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE t.name = $1
      ORDER BY g.rating DESC, g.total_purchases DESC
      LIMIT $2
    `, [tagName, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar jogos por tag:", error);
    res.status(500).json({ error: "Erro ao buscar jogos por tag" });
  }
});

// Estatísticas do jogo
app.get("/games/:id/stats", async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);

    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT ug.user_id) as total_owners,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        g.total_purchases,
        COUNT(DISTINCT gv.user_id) as total_views
      FROM games g
      LEFT JOIN user_games ug ON g.id = ug.game_id
      LEFT JOIN reviews r ON g.id = r.game_id
      LEFT JOIN game_views gv ON g.id = gv.game_id
      WHERE g.id = $1
      GROUP BY g.id
    `, [gameId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

app.listen(8085, () => console.log("Game Service rodando na porta 8085"));

export default app;
