import express from "express";
import pool from "../database/db.js";

const app = express();
app.use(express.json());

// Buscar usuário por e-mail com todos os seus dados
app.get("/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    const user = userResult.rows[0];
    
    const cartResult = await pool.query(`
      SELECT g.id, g.name, g.price, g.img 
      FROM cart_items ci
      JOIN games g ON ci.game_id = g.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `, [user.id]);
    
    const ownedResult = await pool.query(`
      SELECT g.id, g.name, g.price, g.img 
      FROM user_games ug
      JOIN games g ON ug.game_id = g.id
      WHERE ug.user_id = $1
      ORDER BY ug.purchased_at DESC
    `, [user.id]);
    
    res.json({
      email: user.email,
      password: user.password,
      money: parseFloat(user.money),
      cart: cartResult.rows,
      gamesOwned: ownedResult.rows,
      gamesPosted: []
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// Criar novo usuário (signUp)
app.post("/users", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Usuário já existe" });
    }
    
    const result = await pool.query(
      'INSERT INTO users (email, password, money) VALUES ($1, $2, $3) RETURNING *',
      [email, password, 50.00]
    );
    
    const user = result.rows[0];
    res.status(201).json({
      success: true,
      user: {
        email: user.email,
        money: parseFloat(user.money),
        cart: [],
        gamesOwned: []
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// Atualizar saldo do usuário
app.put("/users/:email/money", async (req, res) => {
  try {
    const { email } = req.params;
    const { money } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET money = $1 WHERE email = $2 RETURNING *',
      [money, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    res.status(500).json({ error: "Erro ao atualizar saldo" });
  }
});

// Atualizar usuário (compatibilidade com versão antiga)
app.put("/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { money } = req.body;
    
    if (money !== undefined) {
      const result = await pool.query(
        'UPDATE users SET money = $1 WHERE email = $2 RETURNING *',
        [money, email]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

app.listen(8082, () => console.log("User Service (PostgreSQL) rodando na porta 8082"));
