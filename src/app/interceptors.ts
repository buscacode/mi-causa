import type {
  Config,
  InterceptorController,
  InterceptorQueue
} from './app.types'

export const generateInterceptor = <T = Config | Response>(): [
  InterceptorQueue<T>,
  InterceptorController<T>
] => {
  const interceptorQueue: InterceptorQueue<T> = []

  const interceptorController: InterceptorController<T> = {
    use: (callback, onErrorCallback) => {
      const id = interceptorQueue.push([callback, onErrorCallback])
      return id - 1
    },
    eject: (interceptorId: number) => {
      delete interceptorQueue[interceptorId]
    }
  }
  return [interceptorQueue, interceptorController]
}
