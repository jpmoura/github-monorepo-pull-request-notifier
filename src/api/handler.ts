/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import container from '../cross-cutting/ioc/container';
import Types from '../cross-cutting/ioc/types';
import NotificationController from './controller/notification.controller';

export const notify: APIGatewayProxyHandler = (
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => container.get<NotificationController>(Types.NotificationController).notify(event)
);
