import 'reflect-metadata';
import { mock } from 'jest-mock-extended';
import NotificationInputDto from '../../../domain/dto/github/notification-input.dto';
import IValidator from '../../../domain/interface/validator/validator.interface';
import NotifyRequestValidator from '../../../domain/validator/request/notify-request.validator';
import NotifyRequest from '../../../domain/interface/request/notify-request.interface';

function getSut(): NotifyRequestValidator {
  const notificationInputDtoValidatorMock = mock<IValidator<NotificationInputDto>>();
  return new NotifyRequestValidator(notificationInputDtoValidatorMock);
}

describe('validates NotifyRequest', () => {
  describe('notification is %p then should return validation error', () => {
    it.each([
      [undefined],
      [null],
      [''],
      [' '],
    ])('notification property is %p then should return validation error', (notification: unknown) => {
      expect.hasAssertions();

      const notifyRequest = {
        notification,
      } as NotifyRequest;

      const response = getSut().validate(notifyRequest);

      expect(response).toHaveProperty('notification');
    });
  });

  it('notification property is valid then should return empty object', () => {
    expect.hasAssertions();

    const notifyRequest = {
      notification: {},
    } as NotifyRequest;

    const response = getSut().validate(notifyRequest);

    expect(response).toStrictEqual({});
  });
});
