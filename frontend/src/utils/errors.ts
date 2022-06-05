import { schema } from 'src/types/schemaOverride'

type errorFieldToMessageMappingTypes = {
  [key: string]: string
}

export const isSerializable = (obj: any) => {
  try {
    JSON.stringify(obj)
    return true
  } catch (e) {
    return false
  }
}

export const errorFieldToMessageMapping: errorFieldToMessageMappingTypes = {
  email: 'Invalid email',
  username: 'Invalid username',
  password: 'Invalid password',
  sender_: 'Invalid sender',
  receiver_role: 'Invalid receiver role',
  title: 'Invalid title',
  body: 'Invalid body',
  label: 'Invalid label',
  link: 'Invalid link',
}

export const parseErrorDetail = (errorDetail: schema['ValidationError']): string => {
  let errorMessage = ''

  if (Array.isArray(errorDetail?.loc)) {
    if (errorDetail.loc[0] === 'path') return errorMessage

    if (errorDetail.loc[0] === 'query') return errorMessage

    if (errorDetail.loc[0] === 'body') {
      const invalidField: string = errorDetail.loc[2]

      if (errorFieldToMessageMapping[invalidField]) {
        errorMessage = errorFieldToMessageMapping[invalidField]
        if (errorDetail?.msg) {
          errorMessage += `: ${errorDetail.msg}`
        }
      }
    }
  } else {
    errorMessage = 'Something unknown went wrong. Contact support.\n'
  }

  return errorMessage
}

export const extractErrorMessages = (error: schema['HTTPValidationError']): unknown[] => {
  const errorList: unknown[] = []

  if (typeof error === 'string') errorList.push(error)

  if (typeof error?.detail === 'string') {
    errorList.push(error.detail === 'Not Found' ? 'Internal Server Error' : error.detail)
  }

  if (Array.isArray(error?.detail)) {
    error.detail.forEach((errorDetail) => {
      const errorMessage = parseErrorDetail(errorDetail)
      errorList.push(errorMessage)
    })
  }

  return errorList
}
