import axios from 'axios';
import { ValidationErrors } from 'fluentvalidation-ts/dist/ValidationErrors';
import { Logger } from 'tslog';
import NotificationInputDto from '../domain/dto/github/notification-input.dto';
import NotificationAction from '../domain/enum/notification-action.enum';
import Squad from '../domain/model/squad.model';
import NotifyRequest from '../domain/use-case/request/notify.request';
import NotifyResponse from '../domain/use-case/response/notify.response';
import NotifyRequestValidator from '../domain/validator/request/notify-request.validator';
import SquadRepository from '../infra/repository/squad.repository';

export default class NotifyUseCase {
  private readonly squadRepository = new SquadRepository();

  private readonly validator = new NotifyRequestValidator();

  private readonly logger = new Logger({
    name: 'NotifyUseCase',
    type: 'json',
  });

  private static getPullRequestBranchPrefix(notification: NotificationInputDto): string {
    const [branchPrefix] = notification.pull_request.head.ref.split('/');
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

  private static async sendNotification(notification: NotificationInputDto, webhook: string, headers: Record<string, string>): Promise<void> {
    const gitHubHeaders = NotifyUseCase.getOnlyGitHubHeaders(headers);

    await axios.post(webhook, notification, {
      headers: gitHubHeaders,
    });
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
      await NotifyUseCase.sendNotification(request.notification, squadToNotify.webhook, request.headers);
    } catch (error) {
      this.logger.error('Error while forwarding notification to squad webhook', request, squadToNotify, error);
      return NotifyUseCase.buildResponse(false);
    }

    return NotifyUseCase.buildResponse();
  }
}
