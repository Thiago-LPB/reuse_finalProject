import express from "express";
import pool from "../database/db.js";

const app = express();
app.use(express.json());

// Adicionar jogo ao carrinho
app.post("/cart/add", async (req, res) => {
  try {
    const { email, gameId } = req.body;

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    const userId = userResult.rows[0].id;

    const alreadyOwned = await pool.query(
      'SELECT id FROM user_games WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    if (alreadyOwned.rows.length > 0) {
      return res.status(400).json({ error: "Você já possui este jogo" });
    }

    await pool.query(
      'INSERT INTO cart_items (user_id, game_id) VALUES ($1, $2) ON CONFLICT (user_id, game_id) DO NOTHING',
      [userId, gameId]
    );

    const cartSize = await pool.query(
      'SELECT COUNT(*) FROM cart_items WHERE user_id = $1',
      [userId]
    );

    res.json({ success: true, cartSize: parseInt(cartSize.rows[0].count) });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    res.status(500).json({ error: "Erro ao adicionar ao carrinho" });
  }
});

// Obter tamanho do carrinho
app.get("/cart/size/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const userId = userResult.rows[0].id;
    const result = await pool.query(
      'SELECT COUNT(*) FROM cart_items WHERE user_id = $1',
      [userId]
    );

    res.json({ cartSize: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Erro ao obter tamanho do carrinho:', error);
    res.status(500).json({ error: "Erro ao obter tamanho do carrinho" });
  }
});

// Realizar compra
app.post("/cart/checkout", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { email } = req.body;

    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

    const cartResult = await client.query(`
      SELECT g.id, g.price 
      FROM cart_items ci
      JOIN games g ON ci.game_id = g.id
      WHERE ci.user_id = $1
    `, [user.id]);

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ success: false, message: "Carrinho está vazio!" });
    }

    const total = cartResult.rows.reduce((sum, item) => sum + parseFloat(item.price), 0);

    if (parseFloat(user.money) < total) {
      await client.query('ROLLBACK');
      return res.json({ success: false, message: "Saldo insuficiente!" });
    }

    for (const item of cartResult.rows) {
      await client.query(
        'INSERT INTO user_games (user_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [user.id, item.id]
      );

      await client.query(
        'INSERT INTO purchase_history (user_id, game_id, price_paid, payment_method) VALUES ($1, $2, $3, $4)',
        [user.id, item.id, item.price, 'wallet']
      );

      await client.query(
        'UPDATE games SET total_purchases = total_purchases + 1 WHERE id = $1',
        [item.id]
      );
    }

    await client.query(
      'UPDATE users SET money = money - $1 WHERE id = $2',
      [total, user.id]
    );

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [user.id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "Compra realizada com sucesso!"
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao realizar checkout:', error);
    res.status(500).json({ success: false, message: "Erro ao processar compra" });
  } finally {
    client.release();
  }
});

// Remover item do carrinho
app.delete("/cart/remove/:email/:gameId", async (req, res) => {
  try {
    const { email, gameId } = req.params;

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const userId = userResult.rows[0].id;

    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    res.status(500).json({ error: "Erro ao remover do carrinho" });
  }
});

app.listen(8083, () => console.log("Cart Service (PostgreSQL) rodando na porta 8083"));
