import type { Config, HttpData } from 'src/app/app.types'
import { Action } from './enums/http.enums'
import { HttpResponseError } from './errors/HttpResponse.error'
import { defineBody, formatQueryParams, formatUrl, mergeConfig } from './shared'

const defaultConfig: Config = {
  method: Action.GET,
  headers: {
    'Content-Type': 'application/json'
  }
}

const fetchHttp = async (url: string, config?: Config) => {
  const fetchUrl = formatUrl(url, config?.baseURL)
  const fetchParams = formatQueryParams(config?.params)

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
  const bodyData = defineBody(config?.data)

  const fetchInit: RequestInit = {
    body: bodyData,
    headers: config?.headers,
    method: config?.method,
    signal: config?.signal,
    cache: config?.cache
  }

  const response = await fetch(urlFull, fetchInit)
  if (!response.ok) {
    throw new HttpResponseError(response.statusText, response)
  }
  return response
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
}

export function createHttp(config: Config): HttpInstance {
  const currentConfig = mergeConfig(defaultConfig, config)

  return {
    get: async (url, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.GET
      }
      return fetchHttp(url, fetchConfig)
    },
    post: async (url, data?: HttpData, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.POST,
        data
      }
      return fetchHttp(url, fetchConfig)
    },
    put: async (url, data?: HttpData, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.PUT,
        data
      }
      return fetchHttp(url, fetchConfig)
    },
    patch: async (url, data?: HttpData, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.PATCH,
        data
      }
      return fetchHttp(url, fetchConfig)
    },
    delete: async (url, config = {}) => {
      const fetchConfig: Config = {
        ...currentConfig,
        ...mergeConfig(currentConfig, config),
        method: Action.DELETE
      }
      return fetchHttp(url, fetchConfig)
    }
  }
}
