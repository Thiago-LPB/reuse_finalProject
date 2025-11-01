import express from "express";
import pool from "../../database/db.js";

const router = express.Router();

router.get("/games", async (req, res) => {
  try {
    const {
      sortBy = "rating", // padrão
      order = "DESC",
      limit = 50,
      offset = 0,
      category,
    } = req.query;

    const validSorts = {
      price: "g.price",
      rating: "g.rating",
      name: "g.name",
      release_date: "g.release_date",
      total_purchases: "g.total_purchases"
    };

    const sortColumn = validSorts[sortBy] || "g.rating";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    let query = `
      SELECT 
        g.id, g.name, g.description, g.price, g.img, g.rating,
        g.developer, g.release_date, g.total_purchases,
        c.name as category
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += `
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      total: result.rowCount,
      sortBy,
      order: sortOrder,
      games: result.rows
    });
  } catch (error) {
    console.error("Erro ao ordenar jogos:", error);
    res.status(500).json({ error: "Erro ao ordenar jogos" });
  }
});

export default router;
