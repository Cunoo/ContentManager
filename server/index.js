// server.mjs
import { createServer } from 'node:http';
import { parse } from 'node:url';
import { readFile } from 'node:fs/promises';
import { ool } from 'pg';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import express from 'express';
import cors from 'cors';


dotenv.config();

const app = express()
const PORT = process.env.PORT || 500

//middleware
app.use(cors());
app.use(express.json()) // parse json
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

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

//Routes

app.get('/', (req, res) => {
  res.json({ 
    message: 'User Registration API Server',
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      profile: 'GET /api/users/:id'
    }
  });
});


//register new user

app.post('/api/register', async (req, res) => {
  const {username, email, password} = req.body;

  //validate input
  if(!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" })
  }

  try {
    //check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email=$2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({error: 'Username or email already exists'});
    }

    //Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //insert new user
    const result = await pool.query(
      'INSERT INTO users (username, email, password VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );
    res.status(201).json({
      message: 'User registered succesfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Registration errors:", error);
    res.status(500).json({error: "Server error during registration"});
  };
});

//Login route

app.post('/api/login', async (req, res) => {
  const {login, password} = req.body;

  //validate input
  if(!login || !password) {
    return res.status(400).json({ error: "Login (username or email) and password are required" })
  }

  try {
    //find user by email or username
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [login]
    );
    if (result.rows.length == 0) {
      return res.status(401).json ({ error: 'Invalid credentials'});
    }
    const user = result.rows[0];
    
    //compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials'});
    }
    
    //dont send the password back
    const {password: _, ...userWithoutPassword} = user;
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
      console.error('Login error', error);
      res.status(500).json({error: 'Server error during login'});
    }
})

// Get user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username, email',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    if (!username && !email) {
      return res.status(400).json({ error: 'At least one field (username or email) is required' });
    }
    
    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (username) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }
    
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, username, email, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

//error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error'});

});

//Handle 404 or undefined routes
app.use('*', (req, res) => {
  res.status(404).json({error: 'Route not found'})
})

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!\n');
});

// starts a simple http server locally on port 3000
server.listen(5000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:5000');
});

