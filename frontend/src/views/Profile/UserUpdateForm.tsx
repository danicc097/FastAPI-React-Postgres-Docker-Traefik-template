import {
  EuiAccordion,
  EuiButton,
  EuiConfirmModal,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui'
import _ from 'lodash'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserUpdateForm } from 'src/hooks/forms/useUserUpdateForm'
import { UserProfileActionType } from 'src/redux/modules/userProfile/userProfile'
import { handleInputChange, validateInput } from 'src/utils/validation'
import styled from 'styled-components'

const StyledEuiAccordion = styled(EuiAccordion)`
  &&& {
    margin-top: 2rem;
  }
`

// getting rid of autocomplete requires custom mask
const StyledEuiFieldPassword = styled(EuiFieldPassword)`
  &&& {
    -webkit-text-security: disc;
  }
`

export default function UserUpdateAccordion() {
  const { form, setForm, errors, setErrors, getFormErrors, updateUser, setHasSubmitted, handlePasswordConfirmChange } =
    useUserUpdateForm()

  const resetForm = () => {
    Object.keys(form).forEach((key) => {
      form[key] = ''
    })
  }

  // don't forget async...
  const submitUserUpdate = async (e) => {
    e.preventDefault()
    closeModal()
    setHasSubmitted(true)
    const action = await updateUser({
      username: form.username,
      email: form.email,
      password: form.password,
      old_password: form.old_password,
    })
    if (action?.type !== UserProfileActionType.REQUEST_USER_UPDATE_SUCCESS) {
      setForm((form) => ({ ...form, password: '', passwordConfirm: '', old_password: '' }))
      console.log('user update failed')
      resetForm()
    } else {
      console.log('user update succeeded')
      // redirect to login page in 5 seconds
      // setTimeout(() => {
      //   window.location.reload()
      // }, 3000)
    }
  }

  // don't forget async...
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    setErrors({})

    // do not send blank form
    if (!Object.keys(form).some((key) => form[key] !== '')) {
      return
    }

    // ensure passwords match
    // ensure all password fields are not empty if at least one isn't
    if (
      (!!form.password || !!form.passwordConfirm || !!form.old_password) &&
      !(form.password && form.passwordConfirm && form.old_password)
    ) {
      setErrors((errors) => ({ ...errors, form: 'You must fill out all password fields' }))
      return
    }

    showModal()
  }

  // confirm userUpdate modal
  const [isModalVisible, setIsModalVisible] = useState(false)
  const closeModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)
  let modal
  if (isModalVisible) {
    modal = (
      <EuiConfirmModal
        title={`Update credentials`}
        onCancel={closeModal}
        onConfirm={submitUserUpdate}
        cancelButtonText="Cancel"
        confirmButtonText="Update credentials"
        defaultFocusedButton="confirm"
      >
        <p>{_.unescape(`You're about to update your login credentials.`)}</p>
      </EuiConfirmModal>
    )
  }

  const updateUserForm = (
    <div>
      <EuiForm
        component="form"
        onSubmit={handleSubmit}
        isInvalid={Boolean(getFormErrors().length)}
        error={getFormErrors()}
      >
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiFormRow
              label="Username"
              helpText="Choose a username consisting solely of letters, numbers, underscores, and dashes."
              isInvalid={!!form.username && Boolean(errors.username)}
              error="Please enter a valid username"
            >
              <EuiFieldText
                icon="user"
                placeholder="Enter your new username"
                type="text"
                data-test-subj="new-username"
                value={form.username}
                onChange={(e) => {
                  handleInputChange({ label: 'username', value: e.target.value, setForm, setErrors })
                }}
                aria-label="Choose a username consisting of letters, numbers, underscores, and dashes"
                isInvalid={!!form.username && Boolean(errors.username)}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiHorizontalRule margin="m" />
          <EuiFlexItem>
            <EuiFormRow
              label="Old password"
              isInvalid={!!form.old_password && Boolean(errors.old_password)}
              error="Password must be at least 7 characters"
            >
              <StyledEuiFieldPassword
                placeholder="Enter your current password"
                data-test-subj="old-password"
                type="text"
                aria-label="Enter your current password"
                value={form.old_password}
                onChange={(e) => {
                  handleInputChange({
                    label: 'message',
                    value: e.target.value,
                    formLabel: 'old_password',
                    setForm,
                    setErrors,
                  })
                }}
                isInvalid={!!form.old_password && Boolean(errors.old_password)}
              />
            </EuiFormRow>
            <EuiFormRow
              label="New password"
              isInvalid={!!form.password && Boolean(errors.password)}
              error="Password must be at least 7 characters"
            >
              <StyledEuiFieldPassword
                placeholder="Enter your new password"
                data-test-subj="new-password"
                type="text"
                aria-label="Enter your new password"
                value={form.password}
                onChange={(e) => {
                  handleInputChange({ label: 'password', value: e.target.value, setForm, setErrors })
                }}
                isInvalid={!!form.password && Boolean(errors.password)}
              />
            </EuiFormRow>
            <EuiFormRow
              label="New password confirm"
              isInvalid={!!form.passwordConfirm && Boolean(errors.passwordConfirm)}
              error="Passwords must match"
            >
              <StyledEuiFieldPassword
                placeholder="Enter your new password again"
                data-test-subj="new-password-confirm"
                type="text"
                value={form.passwordConfirm}
                onChange={(e) => {
                  handlePasswordConfirmChange(e.target.value)
                }}
                aria-label="Confirm your password"
                isInvalid={!!form.passwordConfirm && Boolean(errors.passwordConfirm)}
              />
            </EuiFormRow>
            <EuiHorizontalRule />

            <EuiFlexItem grow={false}>
              <EuiButton
                iconType="indexEdit"
                size="s"
                type="submit"
                isLoading={null}
                fill
                data-test-subj="user-update-submit"
              >
                Update my credentials
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="m" />
      </EuiForm>
      {modal}
    </div>
  )

  // content of the clickable area
  const buttonContent = (
    <div>
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="pencil" size="m" />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3 style={{ color: 'dodgerblue' }}>Edit user credentials</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiText size="s">
        <p>
          <EuiTextColor color="subdued">Change your username or password.</EuiTextColor>
        </p>
      </EuiText>
    </div>
  )

  return (
    <StyledEuiAccordion
      id="accordionForm1"
      className="userUpdateAccordionForm"
      buttonClassName="userUpdateAccordionForm__button"
      buttonContent={buttonContent}
      paddingSize="l"
    >
      {updateUserForm}
    </StyledEuiAccordion>
  )
}
