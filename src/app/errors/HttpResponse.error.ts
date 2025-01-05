import BaseError from './Base.error'

export class HttpResponseError extends BaseError {
  response: Response

  constructor(message: string, response: Response, friendlyMessage?: string) {
    super(message, friendlyMessage)
    this.name = 'HttpResponseError'
    this.response = response
  }
}
