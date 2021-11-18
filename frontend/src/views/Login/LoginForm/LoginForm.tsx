import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { useUserForms } from 'src/hooks/auth/useUserForms'
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiFieldPassword, EuiSpacer } from '@elastic/eui'
import styled from 'styled-components'
import React from 'react'

import { StyledLink } from 'src/components/StyledComponents/StyledComponents'
import { AuthActionType } from 'src/redux/modules/auth/auth'
import { handleInputChange, validateInput } from 'src/utils/validation'

const LoginFormWrapper = styled.div`
  padding: 2rem;
  max-width: 400px;
`

export default function LoginForm() {
  // destructure the needed values from the hook's return
  const { form, setForm, errors, setErrors, isLoading, getFormErrors, setHasSubmitted, requestUserLogin } =
    useUserForms({ isLogin: true })

  // don't forget async...
  const handleSubmit = async (e) => {
    e.preventDefault()

    // if any input hasn't been entered in, return early
    if (!Object.values(form).every((value) => Boolean(value) || value === null)) {
      setErrors((errors) => ({ ...errors, form: 'You must fill out all fields' }))
      return
    }
    setHasSubmitted(true)

    const action = await requestUserLogin({ email: form.email, password: form.password })

    // reset the password form state if the login attempt is not successful
    if (action?.type !== AuthActionType.FETCHING_USER_FROM_TOKEN_SUCCESS) {
      setForm((form) => ({ ...form, password: '' }))
    }
  }
  return (
    <LoginFormWrapper>
      {/* EuiForm component renders as a div by default, but we can pass in component="form"
        EuiForm and EuiFormRow both accept an isInvalid flag and error prop (error text to display)
        We can also pass isInvalid to EuiFieldText and EuiFieldPassword to give additional feedback */}
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
