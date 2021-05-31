import axios from 'axios';
import { injectable } from 'inversify';
import IHttpClient from '../../domain/interface/infra/client/http-client.interface';

@injectable()
export default class HttpClient implements IHttpClient {
  private readonly client = axios;

  async post<TResponse>(url: string, body: unknown, headers: Record<string, string>): Promise<TResponse> {
    const response = await this.client.post<TResponse>(url, body, {
      headers,
    });

    return response.data;
  }
}
