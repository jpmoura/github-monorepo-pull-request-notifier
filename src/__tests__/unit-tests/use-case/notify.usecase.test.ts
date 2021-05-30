/* eslint-disable jest/no-hooks */
import axios from 'axios';
import * as faker from 'faker';
import { Logger } from 'tslog';
import { mocked } from 'ts-jest/utils';
import NotifyUseCase from '../../../use-case/notify.usecase';
import NotifyRequest from '../../../domain/use-case/request/notify.request';
import NotificationAction from '../../../domain/enum/notification-action.enum';
import { createNotificationInputDto, createSquad } from '../../util/util';

jest.mock('axios');

const listSquadRepositoryMock = jest.fn();
jest.mock('../../../infra/repository/squad.repository', () => jest.fn().mockImplementation(() => ({
  list: listSquadRepositoryMock,
})));

const logger = mocked(Logger, true);
jest.spyOn(logger.prototype, 'error').mockImplementation();
jest.spyOn(logger.prototype, 'warn').mockImplementation();

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  headers['X-GitHub-Event'] = faker.random.word();
  headers[faker.random.word()] = faker.random.word();

  return headers;
}

const mockedAxios = axios as jest.Mocked<typeof axios>;
const sut = new NotifyUseCase();

describe('notify', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('request is invalid', () => {
    it.each([
      [undefined],
      [null],
      [NaN],
      [faker.datatype.number()],
      [faker.datatype.string()],
    ])('pull_request is %p then should return unsuccessful response with validation errors', async (pullRequest: any) => {
      expect.hasAssertions();

      const notification = createNotificationInputDto();
      notification.pull_request = pullRequest;
      const request = {
        notification,
        headers: buildHeaders(),
      } as NotifyRequest;

      const response = await sut.execute(request);

      expect(response.success).toBeFalsy();
      expect(listSquadRepositoryMock).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('request is valid', () => {
    it.each([
      [undefined],
      [null],
      [''],
      [faker.random.word()],
      [NotificationAction.Closed],
      [NotificationAction.ReviewRequested],
      [NotificationAction.Submitted],
      [NotificationAction.Synchronize],
    ])('notification action is %p then should return successful response without forwarding notification', async (action: any) => {
      expect.hasAssertions();

      const request = {
        notification: createNotificationInputDto(action),
        headers: buildHeaders(),
      } as NotifyRequest;

      const response = await sut.execute(request);

      expect(response.success).toBeTruthy();
      expect(listSquadRepositoryMock).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('notification action is "opened" and list returns empty array then should not forward notification and return successful response', async () => {
      expect.hasAssertions();

      listSquadRepositoryMock.mockResolvedValue([]);
      const request = {
        notification: createNotificationInputDto(NotificationAction.Opened, faker.git.branch()),
        headers: buildHeaders(),
      } as NotifyRequest;

      const response = await sut.execute(request);

      expect(response.success).toBeTruthy();
      expect(listSquadRepositoryMock).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('notification action is "opened" and list returns squads which filterToken does not match with branch prefix then should not forward notification and return successful response', async () => {
      expect.hasAssertions();

      listSquadRepositoryMock.mockResolvedValue([createSquad(), createSquad()]);
      const request = {
        notification: createNotificationInputDto(NotificationAction.Opened, faker.git.branch()),
        headers: buildHeaders(),
      } as NotifyRequest;

      const response = await sut.execute(request);

      expect(response.success).toBeTruthy();
      expect(listSquadRepositoryMock).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('notification action is "opened" and list returns squads which filterToken does match with branch prefix and an error occur while forwarding notification then should return unsuccessful response', async () => {
      expect.hasAssertions();

      const filterToken = faker.random.word();
      listSquadRepositoryMock.mockResolvedValue([createSquad(), createSquad(filterToken)]);
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
      const request = {
        notification: createNotificationInputDto(NotificationAction.Opened, `${filterToken}/${faker.git.branch()}`),
        headers: buildHeaders(),
      } as NotifyRequest;

      const response = await sut.execute(request);

      expect(response.success).toBeFalsy();
      expect(listSquadRepositoryMock).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('notification action is "opened" and list returns squads which filterToken does match with branch prefix then should forward notification to squad webhook and return successful response', async () => {
      expect.hasAssertions();

      const filterToken = faker.random.word();
      listSquadRepositoryMock.mockResolvedValue([createSquad(), createSquad(filterToken)]);
      const request = {
        notification: createNotificationInputDto(NotificationAction.Opened, `${filterToken}/${faker.git.branch()}`),
        headers: buildHeaders(),
      } as NotifyRequest;

      const response = await sut.execute(request);

      expect(response.success).toBeTruthy();
      expect(listSquadRepositoryMock).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });
});
