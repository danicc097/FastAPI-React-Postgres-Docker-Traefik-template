import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { extractErrorMessages } from 'src/utils/errors'
import { _getFormErrors } from 'src/utils/validation'

/**
 *  handle LoginForm, RegistrationForm and ProfilePage update form
 */
export const useLoginForm = () => {
  const navigate = useNavigate()
  const { user, authError, isLoading, isAuthenticated, requestUserLogin } = useAuthenticatedUser()
  // define keys meant to be passed to API with original snake_case
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const authErrorList = extractErrorMessages(authError)

  /**
   * Retrieve form errors specific to the current form
   * form-specific errors should be set in its own form key
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
    requestUserLogin,
  }
}
