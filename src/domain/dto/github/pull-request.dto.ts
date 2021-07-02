import HeadDto from './head.dto';
import PullRequestState from '../../enum/pull-request-state.enum';
import BaseDto from './base.dto';

export default interface PullRequestDto {
  state: PullRequestState;

  head: HeadDto;

  base: BaseDto;
}
