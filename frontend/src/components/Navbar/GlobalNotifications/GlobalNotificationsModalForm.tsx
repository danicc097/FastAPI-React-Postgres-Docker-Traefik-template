import ReactDOM from 'react-dom'
import React, { useState, Fragment } from 'react'
import { getAllowedRoles, ROLE_PERMISSIONS } from '../../../utils/permissions'
import { capitalize, joinWithAnd } from '../../../utils/format'

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiRange,
  EuiSwitch,
  EuiSuperSelect,
  EuiText,
  EuiFieldNumber,
  EuiTextArea,
} from '@elastic/eui'

import { useGeneratedHtmlId } from '@elastic/eui'
import { EuiSuperSelectProps } from '@elastic/eui/src/components'
import { schema } from 'src/types/schema_override'
import { useGlobalNotificationsForm } from 'src/hooks/forms/useGlobalNotificationsForm'

export default function GlobalNotificationsModalForm() {
  const { getFormErrors, createNotification } = useGlobalNotificationsForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [receiverRole, setReceiverRole] = useState('user' as schema['Roles'])

  const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' })

  const closeModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)

  const roleOptions: EuiSuperSelectProps<string>['options'] = Object.keys(ROLE_PERMISSIONS).map(
    (key: Partial<schema['Roles']>) => ({
      value: key,
      inputDisplay: capitalize(key),
      dropdownDisplay: (
        <Fragment>
          <strong>{capitalize(key)}</strong>
          <EuiText size="s" color="subdued">
            <p className="euiTextColor--subdued">Viewable by {joinWithAnd(getAllowedRoles(key))}.</p>
          </EuiText>
        </Fragment>
      ),
    }),
  )

  const modalForm = (
    <EuiForm
      id={modalFormId}
      component="form"
      onSubmit={() => {
        null
      }}
      isInvalid={false}
    >
      <EuiFormRow label="Title">
        <EuiFieldText name="title" placeholder="Enter title" maxLength={30} />
      </EuiFormRow>

      <EuiFormRow label="Body">
        <EuiTextArea name="body" rows={5} placeholder="Enter the notification body" maxLength={200} />
      </EuiFormRow>

      <EuiFormRow label="Label" helpText="Enter a notification label for context.">
        <EuiFieldText name="label" placeholder="e.g. 'Updates' or 'Warning'" maxLength={15} />
      </EuiFormRow>

      <EuiFormRow label="Link" helpText="Provide an optional link.">
        <EuiFieldText name="link" required={false} placeholder="e.g. 'https://www.somewhere.com'" />
      </EuiFormRow>

      <EuiFormRow label="Receiver role" helpText="Select the role that will receive this notification.">
        <EuiSuperSelect
          name="receiver_role"
          options={roleOptions}
          valueOfSelected={receiverRole}
          onChange={(value) => onSuperSelectChange(value)}
          itemLayoutAlign="top"
          hasDividers
        />
      </EuiFormRow>
    </EuiForm>
  )

  const onSuperSelectChange = (value) => {
    setReceiverRole(value)
  }

  let modal

  if (isModalVisible) {
    modal = (
      <EuiModal onClose={closeModal} initialFocus="[name=title]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>New notification</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>{modalForm}</EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>

          <EuiButton type="submit" form={modalFormId} onClick={closeModal} fill>
            Publish
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    )
  }
  return (
    <div>
      <EuiButton fill size="s" color="success" onClick={showModal}>
        Add notification
      </EuiButton>
      {modal}
    </div>
  )
}
