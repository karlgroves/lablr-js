const express = require('express');
const { createPool } = require('mysql2/promise');
const microtime = require('microtime');
const cors = require('cors');

const app = express();
const port = 3000;

// Create a MySQL connection pool
const pool = createPool({
  host: 'localhost',
  user: 'lablr',
  password: '$uP3rm4n!',
  database: 'lablr',
});

app.use(cors()); // Enable CORS for all routes

app.use(express.json({ limit: '500mb' })); // Increase payload limit to 500MB

app.get('/lablr', (req, res) => {
  res.sendStatus(405); // Method Not Allowed
});

app.post('/lablr', (req, res) => {
  // Get the request body
  const requestBody = req.body;

  // Stringify the location data
  requestBody.forEach((obj) => {
    obj.location = JSON.stringify(obj.location);
  });

  // Now, let's insert the data into the database table.
  const table = 'elements'; // Change this to the name of your database table.

  pool.query(`CREATE TABLE IF NOT EXISTS ${table} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url MEDIUMTEXT NOT NULL,
    tagName VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    location JSON NOT NULL,
    xpath VARCHAR(500),
    outerHtml TEXT,
    textContent LONGTEXT,
    )`)
    .then(() => {
      // Insert the records into the database table
      return pool.query(`INSERT INTO ${table} (url, tagName, category, location, xpath, outerHtml, textContent) VALUES ?`, [requestBody.map(item => [
        item.url,
        item.tagName,
        item.category,
        item.location,
        item.xpath,
        item.outerHtml,
        item.textContent
      ])]);
    })
    .then(() => {
      console.log(`Request written to database table: ${table}`);
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error writing to database');
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
