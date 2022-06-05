import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { schema } from 'src/types/schemaOverride'
import { extractErrorMessages } from 'src/utils/errors'
import { _getFormErrors } from 'src/utils/validation'

export const useRegistrationForm = () => {
  const navigate = useNavigate()
  const { user, authError, isLoading, isAuthenticated, registerNewUser } = useAuthenticatedUser()

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

  const getFormErrors = () => _getFormErrors(form, errors, hasSubmitted, authErrorList)

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
