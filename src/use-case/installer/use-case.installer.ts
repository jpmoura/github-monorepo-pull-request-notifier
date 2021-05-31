import { ContainerModule, interfaces } from 'inversify';
import Types from '../../cross-cutting/ioc/types';
import NotifyRequest from '../../domain/interface/request/notify-request.interface';
import NotifyResponse from '../../domain/interface/response/notify-response.interface';
import IUseCaseAsync from '../../domain/interface/use-case/use-case-async.interface';
import NotifyUseCase from '../notify.usecase';

const useCaseModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<IUseCaseAsync<NotifyRequest, NotifyResponse>>(Types.NotifyUseCaseAsync).to(NotifyUseCase);
});

export default useCaseModule;
