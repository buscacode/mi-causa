import type { Action } from './enums/http.enums'
import type { HttpResponseError } from './errors'

export type RequestTransformer<R> = (data: R, headers: Headers) => R
export type ResponseTransformer<R> = (data: R) => R

export type create = () => void
export type HttpData =
  | string
  | FormData
  | null
  | Record<string, string | number | null | undefined | Record<string, unknown>>
  | BodyInit

export interface Config {
  method?: Action
  baseURL?: string
  headers: Headers
  params?: Record<string, string>
  data?: HttpData
  signal?: AbortSignal
  cache?: RequestCache
  //body?: BodyInit
}

export interface RequestConfig
  extends Partial<Omit<Config, 'method' | 'data' | 'headers'>> {
  headers?: Headers | Record<string, string>
}

export interface InitialConfig
  extends Partial<Omit<Config, 'method' | 'headers'>> {
  headers?: Headers | Record<string, string>
}

export type InterceptorCb<T> = (data: T) => T | Promise<T>

export type InterceptorErrorCb = (error: HttpResponseError) => HttpResponseError
export type InterceptorQueue<T> = Array<
  [InterceptorCb<T> | undefined | null, InterceptorErrorCb | undefined | null]
>

export interface InterceptorController<T = Config | Response> {
  use: (
    callback?: InterceptorCb<T> | null,
    onErrorCallback?: InterceptorErrorCb | null
  ) => number
  eject: (interceptorId: number) => void
}
export interface Interceptors {
  request: InterceptorController<Config>
  response: InterceptorController<Response>
}

export interface HttpInstance {
  get: (url: string, config?: RequestConfig) => Promise<Response>
  post: (
    url: string,
    data?: HttpData,
    config?: RequestConfig
  ) => Promise<Response>
  put: (
    url: string,
    data?: HttpData,
    config?: RequestConfig
  ) => Promise<Response>
  patch: (
    url: string,
    data?: HttpData,
    config?: RequestConfig
  ) => Promise<Response>
  delete: (url: string, config?: RequestConfig) => Promise<Response>
  interceptors: Interceptors
}
