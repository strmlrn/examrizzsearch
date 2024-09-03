const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const https = require('https');
const fs = require('fs');

require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['https://examrizzsearch.com', 'https://www.examrizzsearch.com'],
  credentials: true
}));

const uri = process.env.MONGODB_URI; // Add this to your .env file
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Successfully connected to the database.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

connectToDatabase();

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const db = client.db('sample_mflix'); // Replace with your actual database name
    const collection = db.collection('comments'); // Replace with your actual collection name

    const results = await collection.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20).toArray();

    res.json(results);
  } catch (error) {
    console.error('Error executing search query:', error);
    return res.status(500).json({ error: 'An error occurred while searching' });
  }
});

app.get('/health', (req, res) => {
 res.status(200).json({ status: 'OK', database: 'Connected' });
});

const port = process.env.PORT || 443;

const options = {
  key: fs.readFileSync('/home/sj/certs/privkey.pem'),
  cert: fs.readFileSync('/home/sj/certs/fullchain.pem')
};

https.createServer(options, app).listen(port, '0.0.0.0', () => {
  console.log(`HTTPS server running on https://0.0.0.0:${port}`);
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('Database connection closed.');
  process.exit(0);
});

