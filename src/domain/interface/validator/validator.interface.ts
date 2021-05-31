import { ValidationErrors } from 'fluentvalidation-ts/dist/ValidationErrors';

export default interface IValidator<TModel> {
  validate(value: TModel): ValidationErrors<TModel>;
}
