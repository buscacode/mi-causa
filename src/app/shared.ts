import { Config, HttpData } from "src/app.types"
import { doesExist } from "./utils"
import { HttpRequestError } from "./errors/HttpRequest.error"
import HttpUrlError from "./errors/HttpUrl.error"


export const mergeConfig = (initialConfig: Config, newConfig: Config) => {
  const { headers: initialHeaders, params: initialParams, ...initialRest } = initialConfig
  const { headers: newHeaders, params: newParams, ...newRest } = newConfig

  const returnConfig: Config = {
    ...initialRest,
    ...newRest,
    headers: doesExist(initialHeaders, newHeaders)? {
      ...initialHeaders,
      ...newHeaders
    } : undefined,
    params: doesExist(initialParams, newParams)? {
      ...initialParams,
      ...newParams
    } : undefined
  }
  return returnConfig
}


export const defineBody = (httpData?: HttpData | null): string | undefined => {
  if(httpData === undefined || httpData === null) return undefined;

  if(typeof httpData === 'string') return httpData

  try {
    return JSON.stringify(httpData)
  } catch (error) {
    throw new HttpRequestError('Error while trying to convert the data to body request.')
  }
}


export const formatUrl = (url: string, urlBase?: string): string => {
  const isString = typeof url === 'string';
  if (!isString){
    //return url;
    throw new HttpUrlError('Only string is allowed as url')
  }

  const hasProtocol = url.startsWith("http://") || url.startsWith("https://");
  if (hasProtocol) return url;

  if(!urlBase) return url

  if(!urlBase.startsWith("http")) throw new HttpUrlError('baseURL should be a complete base url.')

  const endpoint = url.startsWith('/') ? url.slice(1) : url;
  const base = urlBase?.endsWith('/') ? urlBase : `${urlBase}/`;

  try {
    return new URL(endpoint, base).toString();
  } catch (error: any) {
    throw new HttpUrlError(error.message, 'Not possible to generate Url endpoint.')
  }
};


/*
  TODO
  se puede implementar algún callback para personalizar el armado del query params cuando
  algún campo de paramsObj sea Array u ojeo
*/
export const formatQueryParams = (paramsObj?: Record<string,string>) => {
  if(!paramsObj) return ''
  if(Array.isArray(paramsObj)) throw new HttpUrlError('params should be object: Record<string,string> not Array')

  const searchParams = new URLSearchParams(paramsObj);
  return searchParams.toString()
}
