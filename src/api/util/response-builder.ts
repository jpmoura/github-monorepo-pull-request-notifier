import { APIGatewayProxyResult } from 'aws-lambda';

export default function buildResponse(body: any, statusCode: number, additionalHeaders?: { [header: string]: boolean | number | string }): APIGatewayProxyResult {
  const headers = {
    ...additionalHeaders,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  return {
    headers,
    statusCode,
    body: JSON.stringify(body),
  } as APIGatewayProxyResult;
}
