export default class BaseError extends Error {
  quickMessage: string
  constructor(message: string, friendlyMessage?: string) {
    super(message)
    this.quickMessage = friendlyMessage ?? message
    this.name = 'BaseError'
  }

  getMessage() {
    return `${this.name}: ${this.message}`
  }
}
