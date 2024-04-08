
const USER_TOKEN = process.env.NEXT_PUBLIC_USER_TOKEN
const API_BASE = process.env.NEXT_PUBLIC_API_BASE

const fetchWrapper2 = ((originalFetch: typeof fetch) => {
  return (...args: Parameters<typeof fetch>) => {

    const result = originalFetch.apply(originalFetch, args);
    return result.then(() => {
      console.log('Request was sent');
      return result; // Returning the result to maintain the original behavior
    });
  };
})(fetch);

const renderInput = (url: URL | RequestInfo): URL | RequestInfo => {
  const isString = typeof url === 'string';

  if (!isString) {
    return url;
  }

  const hasProtocol = url.startsWith("http://") || url.startsWith("https://");
  if (hasProtocol) return url;

  const endpoint = url.startsWith('/') ? url.slice(1) : url;
  const base = API_BASE?.endsWith('/') ? API_BASE : `${API_BASE}/`;


  try {
    return new URL(endpoint, base).toString();
  } catch (error) {
    console.warn(`Error al armar la URL: ${base} - ${endpoint}`);
    return url;
  }
};

const fetchWrapper = async (input: URL | RequestInfo, init?: RequestInit | undefined) => {
  const TOKEN = USER_TOKEN
  const BEARER_TOKEN = `Bearer ${TOKEN}`
  const defaultHeaders: HeadersInit  = {
    'Authorization': BEARER_TOKEN
  }
  //The parameters to set in fetch
  const inputToRequest = renderInput(input)
  let initBase: RequestInit = init || {}

  //Set default configurations
  if(!init){
    initBase.method = 'GET'
  }

  if(initBase.headers){
    initBase.headers = {
      ...defaultHeaders,
      ...initBase.headers,
    }
  } else {
    initBase.headers = defaultHeaders
  }


  try {
    const response = await fetch(inputToRequest, initBase);
    if (!response.ok) {
      throw new Error(`Network response was not OK: ${response.status} - ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error("Error catched in fetch: ", error);
    throw error
  }
};

export const http = fetchWrapper
