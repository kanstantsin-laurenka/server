const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

exports.uploadToS3 = (file) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  return s3.upload(params).promise();
};

exports.downloadFromS3 = (key) => {
  return s3.getObject({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  }).promise();
};

exports.deleteFromS3 = (key) => {
  console.log(1234);
  return s3.deleteObject({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  }).promise();
};
