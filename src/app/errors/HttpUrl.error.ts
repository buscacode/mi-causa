import BaseError from "./Base.error"

export class HttpUrlError extends BaseError {
  constructor(message: string, friendlyMessage?: string) {
    super(message, friendlyMessage)
    this.name = 'HttpUrlError'
  }
}
