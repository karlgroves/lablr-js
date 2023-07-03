const express = require('express');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const microtime = require('microtime');
const cors = require('cors');

const app = express();
const port = 3000;

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

  // Generate a unique filename using microtime
  const filename = microtime.now() + '.csv';

  // Create a CSV writer with the dynamic filename
  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: [
      { id: 'tagName', title: 'Tag Name' },
      { id: 'category', title: 'Category' },
      { id: 'location', title: 'Location' },
      { id: 'xpath', title: 'XPath' },
      { id: 'outerHtml', title: 'Outer HTML' },
      { id: 'textContent', title: 'Text Content' },
      { id: 'accessibleName', title: 'Accessible Name' }
    ]
  });

  // Write the request body to the CSV file
  csvWriter.writeRecords(requestBody)
    .then(() => {
      console.log(`Request written to CSV file: ${filename}`);
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error writing to file');
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
