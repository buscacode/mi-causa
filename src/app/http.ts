import type {
  Config,
  HttpData,
  InterceptorQueue,
  Interceptors,
  RequestConfig
} from 'src/app/app.types'
import type { HttpInstance } from './app.types'
import { Action } from './enums/http.enums'
import { HttpResponseError } from './errors/HttpResponse.error'
import { generateInterceptor } from './interceptors'
import { defineBody, formatQueryParams, formatUrl, mergeConfig } from './shared'

const defaultHeader = new Headers()
defaultHeader.append('content-type', 'application/json')
const defaultConfig: Config = {
  method: Action.GET,
  headers: defaultHeader
}

const fetchHttp = async (
  url: string,
  config: Config,
  requestInterceptorQueue: InterceptorQueue<Config>,
  responseInterceptorQueue: InterceptorQueue<Response>
) => {
  const newConfig = await requestInterceptorQueue.reduce(
    async (promise, fnArr) => {
      const calculatedConfig = await promise
      const fn = fnArr[0]
      if (!fn) return calculatedConfig
      return fn(calculatedConfig)
    },
    Promise.resolve(config)
  )

  const fetchUrl = formatUrl(url, newConfig.baseURL)
  const fetchParams = formatQueryParams(newConfig.params)

  const fetchUrlObject = new URL(fetchUrl)
  const urlSearchParams = new URLSearchParams(fetchUrlObject.search)
  const newUrlSearchParams = new URLSearchParams(fetchParams)
  const mergedUrlSearchParams = new URLSearchParams([
    ...urlSearchParams,
    ...newUrlSearchParams
  ])
  const fullSearchParamsString = mergedUrlSearchParams.toString()
  const fullUrlBaseAndPath = fetchUrlObject.origin + fetchUrlObject.pathname
  const urlFull = fullSearchParamsString
    ? `${fullUrlBaseAndPath}?${fullSearchParamsString}`
    : fullUrlBaseAndPath

  const bodyData = defineBody(newConfig.data)

  const fetchInit: RequestInit = {
    body: bodyData,
    headers: newConfig.headers,
    method: newConfig.method,
    signal: newConfig.signal,
    cache: newConfig.cache
  }

  const response = await fetch(urlFull, fetchInit)
  if (!response.ok) {
    const error = new HttpResponseError(response.statusText, response)
    const newError = await responseInterceptorQueue.reduce(
      (calculatedError, fnArr) => {
        const fn = fnArr[1]
        if (fn === undefined || fn === null) return calculatedError
        return fn(calculatedError)
      },
      error
    )

    throw newError
  }
  return response
}

export function createHttp(config: RequestConfig): HttpInstance {
  const currentConfig = mergeConfig(defaultConfig, config)

  const [requestInterceptors, requestInterceptorController] =
    generateInterceptor<Config>()
  const [responseInterceptors, responseInterceptorController] =
    generateInterceptor<Response>()

  const interceptors: Interceptors = {
    request: requestInterceptorController,
    response: responseInterceptorController
  }

  return {
    get: async (url, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.GET
      }
      return fetchHttp(
        url,
        fetchConfig,
        requestInterceptors,
        responseInterceptors
      )
    },
    post: async (url, data?: HttpData, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.POST,
        data
      }
      return fetchHttp(
        url,
        fetchConfig,
        requestInterceptors,
        responseInterceptors
      )
    },
    put: async (url, data?: HttpData, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.PUT,
        data
      }
      return fetchHttp(
        url,
        fetchConfig,
        requestInterceptors,
        responseInterceptors
      )
    },
    patch: async (url, data?: HttpData, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.PATCH,
        data
      }
      return fetchHttp(
        url,
        fetchConfig,
        requestInterceptors,
        responseInterceptors
      )
    },
    delete: async (url, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.DELETE
      }
      return fetchHttp(
        url,
        fetchConfig,
        requestInterceptors,
        responseInterceptors
      )
    },
    interceptors
  }
}
