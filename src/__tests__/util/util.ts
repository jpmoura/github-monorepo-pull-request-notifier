/* eslint-disable import/prefer-default-export */
import * as faker from 'faker';
import NotificationInputDto from '../../domain/dto/github/notification-input.dto';
import NotificationAction from '../../domain/enum/notification-action.enum';
import PullRequestState from '../../domain/enum/pull-request-state.enum';
import Squad from '../../domain/model/squad.model';

function toArray<T>(collection: T): Array<any> {
  return Object.values(collection);
}

export function createNotificationInputDto(action?: NotificationAction, ref?: string): NotificationInputDto {
  return {
    action: action ?? faker.random.arrayElement(toArray(NotificationAction)),
    pull_request: {
      head: {
        ref: ref ?? faker.git.branch(),
      },
      state: faker.random.arrayElement(toArray(PullRequestState)),
    },
  };
}

export function createSquad(filterToken?: string): Squad {
  return {
    filterToken: filterToken ?? faker.random.word(),
    id: faker.random.word(),
    webhook: faker.internet.url(),
  };
}
