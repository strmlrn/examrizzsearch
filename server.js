const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const config = require('./config');

const app = express();

// Enable CORS for allowed origins
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Connect to the SQLite database
const db = new sqlite3.Database(config.databasePath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database.');
  }
});

// Search API endpoint
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const sql = `
    SELECT * FROM examrizz_content
    WHERE title LIKE ? OR content LIKE ?
    LIMIT 20
  `;
  const params = [`%${query}%`, `%${query}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error executing search query:', err.message);
      return res.status(500).json({ error: 'An error occurred while searching' });
    }
    res.json(rows);
  });
});

// Start the server
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});

// Close the database connection when the server is stopped
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
