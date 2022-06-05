import { SetStateAction, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { AuthActionCreators } from 'src/redux/modules/auth/auth'
import { schema } from 'src/types/schemaOverride'
import { extractErrorMessages } from 'src/utils/errors'
import { _getFormErrors } from 'src/utils/validation'

export const useForgotPasswordForm = () => {
  const dispatch = useAppDispatch()

  const [form, setForm] = useState<schema['CreatePasswordResetRequestParams']>({
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)

  const pwdResetError = useAppSelector((state) => state.auth.pwdResetError)
  const pwdResetErrorList = extractErrorMessages(pwdResetError)

  const getFormErrors = () => _getFormErrors(form, errors, hasSubmitted, pwdResetErrorList)

  const requestPasswordReset = ({ email, message }) =>
    dispatch(AuthActionCreators.requestPasswordReset({ email, message }))

  return {
    form,
    setForm,
    errors,
    setErrors,
    getFormErrors,
    hasSubmitted,
    requestPasswordReset,
    setHasSubmitted,
  }
}
