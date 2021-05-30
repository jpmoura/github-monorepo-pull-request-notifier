/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import NotificationController from './controller/notification.controller';

const notificationController = new NotificationController();

export const notify: APIGatewayProxyHandler = (
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const response = await notificationController.notify(event);
    return response;
  }
);
