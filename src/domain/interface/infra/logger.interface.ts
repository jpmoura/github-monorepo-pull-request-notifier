import { ILogObject } from 'tslog';

export default interface ILogger {
  error(...args: Array<unknown>): ILogObject;

  warn(...args: Array<unknown>): ILogObject;
}
