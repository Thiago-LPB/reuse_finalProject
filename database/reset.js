import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log('  Removendo todas as tabelas existentes...\n');

    // Drop todas as tabelas em cascata
    await client.query(`
      DROP TABLE IF EXISTS game_views CASCADE;
      DROP TABLE IF EXISTS purchase_history CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS user_games CASCADE;
      DROP TABLE IF EXISTS game_tags CASCADE;
      DROP TABLE IF EXISTS tags CASCADE;
      DROP TABLE IF EXISTS games CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    `);

    console.log(' Todas as tabelas foram removidas!\n');

    // Executar init.sql
    console.log(' Executando init.sql...');
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await client.query(initSQL);
    console.log(' Schema criado com sucesso!\n');

    // Executar seed.sql
    console.log(' Executando seed.sql...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await client.query(seedSQL);
    console.log(' Dados de teste inseridos com sucesso!\n');

    // Verificar resultado
    const result = await client.query('SELECT COUNT(*) FROM games');
    console.log(` Total de jogos no catálogo: ${result.rows[0].count}\n`);

    console.log(' Banco resetado e migração concluída com sucesso!');
  } catch (error) {
    console.error(' Erro ao resetar banco:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
