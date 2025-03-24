require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const imageRoutes = require('./routes/images');
const { processQueueBatch } = require('./services/sns');

app.get('/', (req, res) => {
  res.send('<html><body><h1>Welcome to the Web App</h1></body></html>');
});

app.use('/', imageRoutes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  setInterval(processQueueBatch, 30000);
});
