import axios, { AxiosError, AxiosResponse } from 'axios'
import { AppDispatch } from 'src/redux/store'
import { formatURL, Params } from 'src/utils/urls'

type HttpMethodFunction = (
  url: string,
  options: GenObjType<any>,
  data?: any,
  ...args: any
) => Promise<AxiosResponse<any>>

interface HttpMethods {
  get: HttpMethodFunction
  post: HttpMethodFunction
  put: HttpMethodFunction
  delete: HttpMethodFunction
}

const getClient = (token: string | null = null): HttpMethods => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  }

  return {
    get: (url, options = {}) => axios.get(url, { ...defaultOptions, ...options }),
    post: (url, data, options = {}) => axios.post(url, data, { ...defaultOptions, ...options }),
    put: (url, data, options = {}) => axios.put(url, data, { ...defaultOptions, ...options }),
    delete: (url, options = {}) => axios.delete(url, { ...defaultOptions, ...options }),
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
  options: GenObjType<any>
  onSuccess?: (res: ApiClientResponse) => ApiClientResponse | void
  onFailure?: (res: ApiClientResponse) => ApiClientResponse | void
}

/**
 * Ensure onSuccess and onFailure return a ApiClientResponse object to have proper
 * handling in consumer components, and that everything is async.
 *
 * @param url - relative api endpoint url
 * @param method - HTTP method
 * @param types - object with three keys representing the different action types
 * @param options - object with potential data and query params
 * @param onSuccess - callback to run with the returned data, if any
 * @param onFailure - callback to run with the returned error, if any
 */
const apiClient =
  ({
    url,
    method,
    types: { REQUEST, SUCCESS, FAILURE },
    options: { data, params },
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

    const methodFunction = client[method as keyof HttpMethods]
    try {
      const res = await methodFunction(urlPath, data)
      dispatch({ type: SUCCESS, data: res.data })
      return onSuccess({ type: SUCCESS, ...res }) // return the given SUCCESS action type by default
    } catch (error: any) {
      // errors have the same structure but are returned as an error object
      console.log('ERROR in apiClient: ', error?.response?.data)

      dispatch({
        type: FAILURE,
        error: error?.response?.data?.detail ? error.response.data : error,
      })

      return onFailure({ type: FAILURE, status: error.status, error: error.response })
    }
  }

export default apiClient
