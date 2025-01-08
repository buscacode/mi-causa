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

export interface Config {
  method?: Action
  baseURL?: string
  headers?: Record<string, string>
  params?: Record<string, string>
  data?: HttpData
  signal?: AbortSignal
  cache?: RequestCache
  //body?: BodyInit
}

export type InterceptorCb<T> = (data: T) => T

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
  get: (
    url: string,
    config?: Omit<Config, 'method' | 'data'>
  ) => Promise<Response>
  post: (
    url: string,
    data?: HttpData,
    config?: Omit<Config, 'method' | 'data'>
  ) => Promise<Response>
  put: (
    url: string,
    data?: HttpData,
    config?: Omit<Config, 'method' | 'data'>
  ) => Promise<Response>
  patch: (
    url: string,
    data?: HttpData,
    config?: Omit<Config, 'method' | 'data'>
  ) => Promise<Response>
  delete: (
    url: string,
    config?: Omit<Config, 'method' | 'data'>
  ) => Promise<Response>
  interceptors: Interceptors
}
