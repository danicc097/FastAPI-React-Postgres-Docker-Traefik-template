import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiFieldPassword, EuiSpacer } from '@elastic/eui'
import React from 'react'

import { StyledLink } from 'src/components/StyledComponents/StyledComponents'
import { AuthActionType } from 'src/redux/modules/auth/auth'
import { handleInputChange, validateFormBeforeSubmit, validateInput } from 'src/utils/validation'
import { useLoginForm } from 'src/hooks/forms/useLoginForm'
import { LoginFormWrapper } from './LoginForm.styles'

export default function LoginForm() {
  const { form, setForm, errors, setErrors, isLoading, getFormErrors, setHasSubmitted, requestUserLogin } =
    useLoginForm()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = validateFormBeforeSubmit({ form, setErrors })
    if (!isValid) {
      return
    }

    setHasSubmitted(true)

    const action = await requestUserLogin({ email: form.email, password: form.password })

    if (action?.type !== AuthActionType.FETCHING_USER_FROM_TOKEN_SUCCESS) {
      setForm((form) => ({ ...form, password: '' }))
    }
  }
  return (
    <LoginFormWrapper>
      <EuiForm
        component="form"
        onSubmit={handleSubmit}
        isInvalid={Boolean(getFormErrors().length)}
        error={getFormErrors()}
      >
        <EuiFormRow
          label="Email"
          helpText="Enter the email associated with your account."
          isInvalid={Boolean(errors.email)}
          error="Please enter a valid email"
        >
          <EuiFieldText
            data-test-subj="email-input"
            icon="email"
            placeholder="user@mail.com"
            value={form.email}
            onChange={(e) => handleInputChange({ label: 'email', value: e.target.value, setForm, setErrors })}
            aria-label="Enter the email associated with your account"
            isInvalid={Boolean(errors.email)}
          />
        </EuiFormRow>
        <EuiFormRow
          label="Password"
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
        <EuiSpacer />
        <EuiButton type="submit" fill isLoading={isLoading} data-test-subj="login-submit">
          Submit
        </EuiButton>
      </EuiForm>
      <EuiSpacer size="xl" />
      <StyledLink to="/registration">Need an account? Sign up here.</StyledLink>
      <EuiSpacer size="xl" />
      <StyledLink to="/forgot-password">Forgot your password?</StyledLink>
    </LoginFormWrapper>
  )
}
