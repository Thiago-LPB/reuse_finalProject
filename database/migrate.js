import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('  Iniciando migração do banco de dados...\n');

    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    console.log(' Executando init.sql...');
    await client.query(initSQL);
    console.log(' Schema criado com sucesso!\n');

    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    console.log(' Executando seed.sql...');
    await client.query(seedSQL);
    console.log(' Dados de teste inseridos com sucesso!\n');

    const result = await client.query('SELECT COUNT(*) FROM games');
    console.log(` Total de jogos no catálogo: ${result.rows[0].count}\n`);

    console.log(' Migração concluída com sucesso!');
  } catch (error) {
    console.error(' Erro na migração:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
