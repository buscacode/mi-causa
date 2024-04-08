import { HttpResponseError } from "./errors/HttpResponse.error";
import { Action } from "./enums/http.enums";
import { defineBody, formatQueryParams, formatUrl, mergeConfig } from "./shared";
import { Config, HttpData } from "src/app.types";

const defaultConfig: Config = {
  method: Action.GET,
  headers: {
    "Content-Type": "application/json"
  },
}

const fetchHttp = async (url: string, config?: Config) => {
  const fetchUrl = formatUrl(url, config?.baseURL)
  const fetchParams = formatQueryParams(config?.params)
  const urlFull = fetchParams ? `${fetchUrl}?${fetchParams}` : fetchUrl
  const bodyData = defineBody(config?.data)

  const fetchInit: RequestInit = {
    body: bodyData,
    headers: config?.headers,
    method: config?.method,
  }

  try {
    const response = await fetch(urlFull, fetchInit)
    if (!response.ok) {
      throw new HttpResponseError(response.statusText, response);
    }
    return response;
  } catch (error) {
    throw error
  }
}

export interface HttpInstance {
  get: (url: string, config?: Omit<Config, 'method' | 'data'> ) => Promise<Response>
  post: (url: string, data?: HttpData, config?: Omit<Config, 'method' | 'data'> ) => Promise<Response>
  put: (url: string, data?: HttpData, config?: Omit<Config, 'method' | 'data'> ) => Promise<Response>
  patch: (url: string, data?: HttpData, config?: Omit<Config, 'method' | 'data'> ) => Promise<Response>
  delete: (url: string, config?: Omit<Config, 'method' | 'data'> ) => Promise<Response>
}

export function create(config: Config): HttpInstance {

  const currentConfig = mergeConfig(defaultConfig, config)

  return {
    get: async (url, config? ) => {
      const fetchConfig: Config = {
        ...currentConfig,
        method: Action.GET
      }
      return fetchHttp(url, fetchConfig)
    },
    post: async (url, data?: HttpData, config? ) => {
      const fetchConfig: Config = {
        ...currentConfig,
        method: Action.POST,
        data
      }
      return fetchHttp(url, fetchConfig)
    },
    put: async (url, data?: HttpData, config? ) => {
      const fetchConfig: Config = {
        ...currentConfig,
        method: Action.PUT,
        data
      }
      return fetchHttp(url, fetchConfig)
    },
    patch: async (url, data?: HttpData, config? ) => {
      const fetchConfig: Config = {
        ...currentConfig,
        method: Action.PATCH,
        data
      }
      return fetchHttp(url, fetchConfig)
    },
    delete: async (url, config? ) => {
      const fetchConfig: Config = {
        ...currentConfig,
        method: Action.DELETE,
      }
      return fetchHttp(url, fetchConfig)
    }
  }
}
