import { useUserForms } from 'src/hooks/auth/useUserForms'
import {
  EuiButton,
  EuiCheckbox,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiFieldPassword,
  EuiSpacer,
  htmlIdGenerator,
} from '@elastic/eui'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import React from 'react'
import { StyledLink } from 'src/components/StyledComponents/StyledComponents'
import { AuthActionType } from 'src/redux/modules/auth/auth'
import { handleInputChange, validateInput } from 'src/utils/validation'

const RegistrationFormWrapper = styled.div`
  padding: 2rem;
  max-width: 400px;
`

export default function RegistrationForm() {
  const [isDisabled, setIsDisabled] = React.useState(false)

  const {
    form,
    setForm,
    errors,
    setErrors,
    isLoading,
    getFormErrors,
    setHasSubmitted,
    registerNewUser,
    handlePasswordConfirmChange,
  } = useUserForms({ isLogin: false })

  const handleSubmit = async function handleSubmit(e: any) {
    e.preventDefault()

    setErrors({})

    // if any input hasn't been entered in, return early
    if (!Object.values(form).every((value) => Boolean(value))) {
      setErrors((errors) => ({ ...errors, form: 'You must fill out all fields' }))
      return
    }

    setHasSubmitted(true)
    const action = await registerNewUser({
      username: form.username,
      email: form.email,
      password: form.password,
    })
    // our onSuccess function must return type: res.type
    if (action?.type === AuthActionType.REQUEST_USER_SIGN_UP_SUCCESS) {
      setErrors({})
      setForm((form) => ({ ...form, username: '', email: '', password: '', passwordConfirm: '' }))
      setIsDisabled(true)
    } else {
      setForm((form) => ({ ...form, password: '', passwordConfirm: '' }))
    }
  }

  return (
    <RegistrationFormWrapper data-test-subj="registration-form">
      <EuiForm
        component="form"
        onSubmit={handleSubmit}
        isInvalid={Boolean(getFormErrors().length)}
        error={getFormErrors()}
        name="Registration form"
      >
        <EuiFormRow
          label="Email"
          helpText="Enter the email associated with your account."
          isInvalid={Boolean(errors.email)}
          error="Please enter a valid email"
        >
          <EuiFieldText
            icon="email"
            data-test-subj="email-input"
            placeholder="user@mail.com"
            value={form.email}
            onChange={(e) => handleInputChange({ label: 'email', value: e.target.value, setForm, setErrors })}
            aria-label="Enter the email associated with your account"
            isInvalid={Boolean(errors.email)}
          />
        </EuiFormRow>

        <EuiFormRow
          label="Username"
          helpText="Choose a username consisting solely of letters, numbers, underscores, and dashes."
          isInvalid={Boolean(errors.username)}
          error="Please enter a valid username"
        >
          <EuiFieldText
            icon="user"
            data-test-subj="username-input"
            placeholder="your_username"
            value={form.username}
            onChange={(e) => handleInputChange({ label: 'username', value: e.target.value, setForm, setErrors })}
            aria-label="Choose a username consisting of letters, numbers, underscores, and dashes"
            isInvalid={Boolean(errors.username)}
          />
        </EuiFormRow>

        <EuiFormRow
          label="Enter password"
          helpText="Enter your password."
          isInvalid={Boolean(errors.password)}
          error="Password must be at least 7 characters"
        >
          <EuiFieldPassword
            placeholder="Password"
            data-test-subj="password-input"
            value={form.password}
            onChange={(e) => handleInputChange({ label: 'password', value: e.target.value, setForm, setErrors })}
            type="dual"
            aria-label="Enter your password"
            isInvalid={Boolean(errors.password)}
          />
        </EuiFormRow>
        <EuiFormRow
          label="Confirm password"
          helpText="Confirm your password."
          isInvalid={Boolean(errors.passwordConfirm)}
          error="Passwords must match"
        >
          <EuiFieldPassword
            placeholder="Confirm password"
            data-test-subj="password-confirm-input"
            value={form.passwordConfirm}
            onChange={(e) => handlePasswordConfirmChange(e.target.value)}
            type="dual"
            aria-label="Confirm your password"
            isInvalid={Boolean(errors.passwordConfirm)}
          />
        </EuiFormRow>
        <EuiSpacer />
        <EuiButton
          type="submit"
          isLoading={isLoading}
          isDisabled={isDisabled}
          fill
          aria-label="Sign up"
          role="button"
          data-test-subj="registration-submit"
        >
          Sign Up
        </EuiButton>
      </EuiForm>

      <EuiSpacer size="xl" />

      <StyledLink to="/login">Already have an account? Log in here.</StyledLink>
    </RegistrationFormWrapper>
  )
}
