import { Validator } from 'fluentvalidation-ts';
import NotifyRequest from '../../use-case/request/notify.request';
import NotificationInputDtoValidator from '../dto/notification-input-dto.validator';
import { isObject } from '../shared/util';

export default class NotifyRequestValidator extends Validator<NotifyRequest> {
  private readonly notificationInputDtoValidator = new NotificationInputDtoValidator();

  constructor() {
    super();

    this.ruleFor('notification')
      .notNull()
      .must(isObject)
      .setValidator(() => this.notificationInputDtoValidator);
  }
}
