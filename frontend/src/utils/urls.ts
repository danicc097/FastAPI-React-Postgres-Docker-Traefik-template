export type Params = {
  [key: string]: string | number | Array<string | number>
}

export type ParamsArray = Array<[string, string | number]>

export const formatURLWithQueryParams = (base: string, params: Params) => {
  if (!params || Object.keys(params)?.length === 0) return base

  const query = Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => `${key}=${encodeURIComponent(item)}`).join('&')
      }
      return `${key}=${encodeURIComponent(value)}`
    })
    .join('&')

  return `${base}?${query}`
}

export const formatAPIPath = (path: string) => {
  let adjustedPath = path

  if (adjustedPath.charAt(0) !== '/') {
    adjustedPath = `/${adjustedPath}`
  }
  if (adjustedPath.charAt(adjustedPath.length - 1) !== '/') {
    adjustedPath += '/'
  }

  return adjustedPath
}

export const formatURL = (url: string, params: Params) => {
  const endpointPath = formatAPIPath(url)

  const baseUrl = import.meta.env.VITE_BACKEND_API
  console.log(`Using ${baseUrl}\n`)

  const fullURL = `${baseUrl}${endpointPath}`

  return formatURLWithQueryParams(fullURL, params)
}
