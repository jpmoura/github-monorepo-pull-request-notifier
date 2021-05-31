import { Validator } from 'fluentvalidation-ts';
import { injectable } from 'inversify';
import NotificationInputDto from '../../dto/github/notification-input.dto';
import IValidator from '../../interface/validator/validator.interface';
import { isObject } from '../shared/util';

@injectable()
export default class NotificationInputDtoValidator extends Validator<NotificationInputDto> implements IValidator<NotificationInputDto> {
  constructor() {
    super();

    this.ruleFor('pull_request')
      .must(isObject)
      .notNull();
  }
}
