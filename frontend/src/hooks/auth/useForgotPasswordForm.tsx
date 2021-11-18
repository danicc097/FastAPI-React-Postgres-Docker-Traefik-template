import { SetStateAction, useEffect, useState } from 'react'
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
  }
}
