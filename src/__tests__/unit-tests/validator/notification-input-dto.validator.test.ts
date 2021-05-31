import 'reflect-metadata';
import * as faker from 'faker';
import NotificationInputDto from '../../../domain/dto/github/notification-input.dto';
import NotificationAction from '../../../domain/enum/notification-action.enum';
import NotificationInputDtoValidator from '../../../domain/validator/dto/notification-input-dto.validator';
import { toArray } from '../../util/util';

const sut = new NotificationInputDtoValidator();

describe('validates NotificationInputDto', () => {
  describe('notificationInputDto is invalid', () => {
    it.each([
      [undefined],
      [null],
      [''],
      [' '],
    ])('pull_request property is %p then should return validation error', (pull_request: unknown) => {
      expect.hasAssertions();

      const notificationInputDto = {
        action: faker.random.arrayElement(toArray(NotificationAction)),
        pull_request,
      } as NotificationInputDto;

      const response = sut.validate(notificationInputDto);

      expect(response).toHaveProperty('pull_request');
    });
  });

  it('notificationInputDto is valid then should return empty object', () => {
    expect.hasAssertions();

    const notificationInputDto = {
      action: faker.random.arrayElement(toArray(NotificationAction)),
      pull_request: {},
    } as NotificationInputDto;

    const response = sut.validate(notificationInputDto);

    expect(response).toStrictEqual({});
  });
});
