require('dotenv').config();
const express = require('express');
const app = express();

const imageRoutes = require('./routes/images');
app.use('/', imageRoutes);

app.listen(80, () => {
  console.log('Server running on port 80');
});
