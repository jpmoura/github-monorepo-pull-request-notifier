import HeadDto from './head.dto';
import PullRequestState from '../../enum/pull-request-state.enum';

export default interface PullRequestDto {
  state: PullRequestState;

  head: HeadDto;
}
