import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import NotificationInputDto from '../../domain/dto/github/notification-input.dto';
import NotifyUseCase from '../../use-case/notify.usecase';
import responseBuilder from '../util/response-builder';

export default class NotificationController {
  private readonly notifyUseCase = new NotifyUseCase();

  async notify(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const notification = JSON.parse(event.body) as NotificationInputDto;

    const response = await this.notifyUseCase.execute({ notification, headers: event.headers });

    if (response.success) {
      return responseBuilder(undefined, 200);
    }

    return responseBuilder(response.validationErrors, 400);
  }
}
