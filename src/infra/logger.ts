import { injectable } from 'inversify';
import { ILogObject, Logger as Tslog } from 'tslog';
import ILogger from '../domain/interface/infra/logger.interface';

@injectable()
export default class Logger implements ILogger {
  private readonly logger = new Tslog({
    type: 'json',
  });

  error(...args: unknown[]): ILogObject {
    return this.logger.error(args);
  }

  warn(...args: unknown[]): ILogObject {
    return this.logger.warn(args);
  }
}
