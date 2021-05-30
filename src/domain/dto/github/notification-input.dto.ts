import NotificationAction from '../../enum/notification-action.enum';
import PullRequestDto from './pull-request.dto';

export default interface NotificationInputDto {
  action: NotificationAction;

  pull_request: PullRequestDto;
}
