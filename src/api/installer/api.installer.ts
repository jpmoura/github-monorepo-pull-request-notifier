import { ContainerModule, interfaces } from 'inversify';
import Types from '../../cross-cutting/ioc/types';
import NotificationController from '../controller/notification.controller';

const apiModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<NotificationController>(Types.NotificationController).to(NotificationController);
});

export default apiModule;
