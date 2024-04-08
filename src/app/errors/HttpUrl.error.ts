import BaseError from "./Base.error"

export default class HttpUrlError extends BaseError {
  constructor(message: string, friendlyMessage?: string) {
    super(message, friendlyMessage)
    this.name = 'HttpUrlError'
  }
}