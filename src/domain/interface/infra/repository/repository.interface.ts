export default interface IRepository<TModel> {
  list(): Promise<Array<TModel>>;
}
