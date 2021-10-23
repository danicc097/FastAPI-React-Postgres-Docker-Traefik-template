import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiFieldPassword,
  EuiSpacer,
  EuiRange,
  EuiTextArea,
} from '@elastic/eui'
import styled from 'styled-components'
import React, { useState } from 'react'

import { useForgotPasswordForm } from 'src/hooks/auth/useForgotPasswordForm'
import { AuthActionType } from 'src/redux/action-types'

const ForgotPasswordFormWrapper = styled.div`
  padding: 2rem;
  min-width: 700px;
`

export default function ForgotPasswordForm() {
  // destructure the needed values from the hook's return
  const [isDisabled, setIsDisabled] = useState(false)
  const {
    form,
    setForm,
    errors,
    setErrors,
    getFormErrors,
    validateInput,
    handleInputChange,
    setHasSubmitted,
    requestPasswordReset,
  } = useForgotPasswordForm()

  // don't forget async...
  const handleSubmit = async (e) => {
    e.preventDefault()
    // validate inputs before submitting
    Object.keys(form).forEach((label) => validateInput(label, form[label]))
    // if any input hasn't been entered in, return early
    if (!Object.values(form).every((value) => Boolean(value) || value === null)) {
      setErrors((errors) => ({ ...errors, form: 'You must fill out all fields.' }))
      return
    }
    setHasSubmitted(true)

    const action = await requestPasswordReset({ email: form.email, message: form.message })

    // reset the password form state if the login attempt is not successful
    if (action?.type !== AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS) {
      setForm((form) => ({ ...form, message: '', email: '' }))
    } else {
      setIsDisabled(true)
    }
  }
  return (
    <ForgotPasswordFormWrapper>
      {/* EuiForm component renders as a div by default, but we can pass in component="form"
        EuiForm and EuiFormRow both accept an isInvalid flag and error prop (error text to display)
        We can also pass isInvalid to EuiFieldText and EuiFieldPassword to give additional feedback */}
      <EuiForm
        name="forgotPasswordForm"
        component="form"
        onSubmit={handleSubmit}
        isInvalid={Boolean(getFormErrors().length)}
        error={getFormErrors()}
      >
        <EuiFormRow
          label="Email"
          helpText="Enter the email associated with your account."
          isInvalid={Boolean(errors.email)}
          error="Please enter a valid email."
          fullWidth
        >
          <EuiFieldText
            name="email" //
            data-test-subj="email-input"
            fullWidth
            icon="email"
            placeholder="user@mail.com"
            value={form.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            aria-label="Enter the email associated with your account."
            isInvalid={Boolean(errors.email)}
          />
        </EuiFormRow>

        <EuiFormRow
          label="Request message"
          helpText="Leave a message for the administrator."
          error="The message is too short."
          isInvalid={Boolean(errors.message)}
          fullWidth
        >
          <EuiTextArea
            name="message"
            data-test-subj="message-input"
            value={form.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            isInvalid={Boolean(errors.message)}
            fullWidth
            placeholder="Kindly help."
          />
        </EuiFormRow>
        <EuiSpacer />
        <EuiButton type="submit" fill isDisabled={isDisabled} data-test-subj="password-reset-submit">
          Request Password Reset
        </EuiButton>
      </EuiForm>
    </ForgotPasswordFormWrapper>
  )
}
