import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { extractErrorMessages } from 'src/utils/errors'

export const useRegistrationForm = () => {
  const navigate = useNavigate()
  const { user, authError, isLoading, isAuthenticated, registerNewUser } = useAuthenticatedUser()
  // define keys meant to be passed to API with original snake_case
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })

  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

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

    if (hasSubmitted && authErrorList.length) {
      return formErrors.concat(authErrorList)
    }

    return formErrors
  }

  // if the user is already authenticated, redirect them to the profile page instead
  useEffect(() => {
    if (user?.email && isAuthenticated) {
      return navigate('/profile')
    }
  }, [user, navigate, isAuthenticated])

  return {
    form,
    setForm,
    errors,
    setErrors,
    isLoading,
    getFormErrors,
    hasSubmitted,
    setHasSubmitted,
    handlePasswordConfirmChange,

    registerNewUser,
  }
}
