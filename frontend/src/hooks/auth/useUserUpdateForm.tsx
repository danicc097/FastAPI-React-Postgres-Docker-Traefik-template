import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { UserUpdateActionCreators } from 'src/redux/modules/userProfile/userProfile'
import { extractErrorMessages } from 'src/utils/errors'
import { validationFunctions } from 'src/utils/validation'

export const useUserUpdateForm = () => {
  const dispatch = useAppDispatch()
  const { authError } = useAuthenticatedUser()
  // define keys meant to be passed to API with original snake_case
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

  const getFormErrors = () => {
    const formErrors = []

    if (errors.form) {
      formErrors.push(errors.form)
    }

    if (hasSubmitted && (authErrorList.length || userProfileErrorList.length)) {
      // const additionalErrors = isLogin ? ['Invalid credentials. Please try again'] : authErrorList
      return formErrors.concat(authErrorList).concat(userProfileErrorList)
    }

    return formErrors
  }

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
