// server.mjs
import { createServer } from 'node:http';
import { parse } from 'node:url';
import { readFile } from 'node:fs/promises';
import { ool } from 'pg';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config();


//create postgresql pool

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ContentGenerator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

//init db
const initDB = async () => {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDB();



const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!\n');
});

// starts a simple http server locally on port 3000
server.listen(5000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:5000');
});

