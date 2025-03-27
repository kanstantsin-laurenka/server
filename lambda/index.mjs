import {
  SNSClient,
  PublishCommand
} from "@aws-sdk/client-sns";

const TOPIC_ARN_NAME = 'arn:aws:sns:us-east-1:084828560613:webapp-UploadsNotificationTopic';
const REGION = 'us-east-1';

const sns = new SNSClient({ region: REGION });


export const handler = async (event, context) => {
  if (!event) {
    return {
      'statusCode': 200,
      'body': JSON.stringify('No messages to process. Lambda function completed')
    };
  }
  
  console.log(`Received event: ${JSON.stringify(event)}`);
  
  const processed = await processRecords(event.Records);
  
  console.log(`SNS TOPIC ARN = ${TOPIC_ARN_NAME};
              Function Name = ${context.functionName};
              Processed Messages count = ${processed};
              Remaining Time in millis - ${context.getRemainingTimeInMillis()}
           `);
  return {
    'statusCode': 200,
    'body': JSON.stringify("Lambda function completed"),
  };
};

const processRecords = async (records) => {
  if (!records) {
    console.log("No records to process.");
    return 0;
  }
  
  for (const record of records) {
    if (!record.body) {
      throw new Error('No body in SQS record.');
    }
    
    const { size, name, extension } = JSON.parse(record.body);
    
    const text = `
        New Image Uploaded!

        Size: ${size} bytes
        Name: ${name}
        Extension: ${extension}
        Download: http://webapp-Appli-M2iZCAavOkYR-1544611439.us-east-1.elb.amazonaws.com/image/${name}.${extension}
      `;
    
    await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN_NAME,
      Subject: "Image Upload Notification FROM CHANGED LAMBDA CODE",
      Message: text,
    }));
    
    console.log(`Message ${record.body} sent to SNS topic`);
  }
  
  return records.lenght;
}
