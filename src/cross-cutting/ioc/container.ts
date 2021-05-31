import 'reflect-metadata';
import { Container } from 'inversify';
import apiModule from '../../api/installer/api.installer';
import infraModule from '../../infra/installer/infra.installer';
import useCaseModule from '../../use-case/installer/use-case.installer';
import domainModule from '../../domain/installer/domain.installer';

const container = new Container({ skipBaseClassChecks: true });
container.load(domainModule, infraModule, useCaseModule, apiModule);

export default container;
