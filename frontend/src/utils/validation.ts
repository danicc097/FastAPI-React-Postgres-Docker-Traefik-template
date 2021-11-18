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
 * @example
 * // assume input is valid if there's no validation function
 * const isValid = functions[formLabel] ? functions[formLabel]?.(formValue) : true
 */
export const validationFunctions = {
  email: validateEmail,
  password: validatePassword,
  username: validateUsername,
  price: validatePrice,
  role: validateRole,
  message: validateMessage,
}
