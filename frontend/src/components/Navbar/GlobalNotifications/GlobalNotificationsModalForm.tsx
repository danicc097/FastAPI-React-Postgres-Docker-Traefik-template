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

export default function GlobalNotificationsModalForm() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isSwitchChecked, setIsSwitchChecked] = useState(true)
  const [superSelectvalue, setSuperSelectValue] = useState('option_one')

  const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' })
  const modalFormSwitchId = useGeneratedHtmlId({ prefix: 'modalFormSwitch' })

  const onSwitchChange = () => setIsSwitchChecked((isSwitchChecked) => !isSwitchChecked)

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
  // dynamically create a form row for each field
  // to be sent to api in form of { fieldName: fieldValue }
  // Fields to populate:
  //   - receiver_role: str
  //   - title: str
  //   - body: str
  //   - label: str
  //   - link?: str
  const form = (
    <EuiForm
      id={modalFormId}
      component="form"
      onSubmit={() => {
        null
      }}
      isInvalid={false}
    >
      <EuiFormRow label="Receiver role" helpText="Select the role that will receive this notification.">
        <EuiSuperSelect
          options={roleOptions}
          valueOfSelected={superSelectvalue}
          onChange={(value) => onSuperSelectChange(value)}
          itemLayoutAlign="top"
          hasDividers
        />
      </EuiFormRow>

      <EuiFormRow label="Title">
        <EuiFieldText name="title" placeholder="Enter title" />
      </EuiFormRow>

      <EuiFormRow label="Body">
        <EuiTextArea name="body" rows={5} placeholder="Enter the notification body." />
      </EuiFormRow>

      <EuiFormRow label="Label" helpText="Enter a notification label for context.">
        <EuiFieldText name="label" placeholder="e.g. 'Updates' or 'Warning'" />
      </EuiFormRow>

      <EuiFormRow label="Link" helpText="Provide an optional link.">
        <EuiFieldText name="link" required={false} placeholder="e.g. 'https://www.somewhere.com'" />
      </EuiFormRow>
    </EuiForm>
  )

  const onSuperSelectChange = (value) => {
    setSuperSelectValue(value)
  }

  let modal

  if (isModalVisible) {
    modal = (
      <EuiModal onClose={closeModal} initialFocus="[name=popswitch]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>New notification</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>{form}</EuiModalBody>

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
