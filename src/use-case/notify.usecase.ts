import { ValidationErrors } from 'fluentvalidation-ts/dist/ValidationErrors';
import { inject, injectable } from 'inversify';
import NotificationInputDto from '../domain/dto/github/notification-input.dto';
import NotificationAction from '../domain/enum/notification-action.enum';
import IUseCaseAsync from '../domain/interface/use-case/use-case-async.interface';
import Squad from '../domain/model/squad.model';
import NotifyRequest from '../domain/interface/request/notify-request.interface';
import NotifyResponse from '../domain/interface/response/notify-response.interface';
import Types from '../cross-cutting/ioc/types';
import IRepository from '../domain/interface/infra/repository/repository.interface';
import IValidator from '../domain/interface/validator/validator.interface';
import IHttpClient from '../domain/interface/infra/client/http-client.interface';
import ILogger from '../domain/interface/infra/logger.interface';

@injectable()
export default class NotifyUseCase implements IUseCaseAsync<NotifyRequest, NotifyResponse> {
  constructor(
    @inject(Types.SquadRepository) private readonly squadRepository: IRepository<Squad>,
    @inject(Types.NotifyRequestValidator) private readonly validator: IValidator<NotifyRequest>,
    @inject(Types.HttpClient) private readonly httpClient: IHttpClient,
    @inject(Types.Logger) private readonly logger: ILogger,
  ) { }

  private static getPullRequestBranchPrefix(notification: NotificationInputDto): string {
    let prop: string = 'head';

    if (notification.pull_request.head.ref === 'master' || notification.pull_request.head.ref === 'main') {
      prop = 'base';
    }

    const [branchPrefix] = notification.pull_request[prop].ref.split('/');

    return branchPrefix;
  }

  private static getSquadFromBranchPrefix(branchPrefix: string, squads: Array<Squad>): Squad | undefined {
    return squads.find((squad) => branchPrefix.includes(squad.filterToken));
  }

  private static getOnlyGitHubHeaders(originalHeaders: Record<string, string>): Record<string, string> {
    const gitHubHeaders: Record<string, string> = {};

    Object.keys(originalHeaders).forEach((originalHeader) => {
      if (originalHeader.includes('X-GitHub')) {
        gitHubHeaders[originalHeader] = originalHeaders[originalHeader];
      }
    });

    return gitHubHeaders;
  }

  private async sendNotification(notification: NotificationInputDto, webhook: string, headers: Record<string, string>): Promise<void> {
    const gitHubHeaders = NotifyUseCase.getOnlyGitHubHeaders(headers);
    await this.httpClient.post(webhook, notification, gitHubHeaders);
  }

  private static buildResponse(wasSuccessful: boolean = true, validationErrors: ValidationErrors<NotifyRequest> | undefined = undefined): NotifyResponse {
    return {
      success: wasSuccessful,
      validationErrors,
    };
  }

  private validate(request: NotifyRequest): NotifyResponse | undefined {
    const validationErrors = this.validator.validate(request);

    if (Object.keys(validationErrors).length > 0) {
      return NotifyUseCase.buildResponse(false, validationErrors);
    }

    return undefined;
  }

  async execute(request: NotifyRequest): Promise<NotifyResponse> {
    const invalidRequestResponse = this.validate(request);

    if (invalidRequestResponse) {
      return invalidRequestResponse;
    }

    if (request.notification.action !== NotificationAction.Opened) {
      this.logger.warn('This event wil be ignored because is not a open pull request notification', request);
      return NotifyUseCase.buildResponse();
    }

    const branchPrefix = NotifyUseCase.getPullRequestBranchPrefix(request.notification);
    const squads = await this.squadRepository.list();
    const squadToNotify = NotifyUseCase.getSquadFromBranchPrefix(branchPrefix, squads);

    if (!squadToNotify) {
      this.logger.warn('No squad found for branch prefix', branchPrefix, squads, request);
      return NotifyUseCase.buildResponse();
    }

    try {
      await this.sendNotification(request.notification, squadToNotify.webhook, request.headers);
    } catch (error) {
      this.logger.error('Error while forwarding notification to squad webhook', request, squadToNotify, error);
      return NotifyUseCase.buildResponse(false);
    }

    return NotifyUseCase.buildResponse();
  }
}
