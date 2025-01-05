import type { Action } from './app/enums/http.enums'
export type { HttpInstance } from './app/http'

export type RequestTransformer<R> = (data: R, headers: Headers) => R
export type ResponseTransformer<R> = (data: R) => R

export type create = () => void
export type HttpData =
  | string
  | Record<string, string | number | null | undefined | Record<string, unknown>>

export interface Config {
  method?: Action
  baseURL?: string
  headers?: Record<string, string>
  params?: Record<string, string>
  data?: HttpData
  //body?: BodyInit
}

// interface HttpInstance {
//   get: (url:string, config:Config) => Promise<Response>
// }
