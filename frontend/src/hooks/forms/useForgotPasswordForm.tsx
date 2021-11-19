import { SetStateAction, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { AuthActionCreators } from 'src/redux/modules/auth/auth'
import { extractErrorMessages } from 'src/utils/errors'
import { _getFormErrors } from 'src/utils/validation'

export const useForgotPasswordForm = () => {
  const dispatch = useAppDispatch()
  // define keys meant to be passed to API with original snake_case
  const [form, setForm] = useState({
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)

  const error = useAppSelector((state) => state.auth.pwdResetError)
  const pwdResetErrorList = extractErrorMessages(error)

  /**
   * Retrieve form errors specific to the current form
   * form-specific errors should be set in its own form key
   */
  const getFormErrors = () => _getFormErrors(form, errors, hasSubmitted, pwdResetErrorList)

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
  }
}
