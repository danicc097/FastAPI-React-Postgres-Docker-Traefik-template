import { SetStateAction } from 'react'
import { ROLE_PERMISSIONS } from 'src/utils/permissions'

/**
 * VERY simple email validation
 */
export function validateEmail(text: string): boolean {
  const domain = text.split('@')[1]
  return text?.indexOf('@') !== -1 && domain?.indexOf('.') !== -1
}

/**
 * Ensures password is of at least a certain length
 */
export function validatePassword(password: string): boolean {
  const minLength = 7
  return password?.length >= minLength
}

/**
 * Validate a generic string
 */
export function validateMessage(message: string): boolean {
  const minLength = 1
  return message?.length >= minLength
}

/**
 * Ensures a username consists of only letters, numbers, underscores, and dashes
 */
export function validateUsername(username: string): boolean {
  const minLength = 3
  return /^[a-zA-Z0-9_-]+$/.test(username) && username?.length >= minLength
}

/**
 * Ensures a price field matches the general format: 9.99 or 2199999.99
 */
export function validatePrice(price: string): boolean {
  return /^\d+\.\d{1,2}$/.test(String(price).trim())
}

/**
 * Validate user roles
 */
export function validateRole(role: string): boolean {
  return Object.keys(ROLE_PERMISSIONS).includes(role)
}

/**
 * Each key has a reusable validation function as value.
 * Keys must match the keys in the form for the validation to work.
 */
export const validationFunctions = {
  email: validateEmail,
  password: validatePassword,
  username: validateUsername,
  price: validatePrice,
  role: validateRole,
  message: validateMessage,
}

type validationFunction = keyof typeof validationFunctions

/**
 * Run validation function on input if it exists, else assume the input is valid
 */
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

/**
 * Handle input change and update form state accordingly
 * @param label key that maps to a validation function
 * @param value string to validate
 * @param formLabel specify form key to validate if it differs from validation function label
 * @param setForm function to set the form state
 * @param setErrors function to set the form errors state
 */
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

  if (errors.form) {
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

/**
 * Generic form error handler
 *
 * @param form form state
 * @param optionalFields fields that are optional and can be empty
 * @param setErrors function to set the form errors state
 */
export const validateFormBeforeSubmit = ({
  form,
  optionalFields,
  setErrors,
}: validateFormBeforeSubmitParams): boolean => {
  setErrors({})

  const _optionalFields = optionalFields || []

  // show individual errors for each field by using isInvalid prop
  Object.entries(form).forEach(([k, v]) => {
    if (!v && !_optionalFields.includes(k)) {
      setErrors((errors) => ({ ...errors, [k]: `${k} is required` }))
    }
  })

  // main form validation
  if (!Object.entries(form).every(([k, v]) => _optionalFields.includes(k) || Boolean(v) || v === null)) {
    setErrors((errors) => ({ ...errors, form: 'You must fill out all required fields' }))
    return false
  }
  return true
}
