const AWS = require('aws-sdk');
const { saveSubscription, getSubscriptionArn, deleteSubscription } = require('../utils/subscriptionsStore');

const sns = new AWS.SNS({ region: process.env.AWS_REGION });
const sqs = new AWS.SQS();

const topicArn = process.env.SNS_TOPIC_ARN;
const queueUrl = process.env.SQS_QUEUE_URL;

exports.subscribeEmail = async (email) => {
  const { SubscriptionArn } = await sns.subscribe({
    Protocol: 'email',
    TopicArn: topicArn,
    Endpoint: email,
    ReturnSubscriptionArn: true,
  }).promise();
  
  saveSubscription(email, SubscriptionArn || 'pending');
  return SubscriptionArn;
}

exports.unsubscribeEmail = async (email) => {
  const arn = getSubscriptionArn(email)
  if (!arn) {
    throw new Error('Subscription not found');
  }
  
  await sns.unsubscribe({ SubscriptionArn: arn }).promise();
  deleteSubscription(email);
}

exports.publishSqsMessage = async (file) => {
  const [name, extension] = file.originalname.split(/\.(?=[^\.]+$)/);
  const message = {
    name,
    extension,
    size: file.size,
  };
  
  await sqs.sendMessage({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  }).promise();
}

// exports.processQueueBatch = async () => {
//   try {
//     const response = await sqs.receiveMessage({
//       QueueUrl: queueUrl,
//       MaxNumberOfMessages: 10,
//       WaitTimeSeconds: 0,
//     }).promise();
//
//     const messages = response.Messages || [];
//
//     for (const msg of messages) {
//       const body = JSON.parse(msg.Body);
//
//       const text = `
//         New Image Uploaded!
//
//         Size: ${body.size} bytes
//         Name: ${body.name}
//         Extension: ${body.extension}
//         Download: http://webapp-Appli-AjCp5xGw8IZS-179998492.us-east-1.elb.amazonaws.com/image/${body.name}${body.extension}
//       `;
//
//       await sns.publish({
//         TopicArn: topicArn,
//         Message: text,
//         Subject: 'Image Upload Notification',
//       }).promise();
//
//       await sqs.deleteMessage({
//         QueueUrl: queueUrl,
//         ReceiptHandle: msg.ReceiptHandle,
//       }).promise();
//     }
//   } catch (err) {
//     console.error('[Queue Processor] Error:', err);
//   }
// }
