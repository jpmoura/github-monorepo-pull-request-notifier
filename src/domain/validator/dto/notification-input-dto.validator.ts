import { Validator } from 'fluentvalidation-ts';
import NotificationInputDto from '../../dto/github/notification-input.dto';
import { isObject } from '../shared/util';

export default class NotificationInputDtoValidator extends Validator<NotificationInputDto> {
  constructor() {
    super();

    this.ruleFor('pull_request')
      .must(isObject)
      .notNull();
  }
}
