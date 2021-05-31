import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { inject, injectable } from 'inversify';
import NotificationInputDto from '../../domain/dto/github/notification-input.dto';
import IUseCaseAsync from '../../domain/interface/use-case/use-case-async.interface';
import NotifyRequest from '../../domain/interface/request/notify-request.interface';
import NotifyResponse from '../../domain/interface/response/notify-response.interface';
import responseBuilder from '../util/response-builder';
import Types from '../../cross-cutting/ioc/types';

@injectable()
export default class NotificationController {
  constructor(@inject(Types.NotifyUseCaseAsync) private readonly notifyUseCase: IUseCaseAsync<NotifyRequest, NotifyResponse>) { }

  async notify(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const notification = JSON.parse(event.body) as NotificationInputDto;

    const response = await this.notifyUseCase.execute({ notification, headers: event.headers });

    if (response.success) {
      return responseBuilder(undefined, 200);
    }

    return responseBuilder(response.validationErrors, 400);
  }
}
