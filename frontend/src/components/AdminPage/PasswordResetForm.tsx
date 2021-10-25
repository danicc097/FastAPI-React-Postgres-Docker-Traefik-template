import { Direction, EuiConfirmModal, EuiForm, EuiFormRow, EuiSelectable, EuiSelectableOption } from '@elastic/eui'
import React, { useState, Fragment, useRef, useEffect } from 'react'

import { EuiBasicTable, EuiLink, EuiHealth, EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui'
import styled from 'styled-components'
import { initialStateType } from 'src/redux/initialState'
import { useAppSelector } from 'src/redux/hooks'
import { shallowEqual } from 'react-redux'
import { usePasswordResetUsers } from 'src/hooks/admin/usePasswordResetUsers'
import { useAllUsers } from 'src/hooks/admin/useAllUsers'
import { AdminActionType } from 'src/redux/action-types'
import { createTextFileWithCreds } from 'src/utils/files'
import _ from 'lodash'

export default function PasswordResetForm() {
  const [passwordResetUsersWithLabel, setPasswordResetUsersWithLabel] = useState<any>()
  const [selection, setSelection] = useState<any>('...')
  const { resetPasswordForUser } = usePasswordResetUsers()
  const { allUsers } = useAllUsers()

  // fetch password reset users whenever the hook is called in a component and isAdmin
  useEffect(() => {
    if (passwordResetUsersWithLabel === undefined) {
      setPasswordResetUsersWithLabel(
        allUsers
          ? allUsers.map((user) => ({
              label: user.email,
            }))
          : undefined,
      )
    } else {
      setOptions(passwordResetUsersWithLabel)
    }
  }, [passwordResetUsersWithLabel, allUsers])

  const [options, setOptions] = useState<Array<EuiSelectableOption<any>>>(passwordResetUsersWithLabel)

  const onSelectableChange = (newOptions) => {
    setOptions(newOptions)
    setSelection(newOptions.filter((option) => !!option?.checked)[0]?.label)
  }

  const submitPasswordReset = async () => {
    closeModal()
    const email = selection
    const action = await resetPasswordForUser({ email })
    if (action?.type === AdminActionType.RESET_PASSWORD_FOR_USER_SUCCESS) {
      createTextFileWithCreds({ email, password: action.data })
    }
  }
  const onResetPasswordSubmit = async (e) => {
    e.preventDefault()
    console.log(`onResetPasswordSubmit called with: `, selection)
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
        title={`Reset password for ${selection}`}
        onCancel={closeModal}
        onConfirm={submitPasswordReset}
        cancelButtonText="No, don't do it"
        confirmButtonText="Yes, do it"
        defaultFocusedButton="confirm"
        data-test-subj="passwordResetForm__confirmModal"
      >
        <p>{_.unescape(`You're about to reset the password for ${selection}.`)}</p>
        <p>Are you sure you want to do this?</p>
      </EuiConfirmModal>
    )
  }

  return (
    <>
      <EuiForm component="form" onSubmit={onResetPasswordSubmit}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>
            <EuiFormRow fullWidth label="Manually reset a user's password. The new credentials will be downloaded.">
              <EuiSelectable
                aria-label="Searchable example"
                data-test-subj="passwordResetForm__selectable"
                searchable
                searchProps={{
                  onSearch: (searchValue, matchingOptions) => {
                    null
                  },
                }}
                options={options ?? []}
                singleSelection="always"
                onChange={onSelectableChange}
              >
                {(list, search) => (
                  <Fragment>
                    {search}
                    {list}
                  </Fragment>
                )}
              </EuiSelectable>
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              type="submit"
              isDisabled={selection === '...'}
              color="warning"
              data-test-subj="passwordResetForm__submit"
            >{`Reset password for ${selection}`}</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
      {modal}
    </>
  )
}
