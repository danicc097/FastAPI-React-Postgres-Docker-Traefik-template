import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { AuthActionCreators } from 'src/redux/modules/auth/auth'
import { extractErrorMessages } from 'src/utils/errors'
import { validationFunctions } from 'src/utils/validation'

/**
 *  handle LoginForm, RegistrationForm and ProfilePage update form
 */
export const useForgotPasswordForm = () => {
  const dispatch = useAppDispatch()
  // define keys meant to be passed to API with original snake_case
  // camelCase ones are UI only
  const [form, setForm] = useState({
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<GenObjType<any>>({})
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)

  const error = useAppSelector((state) => state.auth.pwdResetError)
  const pwdResetErrorList = extractErrorMessages(error)

  const validateInput = (label: string, value: string) => {
    // grab validation function and run it on input if it exists
    // if it doesn't exist, just assume the input is valid
    const isValid = validationFunctions?.[label] ? validationFunctions?.[label]?.(value) : true
    // set an error if the validation function did NOT return true
    setErrors((errors) => ({ ...errors, [label]: !isValid }))
  }

  /**
   *
   * @param label name of the function to run the value against
   * @param value string to validate
   * @param formLabel form field to validate if it differs from label
   */
  const handleInputChange = (label: string, value: string, formLabel = '') => {
    validateInput(label, value)

    setForm((form) => ({ ...form, [formLabel || label]: value }))
  }

  const getFormErrors = () => {
    const formErrors = []

    if (errors.form) {
      formErrors.push(errors.form)
    }

    if (pwdResetErrorList.length) {
      return formErrors.concat(pwdResetErrorList)
    }

    return formErrors
  }

  const requestPasswordReset = ({ email, message }) =>
    dispatch(AuthActionCreators.requestPasswordReset({ email, message }))

  return {
    form,
    setForm,
    error,
    errors,
    setErrors,
    getFormErrors,
    hasSubmitted,
    requestPasswordReset,
    setHasSubmitted,
    handleInputChange,
    validateInput,
  }
}
