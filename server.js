const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://www.examrizzsearch.com', 'https://examrizzsearch.com'],
  optionsSuccessStatus: 200
}));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database.');
  connection.release();
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const port = process.env.PORT || 443;

const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem')
};

https.createServer(options, app).listen(port, '0.0.0.0', () => {
  console.log(`Server is running on https://0.0.0.0:${port}`);
});

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
