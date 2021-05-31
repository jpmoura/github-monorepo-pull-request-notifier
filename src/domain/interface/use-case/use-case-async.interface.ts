export default interface IUseCaseAsync<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}
