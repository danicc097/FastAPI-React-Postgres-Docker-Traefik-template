import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { schema } from 'src/types/schemaOverride'
import { extractErrorMessages } from 'src/utils/errors'
import { _getFormErrors } from 'src/utils/validation'

export const useLoginForm = () => {
  const navigate = useNavigate()
  const { user, authError, isLoading, isAuthenticated, requestUserLogin } = useAuthenticatedUser()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const authErrorList = extractErrorMessages(authError)

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
    requestUserLogin,
  }
}
