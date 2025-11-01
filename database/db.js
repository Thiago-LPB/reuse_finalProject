import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://teste:123@localhost/mydb",
  ssl: false  // Desabilita SSL para conexões locais
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
