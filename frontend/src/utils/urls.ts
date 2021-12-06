export type Params = {
  [key: string]: string | number
}
/**
 * Formats API request URLs
 *
 * @param base - url string representing api endpoint without query params
 * @param params - query params to format and append to end of url
 */
export const formatURLWithQueryParams = (base: string, params: Params) => {
  if (!params || Object.keys(params)?.length === 0) return base

  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')

  //   let query = '';
  //   for (const [key, value] of Object.entries(params)) {
  //     query += `&${key}=${encodeURIComponent(value)}`;
  //   }

  return `${base}?${query}`
}

/**
 *  Format API request paths
 *
 * @param path - relative path to api endpoint
 */
export const formatAPIPath = (path: string) => {
  let adjustedPath = path

  // bookend path with forward slashes
  if (adjustedPath.charAt(0) !== '/') {
    adjustedPath = `/${adjustedPath}`
  }
  if (adjustedPath.charAt(adjustedPath.length - 1) !== '/') {
    adjustedPath += '/'
  }

  return adjustedPath
}

/**
 * Formats API request URLs
 *
 * @param url - url string representing relative path to api endpoint
 * @param params - query params to format at end of url
 *
 * @example const pathToEndpoint = formatURL(`/search/cleanings`, { searchTerm: "house", price: 9.99 })
  // -> http://localhost:8000/api/search/cleanings/?searchTerm=house&price=9.99
 */
export const formatURL = (url: string, params: Params) => {
  const endpointPath = formatAPIPath(url)

  const baseUrl = process.env.REACT_APP_REMOTE_SERVER_URL
  console.log(`NOW USING ${baseUrl} for any url\n`)

  const fullURL = `${baseUrl}${endpointPath}`

  return formatURLWithQueryParams(fullURL, params)
}

// const pathToEndpoint = formatURL('/search/cleanings', { searchTerm: 'house', price: 9.99 });
// console.log('pathToEndpoint: ', pathToEndpoint);

/**
 * Formats API request to FormData
 */
export const formDataEncode = (form) => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(form)) {
    formData.append(key, value as any)
  }

  return formData
}
