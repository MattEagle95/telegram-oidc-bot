export class BotError extends Error {
  constructor(message = '', ...args: any) {
    super(message, ...args);
    this.message = message;
  }
}
