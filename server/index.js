// server.mjs
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create postgresql pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ContentManager',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database credentials in .env file');
    return false;
  }
};

// Init db
const initDB = async () => {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('⚠️  Continuing without database connection...');
      return;
    }

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

    // Create events table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        description TEXT,
        resource VARCHAR(100) DEFAULT 'point-in-time',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized successfully');
    console.log('✅ Users and Events tables ready');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('⚠️  Server will continue but database features won\'t work');
  }
};

// Initialize database
initDB();

// Routes - Define them in specific order (most specific first)

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'User Registration & Calendar API Server',
    status: 'Running ✅',
    endpoints: {
      // User endpoints
      register: 'POST /api/register',
      login: 'POST /api/login',
      getAllUsers: 'GET /api/users',
      getUserById: 'GET /api/users/:id',
      updateUser: 'PUT /api/users/:id',
      deleteUser: 'DELETE /api/users/:id',
      // Event endpoints
      getAllEvents: 'GET /api/events',
      getEventById: 'GET /api/events/:id',
      createEvent: 'POST /api/events',
      updateEvent: 'PUT /api/events/:id',
      deleteEvent: 'DELETE /api/events/:id',
      getEventsByDateRange: 'GET /api/events/range/:start/:end',
      getUserEvents: 'GET /api/users/:userId/events',
      // Health check
      healthCheck: 'GET /api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      server: 'User Registration & Calendar API',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// USER ROUTES

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { body: req.body, headers: req.headers['content-type'] });
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({ error: "Login (username or email) and password are required" });
    }

    // Find user by email or username
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [login]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.status(200).json({
      message: 'Users retrieved successfully',
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get events for specific user (moved before /api/users/:id to avoid conflict)
app.get('/api/users/:userId/events', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query = `
      SELECT * FROM events 
      WHERE user_id = $1 
      ORDER BY start_time ASC
    `;
    const result = await pool.query(query, [userId]);
    
    res.status(200).json({
      message: 'User events retrieved successfully',
      user: userCheck.rows[0],
      events: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
});

// Get user profile by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User retrieved successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!username && !email) {
      return res.status(400).json({ error: 'At least one field (username or email) is required' });
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
    }
    
    // Build dynamic query
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
    if (error.code === '23505') {
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

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

// EVENT ROUTES

// Get events by date range (moved before /api/events/:id to avoid conflict)
app.get('/api/events/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;
    const query = `
      SELECT e.*, u.username 
      FROM events e 
      LEFT JOIN users u ON e.user_id = u.id 
      WHERE e.start_time >= $1 AND e.end_time <= $2 
      ORDER BY e.start_time ASC
    `;
    const result = await pool.query(query, [start, end]);
    
    res.status(200).json({
      message: 'Events retrieved successfully',
      events: result.rows,
      count: result.rows.length,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error fetching events by range:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const query = `
      SELECT e.*, u.username 
      FROM events e 
      LEFT JOIN users u ON e.user_id = u.id 
      ORDER BY e.start_time ASC
    `;
    const result = await pool.query(query);
    
    res.status(200).json({
      message: 'Events retrieved successfully',
      events: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const query = `
      SELECT e.*, u.username 
      FROM events e 
      LEFT JOIN users u ON e.user_id = u.id 
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(200).json({
      message: 'Event retrieved successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
app.post('/api/events', async (req, res) => {
  try {
    console.log('Creating event:', req.body);
    const { title, start_time, end_time, description, resource, user_id } = req.body;
    
    // Validation
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ 
        error: 'Title, start_time, and end_time are required' 
      });
    }

    // Validate user_id if provided
    if (user_id) {
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid user_id' });
      }
    }

    const query = `
      INSERT INTO events (title, start_time, end_time, description, resource, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      title,
      start_time,
      end_time,
      description || '',
      resource || 'point-in-time',
      user_id || null
    ];
    
    const result = await pool.query(query, values);
    console.log('Event created successfully:', result.rows[0]);
    
    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update existing event
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_time, end_time, description, resource, user_id } = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists
    const checkQuery = 'SELECT id FROM events WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Validate user_id if provided
    if (user_id) {
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid user_id' });
      }
    }

    const query = `
      UPDATE events 
      SET title = COALESCE($1, title),
          start_time = COALESCE($2, start_time),
          end_time = COALESCE($3, end_time),
          description = COALESCE($4, description),
          resource = COALESCE($5, resource),
          user_id = COALESCE($6, user_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [title, start_time, end_time, description, resource, user_id, id];
    const result = await pool.query(query, values);
    
    res.status(200).json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log('Event deleted successfully:', result.rows[0]);
    res.status(200).json({
      message: 'Event deleted successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use(function(req, res) {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      // User routes
      'POST /api/register',
      'POST /api/login',
      'GET /api/users',
      'GET /api/users/:id',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/users/:userId/events',
      // Event routes
      'GET /api/events',
      'GET /api/events/:id',
      'POST /api/events',
      'PUT /api/events/:id',
      'DELETE /api/events/:id',
      'GET /api/events/range/:start/:end'
    ]
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  pool.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 User Registration & Calendar API Server is running!`);
  console.log(`📡 Server: http://127.0.0.1:${PORT}`);
  console.log(`📖 API Documentation: http://127.0.0.1:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`👥 User Management: Available`);
  console.log(`📅 Calendar Events: Available`);
});