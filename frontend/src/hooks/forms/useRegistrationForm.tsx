import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { schema } from 'src/types/schema_override'
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

  /**
   * Retrieve form errors specific to the current form.
   * Form-specific errors should be set in its own form key
   */
  const getFormErrors = () => _getFormErrors(form, errors, hasSubmitted, authErrorList)

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
