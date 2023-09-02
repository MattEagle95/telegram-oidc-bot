export class BadRequestError extends Error {
  name = 'BadRequestError';
  statusCode = 400;

  constructor(message = '', ...args: any) {
    super(message, ...args);
    this.message = message;
  }
}
