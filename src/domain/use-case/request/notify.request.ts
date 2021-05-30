import NotificationInputDto from '../../dto/github/notification-input.dto';

export default interface NotifyRequest {
  notification: NotificationInputDto;

  headers: Record<string, string>;
}
