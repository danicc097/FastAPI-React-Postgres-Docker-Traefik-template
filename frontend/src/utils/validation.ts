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
export function validatePassword(password: string, length = 7): boolean {
  return password?.length >= length
}

/**
 * Ensures password is of at least a certain length
 */
export function validateMessage(message: string, length = 2): boolean {
  return message?.length >= length
}

/**
 * Ensures a username consists of only letters, numbers, underscores, and dashes
 */
export function validateUsername(username: string, length = 3): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(username) && username?.length >= length
}

/**
 * Ensures a price field matches the general format: 9.99 or 2199999.99
 */
export function validatePrice(price: string): boolean {
  return /^\d+\.\d{1,2}$/.test(String(price).trim())
}

/**
 * We export validation functions with keys that match the name of the input field
 * in a form, e.g. old_password is a form's key as well.
 */
const functions = {
  email: validateEmail,
  message: validateMessage,
  password: validatePassword,
  old_password: validatePassword,
  username: validateUsername,
  price: validatePrice,
}

export default functions
