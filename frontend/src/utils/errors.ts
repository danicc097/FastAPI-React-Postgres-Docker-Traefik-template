/*
This file will be responsible for parsing the error message sent back by our FastAPI
server and ensuring that we have a standardized format to display on the client side.

quick and dirty error parser that is taking the place of writing a custom error
handler in our FastAPI backend.
We're saving that for a future refactor...
*/

import { schema } from 'src/types/schema_override'

type errorFieldToMessageMappingTypes = {
  [key: string]: string
}

export const errorFieldToMessageMapping: errorFieldToMessageMappingTypes = {
  email: 'Please enter a valid email',
  username: 'Please enter a username consisting of only letters, numbers, underscores, and dashes',
  password: 'Please choose a password with at least 7 characters',
}

export const parseErrorDetail = (errorDetail: schema['ValidationError']): string => {
  let errorMessage = 'Something went wrong. Contact support.\n'

  if (Array.isArray(errorDetail?.loc)) {
    // error with a path parameter and probably isn't a client issue
    if (errorDetail.loc[0] === 'path') return errorMessage
    // error with a query parameter and also is probably not the client's fault
    if (errorDetail.loc[0] === 'query') return errorMessage
    // because we use FastAPI's `Body(..., embed)` for all post requests
    // this should be an array of length 3, with shape: ["body", "new_user", "email"]
    if (errorDetail.loc[0] === 'body') {
      const invalidField: string = errorDetail.loc[2]

      if (errorFieldToMessageMapping[invalidField]) {
        errorMessage = errorFieldToMessageMapping[invalidField]
      } else if (errorDetail?.msg) {
        errorMessage = errorDetail.msg
      }
    }
  }

  return errorMessage
}

export const extractErrorMessages = (error: schema['HTTPValidationError']): unknown[] => {
  const errorList: unknown[] = []

  // if we just pass in a string, use that
  if (typeof error === 'string') errorList.push(error)

  // in case that we raised the error ourselves with FastAPI's HTTPException,
  // just use the message passed from the backend.
  if (typeof error?.detail === 'string') {
    errorList.push(error.detail === 'Not Found' ? 'Internal Server Error' : error.detail)
  }

  // in case that there's a validation error in the request body, path parameters, or query parameters
  // we'll get an array of error issues here:
  if (Array.isArray(error?.detail)) {
    error.detail.forEach((errorDetail) => {
      const errorMessage = parseErrorDetail(errorDetail)
      errorList.push(errorMessage)
    })
  }

  return errorList
}
