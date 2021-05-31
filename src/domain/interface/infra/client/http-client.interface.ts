export default interface IHttpClient {
  post<TResponse>(url: string, body: unknown, headers: Record<string, string>): Promise<TResponse>;
}
