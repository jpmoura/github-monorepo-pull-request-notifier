export default interface BaseResponse {
  success: boolean;

  validationErrors?: Record<string, unknown>;
}
