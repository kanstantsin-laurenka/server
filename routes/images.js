const express = require('express');
const multer = require('multer');
const axios = require('axios');
const router = express.Router();
const upload = multer();

const s3 = require('../services/s3');
const db = require('../services/db');
const sns = require('../services/sns');

router.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  try {
    await s3.uploadToS3(file);
    await db.saveMetadata(file);
    await sns.publishSqsMessage(file);
    res.json({ message: 'Uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

router.get('/image/:name', async (req, res) => {
  try {
    const data = await s3.downloadFromS3(req.params.name);
    res.set('Content-Type', data.ContentType);
    res.send(data.Body);
  } catch (err) {
    res.status(404).json({ error: 'Image not found' });
  }
});

router.get('/metadata/:name', async (req, res) => {
  const metadata = await db.getMetadata(req.params.name);
  if (metadata) res.json(metadata);
  else res.status(404).json({ error: 'Metadata not found' });
});

router.get('/metadata/random', async (req, res) => {
  const metadata = await db.getRandomMetadata();
  if (metadata) res.json(metadata);
  else res.status(404).json({ error: 'No images found' });
});

router.delete('/image/:name', async (req, res) => {
  try {
    await s3.deleteFromS3(req.params.name);
    await db.deleteMetadata(req.params.name);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

router.get('/subscribe/:email', async (req, res) => {
  try {
    const subscriptionArn = await sns.subscribeEmail(req.params.email);
    res.json({ message: 'Subscribed successfully', subscriptionArn });
  } catch (err) {
    res.status(500).json({ error: 'Subscribe failed', details: err.message });
  }
});

router.get('/unsubscribe/:email', async (req, res) => {
  try {
    await sns.unsubscribeEmail(req.params.email);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Unsubscribe failed', details: err.message });
  }
})

router.get('/triggerlambda', async (req, res) => {
  try {
    const response = await axios.get('https://flpavliafc.execute-api.us-east-1.amazonaws.com/webapp-DataConsistencyFunction-stage');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Trigger lambda function failed', details: err.message });
  }
});

module.exports = router;
