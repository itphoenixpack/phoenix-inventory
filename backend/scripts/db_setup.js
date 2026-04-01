const { Client } = require('pg');

const postgresClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'root',
  port: 5432
});

async function run() {
  try {
    await postgresClient.connect();
    console.log('Checking for impack_db database...');
    const res = await postgresClient.query("SELECT datname FROM pg_database WHERE datname = 'impack_db'");
    if (res.rows.length === 0) {
      console.log('Creating impack_db...');
      await postgresClient.query('CREATE DATABASE impack_db');
      console.log('Database impack_db created.');
    } else {
      console.log('impack_db already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await postgresClient.end();
  }
}

run();
