import * as AWS from 'aws-sdk';
import { IS_LOCAL } from './aws';

const DynamoDBDocumentClient = () => {
  if (IS_LOCAL) {
    return new AWS.DynamoDB.DocumentClient({
      region: `${process.env.AWS_REGION}`,
      endpoint: `${process.env.DYNAMO_PREFIX_ENDPOINT}`,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return new AWS.DynamoDB.DocumentClient();
};

export default DynamoDBDocumentClient;
