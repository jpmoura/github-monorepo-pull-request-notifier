import { APIGatewayProxyResult } from 'aws-lambda';

export default function buildResponse(body: any, statusCode: number, additionalHeaders?: { [header: string]: boolean | number | string }): APIGatewayProxyResult {
  const headers = {
    ...additionalHeaders,
    'Content-Type': 'application/json',
  };

  return {
    headers,
    statusCode,
    body: JSON.stringify(body),
  } as APIGatewayProxyResult;
}
