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
import React, { useState } from 'react'

import { AuthActionType } from 'src/redux/modules/auth/auth'
import { handleInputChange, validateFormBeforeSubmit, validateInput } from 'src/utils/validation'
import { useForgotPasswordForm } from 'src/hooks/forms/useForgotPasswordForm'
import { ForgotPasswordFormWrapper } from './ForgotPasswordForm.styles'

export default function ForgotPasswordForm() {
  const [isDisabled, setIsDisabled] = useState(false)
  const { form, setForm, errors, setErrors, getFormErrors, setHasSubmitted, requestPasswordReset } =
    useForgotPasswordForm()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = validateFormBeforeSubmit({ form, setErrors })
    if (!isValid) {
      return
    }

    setHasSubmitted(true)

    const action = await requestPasswordReset({ email: form.email, message: form.message })

    if (action?.type !== AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS) {
      setForm((form) => ({ ...form, message: '', email: '' }))
    } else {
      setIsDisabled(true)
    }
  }

  return (
    <ForgotPasswordFormWrapper>
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
          error="Please enter a valid email"
          fullWidth
        >
          <EuiFieldText
            name="email"
            data-test-subj="email-input"
            fullWidth
            icon="email"
            placeholder="user@mail.com"
            value={form.email}
            onChange={(e) => handleInputChange({ label: 'email', value: e.target.value, setForm, setErrors })}
            aria-label="Enter the email associated with your account"
            isInvalid={Boolean(errors.email)}
          />
        </EuiFormRow>

        <EuiFormRow
          label="Request message"
          helpText="Leave a message for the administrator."
          error="The message is too short"
          isInvalid={Boolean(errors.message)}
          fullWidth
        >
          <EuiTextArea
            name="message"
            data-test-subj="message-input"
            value={form.message}
            onChange={(e) => handleInputChange({ label: 'message', value: e.target.value, setForm, setErrors })}
            isInvalid={Boolean(errors.message)}
            fullWidth
            placeholder="Kindly help"
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
