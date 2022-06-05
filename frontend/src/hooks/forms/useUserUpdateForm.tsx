import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { UserUpdateActionCreators } from 'src/redux/modules/userProfile/userProfile'
import { extractErrorMessages } from 'src/utils/errors'
import { validationFunctions, _getFormErrors } from 'src/utils/validation'

export const useUserUpdateForm = () => {
  const dispatch = useAppDispatch()
  const { authError } = useAuthenticatedUser()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    old_password: '',
  })
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const userProfileError = useAppSelector((state) => state.userProfile?.error)
  const userProfileErrorList = extractErrorMessages(userProfileError)

  const authErrorList = extractErrorMessages(authError)

  const handlePasswordConfirmChange = (value: string) => {
    setErrors((errors) => ({
      ...errors,
      passwordConfirm: form.password !== value ? 'Passwords do not match' : null,
    }))

    setForm((form) => ({ ...form, passwordConfirm: value }))
  }

  const getFormErrors = () => _getFormErrors(form, errors, hasSubmitted, authErrorList, userProfileErrorList)

  const updateUser = ({ email, username, password, old_password }) =>
    dispatch(UserUpdateActionCreators.requestUserUpdate({ email, username, password, old_password }))

  return {
    form,
    setForm,
    errors,
    setErrors,
    getFormErrors,
    hasSubmitted,
    setHasSubmitted,
    updateUser,
    handlePasswordConfirmChange,
  }
}
