import { ContainerModule, interfaces } from 'inversify';
import Types from '../../cross-cutting/ioc/types';
import IHttpClient from '../../domain/interface/infra/client/http-client.interface';
import ILogger from '../../domain/interface/infra/logger.interface';
import IRepository from '../../domain/interface/infra/repository/repository.interface';
import Squad from '../../domain/model/squad.model';
import HttpClient from '../client/http.client';
import Logger from '../logger';
import SquadRepository from '../repository/squad.repository';

const infraModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<IRepository<Squad>>(Types.SquadRepository).to(SquadRepository);
  bind<IHttpClient>(Types.HttpClient).to(HttpClient);
  bind<ILogger>(Types.Logger).to(Logger);
});

export default infraModule;
