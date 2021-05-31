import {
  ContainerModule, interfaces,
} from 'inversify';
import Types from '../../cross-cutting/ioc/types';
import NotificationInputDto from '../dto/github/notification-input.dto';
import NotifyRequest from '../interface/request/notify-request.interface';
import IValidator from '../interface/validator/validator.interface';
import NotificationInputDtoValidator from '../validator/dto/notification-input-dto.validator';
import NotifyRequestValidator from '../validator/request/notify-request.validator';

const domainModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<IValidator<NotificationInputDto>>(Types.NotificationInputDtoValidator).to(NotificationInputDtoValidator);
  bind<IValidator<NotifyRequest>>(Types.NotifyRequestValidator).to(NotifyRequestValidator);
});

export default domainModule;
