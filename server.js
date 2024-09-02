const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();

// Enable CORS for examrizzsearch.com
const cors = require('cors');

app.use(cors({
  origin: ['https://www.examrizzsearch.com', 'https://examrizzsearch.com'],
  optionsSuccessStatus: 200
}));

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Create MySQL connection pool
const fs = require('fs');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  ssl: {
    ca: fs.readFileSync(__dirname + '/server-ca.pem')
  }
  // If you're using the Cloud SQL Proxy, uncomment the next line and comment out the host line above
  // socketPath: '/cloudsql/[maximal-coast-433811-g4]:us-central1:examrizzsearch'
});


// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database.');
  connection.release();
});

// Search API endpoint
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const sql = `
    SELECT id, title, content, file_type, file_path
    FROM tsa_content
    WHERE MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE)
    LIMIT 20
  `;
  const params = [query];

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing search query:', err);
      return res.status(500).json({ error: 'An error occurred while searching' });
    }
    res.json(results);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server
const port = process.env.PORT || 3000;

app.listen(port, 'localhost', () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing the database pool:', err);
    } else {
      console.log('Database pool closed.');
    }
    process.exit(0);
  });
});
