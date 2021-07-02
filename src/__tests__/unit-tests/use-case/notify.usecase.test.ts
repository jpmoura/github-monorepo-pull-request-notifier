import 'reflect-metadata';
import * as faker from 'faker';
import { mock, MockProxy } from 'jest-mock-extended';
import NotifyRequest from '../../../domain/interface/request/notify-request.interface';
import NotificationAction from '../../../domain/enum/notification-action.enum';
import { createNotificationInputDto, createSquad } from '../../util/util';
import IUseCaseAsync from '../../../domain/interface/use-case/use-case-async.interface';
import NotifyResponse from '../../../domain/interface/response/notify-response.interface';
import IRepository from '../../../domain/interface/infra/repository/repository.interface';
import Squad from '../../../domain/model/squad.model';
import IValidator from '../../../domain/interface/validator/validator.interface';
import IHttpClient from '../../../domain/interface/infra/client/http-client.interface';
import ILogger from '../../../domain/interface/infra/logger.interface';
import NotifyUseCase from '../../../use-case/notify.usecase';

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  headers['X-GitHub-Event'] = faker.random.word();
  headers[faker.random.word()] = faker.random.word();

  return headers;
}

function getSut(notifyRequestValidator: IValidator<NotifyRequest>, squadRepository: IRepository<Squad>, httpClient: IHttpClient): IUseCaseAsync<NotifyRequest, NotifyResponse> {
  return new NotifyUseCase(squadRepository, notifyRequestValidator, httpClient, mock<ILogger>());
}

function getMock<TInterface>(): MockProxy<TInterface> {
  return mock<TInterface>();
}

function getNotifyRequestValidatorMock(): MockProxy<IValidator<NotifyRequest>> {
  const mockedService = mock<IValidator<NotifyRequest>>();
  mockedService.validate.mockReturnValue({});
  return mockedService;
}

describe('notify', () => {
  it('request is not valid then should return unsuccessful response', async () => {
    expect.hasAssertions();

    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    notifyRequestValidatorMock.validate.mockReturnValue({ notification: { action: faker.lorem.sentence(), pull_request: faker.lorem.sentence() } });
    const squadRepositoryMock = getMock<IRepository<Squad>>();
    const httpClientMock = getMock<IHttpClient>();
    const request = {} as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeFalsy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).not.toHaveBeenCalled();
    expect(httpClientMock.post).not.toHaveBeenCalled();
  });

  it.each([
    [undefined],
    [null],
    [''],
    [' '],
    [faker.datatype.string()],
    [NotificationAction.Closed],
    [NotificationAction.ReviewRequested],
    [NotificationAction.Submitted],
    [NotificationAction.Synchronize],
  ])('notification action is %p then should return successful response without forwarding notification', async (action: any) => {
    expect.hasAssertions();

    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    const squadRepositoryMock = getMock<IRepository<Squad>>();
    const httpClientMock = getMock<IHttpClient>();
    const notification = createNotificationInputDto();
    notification.action = action;
    const request = {
      notification,
      headers: buildHeaders(),
    } as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeTruthy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).not.toHaveBeenCalled();
    expect(httpClientMock.post).not.toHaveBeenCalled();
  });

  it('notification action is "opened" and list returns empty array then should not forward notification and return successful response', async () => {
    expect.hasAssertions();

    const squadRepositoryMock = getMock<IRepository<Squad>>();
    squadRepositoryMock.list.mockResolvedValue([]);
    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    const httpClientMock = getMock<IHttpClient>();
    const request = {
      notification: createNotificationInputDto(NotificationAction.Opened, faker.git.branch()),
      headers: buildHeaders(),
    } as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeTruthy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).not.toHaveBeenCalled();
  });

  it('notification action is "opened" and list returns squads which filterToken does not match with branch prefix then should not forward notification and return successful response', async () => {
    expect.hasAssertions();

    const squadRepositoryMock = getMock<IRepository<Squad>>();
    squadRepositoryMock.list.mockResolvedValue([createSquad(), createSquad()]);
    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    const httpClientMock = getMock<IHttpClient>();
    const request = {
      notification: createNotificationInputDto(NotificationAction.Opened, faker.git.branch()),
      headers: buildHeaders(),
    } as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeTruthy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).not.toHaveBeenCalled();
  });

  it.each([
    ['master'],
    ['main'],
  ])('notification action is "opened" and head ref is %p and list returns squads which filterToken that does match with branch prefix and an error occur while forwarding notification then should return unsuccessful response', async (headRef: string) => {
    expect.hasAssertions();

    const filterToken = faker.random.word();
    const squadRepositoryMock = getMock<IRepository<Squad>>();
    squadRepositoryMock.list.mockResolvedValue([createSquad(), createSquad(filterToken)]);
    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    const httpClientMock = getMock<IHttpClient>();
    httpClientMock.post.mockRejectedValueOnce(new Error('Network error'));
    const request = {
      notification: createNotificationInputDto(NotificationAction.Opened, headRef, `${filterToken}/${faker.git.branch()}`),
      headers: buildHeaders(),
    } as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeFalsy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
  });

  it('notification action is "opened" and head ref is not master/main branch and list returns squads which filterToken that does match with branch prefix and an error occur while forwarding notification then should return unsuccessful response', async () => {
    expect.hasAssertions();

    const filterToken = faker.random.word();
    const squadRepositoryMock = getMock<IRepository<Squad>>();
    squadRepositoryMock.list.mockResolvedValue([createSquad(), createSquad(filterToken)]);
    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    const httpClientMock = getMock<IHttpClient>();
    httpClientMock.post.mockRejectedValueOnce(new Error('Network error'));
    const request = {
      notification: createNotificationInputDto(NotificationAction.Opened, `${filterToken}/${faker.git.branch()}`),
      headers: buildHeaders(),
    } as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeFalsy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['master'],
    ['main'],
  ])('notification action is "opened" and head ref is %p list returns squads which filterToken that does match with branch prefix then should forward notification to squad webhook and return successful response', async (headRef: string) => {
    expect.hasAssertions();

    const filterToken = faker.random.word();
    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    const squadRepositoryMock = getMock<IRepository<Squad>>();
    squadRepositoryMock.list.mockResolvedValue([createSquad(), createSquad(filterToken)]);
    const httpClientMock = getMock<IHttpClient>();

    const request = {
      notification: createNotificationInputDto(NotificationAction.Opened, headRef, `${filterToken}/${faker.git.branch()}`),
      headers: buildHeaders(),
    } as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeTruthy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
  });

  it('notification action is "opened" and head ref is not master/main branch and list returns squads which filterToken that does match with branch prefix then should forward notification to squad webhook and return successful response', async () => {
    expect.hasAssertions();

    const filterToken = faker.random.word();
    const notifyRequestValidatorMock = getNotifyRequestValidatorMock();
    const squadRepositoryMock = getMock<IRepository<Squad>>();
    squadRepositoryMock.list.mockResolvedValue([createSquad(), createSquad(filterToken)]);
    const httpClientMock = getMock<IHttpClient>();

    const request = {
      notification: createNotificationInputDto(NotificationAction.Opened, `${filterToken}/${faker.git.branch()}`),
      headers: buildHeaders(),
    } as NotifyRequest;

    const response = await getSut(notifyRequestValidatorMock, squadRepositoryMock, httpClientMock).execute(request);

    expect(response.success).toBeTruthy();
    expect(notifyRequestValidatorMock.validate).toHaveBeenCalledTimes(1);
    expect(squadRepositoryMock.list).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
  });
});
