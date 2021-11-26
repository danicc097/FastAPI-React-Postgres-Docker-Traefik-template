import {
  EuiBadge,
  EuiButton,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiSelectable,
  EuiSelectableOption,
  EuiSuperSelect,
  EuiSuperSelectProps,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui'
import _, { capitalize } from 'lodash'
import React, { Fragment, useEffect, useReducer, useState } from 'react'
import { useAllUsers } from 'src/hooks/admin/useAllUsers'
import { useRoleUpdateForm } from 'src/hooks/admin/useRoleUpdateForm'
import { AdminActionType } from 'src/redux/modules/admin/admin'
import { schema } from 'src/types/schema_override'
import { getColorForRole } from 'src/utils/colors'
import { joinWithAnd } from 'src/utils/format'
import { getImplicitRoles, ROLE_PERMISSIONS } from 'src/utils/permissions'
import AdminPageTemplate from '../AdminPageTemplate/AdminPageTemplate'

export default function UserPermissionsPage() {
  const noSelection = '...'

  const [forceRerender, setForceRerender] = useState(false)
  const [emailSelection, setEmailSelection] = useState<any>(noSelection)
  const [roleSelection, setRoleSelection] = useState('user' as schema['Role'])
  const [userOptions, setUserOptions] = useState<Array<EuiSelectableOption<any>>>(undefined)
  const { allUsers, fetchAllUsers } = useAllUsers()
  const { updateUserRole, getFormErrors, form, setForm, errors, setErrors, setHasSubmitted } = useRoleUpdateForm()

  useEffect(() => {
    if (userOptions === undefined || forceRerender) {
      setUserOptions(
        allUsers
          ? allUsers.map((user) => ({
              label: `${user.email}`,
              append: <EuiBadge color={getColorForRole(user.role)}>{user.role}</EuiBadge>,
              role: user.role,
              showIcons: false,
            }))
          : undefined,
      )
      setForceRerender(!forceRerender)
    } else {
      setUserOptions(userOptions)
    }
  }, [userOptions, allUsers])

  const onEmailSelectableChange = (newOptions) => {
    setUserOptions(newOptions)
    setEmailSelection(newOptions.filter((option) => !!option?.checked)[0]?.label)
  }

  const [isModalVisible, setIsModalVisible] = useState(false)
  const closeModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)

  const submitRoleUpdate = async () => {
    setHasSubmitted(true)
    const action = await updateUserRole({ role_update: form })
    if (action.type !== AdminActionType.UPDATE_USER_ROLE_SUCCESS) {
      setErrors((errors) => ({ ...errors, form: 'There was an error updating the user role' }))
    }
    setForceRerender(!forceRerender)
    closeModal()
  }

  let modal
  if (isModalVisible) {
    modal = (
      <EuiConfirmModal
        title={`Update role`}
        onCancel={closeModal}
        onConfirm={submitRoleUpdate}
        cancelButtonText="Cancel"
        confirmButtonText="Update role"
        defaultFocusedButton="confirm"
        buttonColor="warning"
        data-test-subj="roleUpdateForm__confirmModal"
      >
        <>
          {_.unescape(`You're about to update role to `)}
          <strong>{roleSelection}</strong> for <strong>{emailSelection}</strong>.
        </>

        <p>Are you sure you want to do this?</p>
      </EuiConfirmModal>
    )
  }

  const onRoleUpdateSubmit = async (e) => {
    e.preventDefault()

    // cant change form in modal
    setForm((form) => ({ ...form, email: emailSelection }))
    console.log(`onRoleUpdateSubmit called with: ${emailSelection} and ${roleSelection}`)
    showModal()
  }

  const title = (
    <div>
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="eraser" size="m" />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3 style={{ color: 'dodgerblue' }}>Update user role</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiText size="s">
        <p>
          <EuiTextColor color="subdued">{_.unescape(`Manually update a user's role.`)}</EuiTextColor>
        </p>
      </EuiText>
    </div>
  )

  const roleOptions: EuiSuperSelectProps<string>['options'] = Object.keys(ROLE_PERMISSIONS).map(
    (key: Partial<schema['Role']>) => ({
      value: key,
      inputDisplay: capitalize(key),
      dropdownDisplay: (
        <Fragment>
          <strong>{capitalize(key)}</strong>
          <EuiText size="s" color="subdued">
            <p className="euiTextColor--subdued">
              Has access privileges encompassing {joinWithAnd(getImplicitRoles(key))}.
            </p>
          </EuiText>
        </Fragment>
      ),
    }),
  )

  const onRoleSuperSelectChange = (value) => {
    setRoleSelection(value)
    setForm({
      ...form,
      role: value,
    })
  }

  const element = (
    <>
      <EuiForm
        component="form"
        onSubmit={onRoleUpdateSubmit}
        isInvalid={Boolean(getFormErrors().length)}
        error={getFormErrors()}
      >
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>
            <EuiFormRow
              fullWidth
              label="Select the user's email"
              error={getFormErrors()}
              isInvalid={Boolean(errors.email)}
            >
              <EuiSelectable
                aria-label="Searchable example"
                data-test-subj="roleUpdateForm__selectable"
                searchable
                searchProps={{
                  onSearch: (searchValue, matchingOptions) => {
                    null
                  },
                }}
                options={userOptions ?? []}
                singleSelection="always"
                onChange={onEmailSelectableChange}
              >
                {(list, search) => (
                  <Fragment>
                    {search}
                    {list}
                  </Fragment>
                )}
              </EuiSelectable>
            </EuiFormRow>

            <EuiFormRow
              label="Role"
              helpText="Select the new role."
              isInvalid={Boolean(errors.role)}
              error="Please select a valid role"
            >
              <EuiSuperSelect
                name="role"
                options={roleOptions}
                valueOfSelected={roleSelection}
                onChange={onRoleSuperSelectChange}
                itemLayoutAlign="top"
                hasDividers
                isInvalid={Boolean(errors.role)}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              type="submit"
              isDisabled={emailSelection === noSelection}
              color="warning"
              data-test-subj="roleUpdateForm__submit"
            >{`Update role for ${emailSelection}`}</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
      {modal}
    </>
  )
  return <AdminPageTemplate title={title} element={element} />
}
