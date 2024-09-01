// Load environment variables from the .env file
require('dotenv').config();

const express = require('express');
const {Storage} = require('@google-cloud/storage');

// Initialize Express app
const app = express();
const port = process.env.PORT || 8080; // Use environment variable or default to 8080

// Initialize Google Cloud Storage client
const storage = new Storage();
const BUCKET_NAME = process.env.BUCKET_NAME; // Use environment variable for bucket name
const bucket = storage.bucket(BUCKET_NAME);

// Define a route for searching
app.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // List files in the bucket
        const [files] = await bucket.getFiles();
        const results = files
            .map(file => file.name)
            .filter(name => name.includes(query));

        res.json(results);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
