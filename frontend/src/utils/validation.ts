import { SetStateAction } from 'react'
import { ROLE_PERMISSIONS } from 'src/services/permissions'

export function validateEmail(text: string): boolean {
  const domain = text.split('@')[1]
  return text?.indexOf('@') !== -1 && domain?.indexOf('.') !== -1
}

export function validatePassword(password: string): boolean {
  const minLength = 7
  return password?.length >= minLength
}

export function validateMessage(message: string): boolean {
  const minLength = 1
  return message?.length >= minLength
}

export function validateUsername(username: string): boolean {
  const minLength = 3
  return /^[a-zA-Z0-9_-]+$/.test(username) && username?.length >= minLength
}

export function validatePrice(price: string): boolean {
  return /^\d+\.\d{1,2}$/.test(String(price).trim())
}

export function validateRole(role: string): boolean {
  return Object.keys(ROLE_PERMISSIONS).includes(role)
}

export const validationFunctions = {
  email: validateEmail,
  password: validatePassword,
  username: validateUsername,
  price: validatePrice,
  role: validateRole,
  message: validateMessage,
}

type validationFunction = keyof typeof validationFunctions

export const validateInput = (label: string, value: string): boolean => {
  return validationFunctions[label] ? validationFunctions[label](value) : true
}

interface handleInputChangeParams {
  label: validationFunction
  value: string
  formLabel?: string
  setForm: SetStateAction<any>
  setErrors: SetStateAction<any>
}

export const handleInputChange = ({ label, value, formLabel, setForm, setErrors }: handleInputChangeParams) => {
  const isValid = validateInput(label, value)

  setForm((form) => ({ ...form, [formLabel || label]: value }))
  setErrors((errors) => ({ ...errors, [formLabel || label]: !isValid }))
}

export function _getFormErrors(
  form: any,
  errors: FormErrors<typeof form>,
  hasSubmitted: boolean,
  ...errorLists: Array<Array<unknown>>
) {
  const formErrors = []

  if (errors?.form) {
    formErrors.push(errors.form)
  }

  if (hasSubmitted && errorLists.some((list) => list.length)) {
    return formErrors.concat(errorLists.flat())
  }

  return formErrors
}

type validateFormBeforeSubmitParams = {
  form: any
  setErrors: SetStateAction<any>
  optionalFields?: Array<string>
}

export const validateFormBeforeSubmit = ({
  form,
  optionalFields,
  setErrors,
}: validateFormBeforeSubmitParams): boolean => {
  setErrors({})

  const _optionalFields = optionalFields || []

  Object.entries(form).forEach(([k, v]) => {
    if (!v && !_optionalFields.includes(k)) {
      setErrors((errors) => ({ ...errors, [k]: `${k} is required` }))
    }
  })

  if (!Object.entries(form).every(([k, v]) => _optionalFields.includes(k) || !!v)) {
    setErrors((errors) => ({ ...errors, form: 'You must fill out all required fields' }))
    return false
  }
  return true
}
