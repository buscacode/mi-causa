import BaseError from "./Base.error";

export class HttpRequestError extends BaseError{

  constructor(message: string, friendlyMessage?: string) {
    super(message, friendlyMessage)
    this.name = 'HttpRequestError'
  }
}
