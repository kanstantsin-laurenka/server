const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://169.254.169.254/latest/meta-data/placement/availability-zone');
    const az = response.data;
    const region = az.slice(0, -1);
    
    res.json({ region, availabilityZone: az });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
