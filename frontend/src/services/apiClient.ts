import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { AppDispatch } from 'src/redux/store'
import { isSerializable } from 'src/utils/errors'
import { formatURL, Params } from 'src/utils/urls'

type HttpMethodFunctionParams = {
  url: string
  options: AxiosRequestConfig
  data?: any
}

type HttpMethodFunction = ({ url, options, data }: HttpMethodFunctionParams) => Promise<AxiosResponse<any>>

interface HttpMethods {
  get: HttpMethodFunction
  post: HttpMethodFunction
  put: HttpMethodFunction
  delete: HttpMethodFunction
}

const getClient = (token: string = null): HttpMethods => {
  // right now defaultOptions will be completely overwritten if any other headers are passed in
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const optionsOverride = {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
  return {
    get: ({ url, options = {} }) =>
      axios.get(url, {
        ...defaultOptions,
        ...{
          ...options,
          headers: {
            ...options.headers,
            ...(token ? optionsOverride.headers : {}),
          },
        },
      }),
    post: ({ url, data, options = {} }) =>
      axios.post(url, data, {
        ...defaultOptions,
        ...{
          ...options,
          headers: {
            ...options.headers,
            ...(token ? optionsOverride.headers : {}),
          },
        },
      }),
    put: ({ url, data, options = {} }) =>
      axios.put(url, data, {
        ...defaultOptions,
        ...{
          ...options,
          headers: {
            ...options.headers,
            ...(token ? optionsOverride.headers : {}),
          },
        },
      }),
    delete: ({ url, options = {} }) =>
      axios.delete(url, {
        ...defaultOptions,
        ...{
          ...options,
          headers: {
            ...options.headers,
            ...(token ? optionsOverride.headers : {}),
          },
        },
      }),
  }
}

type ApiClientResponse = {
  type?: string
  success?: boolean
  status?: number
  data?: any
  error?: any
}

type ApiClientType = {
  url: string
  method: 'get' | 'post' | 'put' | 'delete'
  types: { REQUEST: string; SUCCESS: string; FAILURE: string }
  options: AxiosRequestConfig
  onSuccess?: (res: ApiClientResponse & Partial<AxiosResponse>) => ApiClientResponse | void
  onFailure?: (res: ApiClientResponse & Partial<AxiosResponse>) => ApiClientResponse | void
}

type SimpleApiClientType = {
  url: string
  method: 'get' | 'post' | 'put' | 'delete'
  options: AxiosRequestConfig
}

const apiClient =
  ({
    url,
    method,
    types: { REQUEST, SUCCESS, FAILURE },
    options: { data, params, ...options },
    onSuccess = (res) => ({
      type: res.type,
      success: true,
      status: res.status,
      data: res.data,
    }),
    onFailure = (res) => ({
      type: res.type,
      success: false,
      status: res.status,
      error: res.error,
    }),
  }: ApiClientType) =>
  async (dispatch: AppDispatch) => {
    const token = localStorage.getItem('access_token')
    const client = getClient(token)

    dispatch({ type: REQUEST })

    const urlPath = formatURL(url, params)
    console.log(`[apiClient] ${method} ${urlPath}`)

    const methodFunction = client[method as keyof HttpMethods]
    try {
      const res = await methodFunction({ url: urlPath, options, data })

      return onSuccess({ type: SUCCESS, ...res })
    } catch (error: any) {
      console.log('ERROR in apiClient: ', error?.response?.data)

      // TODO handle some 401 errors from backend properly, currently yields unserializable error
      dispatch({
        type: FAILURE,
        error: isSerializable(error?.response?.data?.detail)
          ? error?.response?.data
          : isSerializable(error)
          ? error
          : 'Unserializable error',
      })

      return onFailure({ type: FAILURE, status: error.status, error: error.response })
    }
  }

export default apiClient

export async function simpleApiClient({
  url,
  method,
  options: { data, params, ...options },
}: SimpleApiClientType): Promise<AxiosResponse<any>> {
  const token = localStorage.getItem('access_token')
  const client = getClient(token)

  const urlPath = formatURL(url, params)
  console.log(`[apiClient] ${method} ${urlPath}`)

  const methodFunction = client[method as keyof HttpMethods]
  try {
    return await methodFunction({ url: urlPath, options, data })
  } catch (error: any) {
    console.log('ERROR in simpleApiClient: ', JSON.stringify(error))
    return error
  }
}
