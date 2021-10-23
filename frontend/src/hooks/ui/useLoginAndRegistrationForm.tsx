import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { UserUpdateActions, UserUpdateActionsParamsType } from 'src/redux/userProfile'
import { extractErrorMessages } from 'src/utils/errors'
import validation from 'src/utils/validation'

/**
 *  handle LoginForm, RegistrationForm and ProfilePage update form
 */
export const useLoginAndRegistrationForm = ({ isLogin = false, isUpdate = false }: GenObjType<boolean>) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, authError, isLoading, isAuthenticated, requestUserLogin, registerNewUser } = useAuthenticatedUser()
  // define keys meant to be passed to API with original snake_case
  // camelCase ones are UI only
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    ...(isUpdate && { old_password: '' }), // userUpdate specific field
  })
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)
  const [errors, setErrors] = useState<GenObjType<any>>({})
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)

  const userProfileError = useAppSelector((state) => state.userProfile?.error)

  const authErrorList = extractErrorMessages(authError)
  const userProfileErrorList = extractErrorMessages(userProfileError)

  const validateInput = (label: string, value: string) => {
    // grab validation function and run it on input if it exists
    // if it doesn't exist, just assume the input is valid
    const isValid = validation?.[label] ? validation?.[label]?.(value) : true
    // set an error if the validation function did NOT return true
    setErrors((errors) => ({ ...errors, [label]: !isValid }))
  }

  /**
   *
   * @param label name of the function to run the value against
   * @param value string to validate
   */
  const handleInputChange = (label: string, value: string) => {
    validateInput(label, value)

    setForm((form) => ({ ...form, [label]: value }))
  }

  const handlePasswordConfirmChange = (value: string) => {
    setErrors((errors) => ({
      ...errors,
      passwordConfirm: form.password !== value ? 'Passwords do not match.' : null,
    }))

    setForm((form) => ({ ...form, passwordConfirm: value }))
  }

  const getFormErrors = () => {
    const formErrors = []

    if (errors.form) {
      formErrors.push(errors.form)
    }

    if (hasSubmitted && (authErrorList.length || userProfileErrorList.length)) {
      // const additionalErrors = isLogin ? ['Invalid credentials. Please try again.'] : authErrorList
      return formErrors.concat(authErrorList).concat(userProfileErrorList)
    }

    return formErrors
  }

  const updateUser = ({ email, username, password, old_password }: UserUpdateActionsParamsType) =>
    dispatch(UserUpdateActions.requestUserUpdate({ email, username, password, old_password }))

  // if the user is already authenticated, redirect them to the "/profile" page
  useEffect(() => {
    if (user?.email && isAuthenticated) {
      return navigate('/profile')
    }
  }, [user, navigate, isAuthenticated])

  return {
    form: isUpdate
      ? {
          email: form.email,
          username: form.username,
          password: form.password,
          old_password: form.old_password,
        }
      : isLogin
      ? { email: form.email, password: form.password, username: null, passwordConfirm: null }
      : form,
    setForm,
    errors,
    setErrors,
    isLoading,
    getFormErrors,
    hasSubmitted,
    setHasSubmitted,
    handleInputChange,
    validateInput,
    agreedToTerms,
    updateUser,
    setAgreedToTerms,
    handlePasswordConfirmChange,
    requestUserLogin,
    registerNewUser,
  }
}
