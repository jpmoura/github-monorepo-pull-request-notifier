import { Validator } from 'fluentvalidation-ts';
import { inject, injectable } from 'inversify';
import NotifyRequest from '../../interface/request/notify-request.interface';
import { isObject } from '../shared/util';
import NotificationInputDto from '../../dto/github/notification-input.dto';
import IValidator from '../../interface/validator/validator.interface';
import Types from '../../../cross-cutting/ioc/types';

@injectable()
export default class NotifyRequestValidator extends Validator<NotifyRequest> implements IValidator<NotifyRequest> {
  constructor(@inject(Types.NotificationInputDtoValidator) private readonly notificationInputDtoValidator: IValidator<NotificationInputDto>) {
    super();

    this.ruleFor('notification')
      .notNull()
      .must(isObject)
      .setValidator(() => this.notificationInputDtoValidator);
  }
}
