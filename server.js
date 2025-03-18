const express = require('express');
const axios = require('axios');

const app = express();

async function getInstanceMetadata() {
  try {
    const tokenResponse = await axios.put('http://169.254.169.254/latest/api/token', null, {
      headers: { 'X-aws-ec2-metadata-token-ttl-seconds': '21600' }
    });
    const token = tokenResponse.data;
    
    const regionResponse = await axios.get('http://169.254.169.254/latest/meta-data/placement/region', {
      headers: { 'X-aws-ec2-metadata-token': token }
    });
    const azResponse = await axios.get('http://169.254.169.254/latest/meta-data/placement/availability-zone', {
      headers: { 'X-aws-ec2-metadata-token': token }
    });
    
    return {
      region: regionResponse.data,
      availabilityZone: azResponse.data
    };
  } catch (error) {
    console.error('Error fetching instance metadata:', error);
    return null;
  }
}


app.get('/', async (req, res) => {
  try {
    res.send('Hello World');
    
    // const response = await axios.get('http://169.254.169.254/latest/meta-data/placement/availability-zone');
    // const az = response.data;
    // const region = az.slice(0, -1);
    
    // res.json({ region, availabilityZone: az });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

app.get('/metadata', async (req, res) => {
  try {
    const metadata = await getInstanceMetadata();
    if (metadata) {
      res.json(metadata);
    } else {
      res.status(500).json({ error: 'Failed to retrieve instance metadata' });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

app.listen(80, () => {
  console.log(`Server is running on port 80`);
});
