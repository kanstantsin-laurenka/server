require('dotenv').config();
const express = require('express');
const app = express();

const imageRoutes = require('./routes/images');

app.get('/', (req, res) => {
  res.send('<html><body><h1>Welcome to the Web App</h1></body></html>');
});

app.use('/', imageRoutes);
app.listen(80, () => {
  console.log('Server running on port 80');
});
