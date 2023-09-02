export class HttpError extends Error {
  name: string;
  statusCode: number;

  constructor(message = '', statusCode = 400, name = 'Error', ...args: any) {
    super(message, ...args);
    this.message = message;
    this.statusCode = statusCode;
    this.name = name;
  }
}
