import ReactDOM from 'react-dom'
import React, { useState, Fragment } from 'react'
import { getAllowedRoles, ROLE_PERMISSIONS } from '../../../utils/permissions'
import { joinWithAnd } from '../../../utils/format'

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
import { handleInputChange, validateFormBeforeSubmit, validateInput } from 'src/utils/validation'
import { GlobalNotificationsActionType } from '../../../redux/modules/feed/globalNotifications'
import { useGlobalNotificationsFeed } from '../../../hooks/feed/useGlobalNotificationsFeed'
import { capitalize, some } from 'lodash'

export default function GlobalNotificationsModalForm({ closeFlyout }: { closeFlyout?: () => void }) {
  const { getFormErrors, createNotification, form, setForm, errors, setErrors, setHasSubmitted } =
    useGlobalNotificationsForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [receiverRole, setReceiverRole] = useState('user' as schema['Role'])

  const resetForm = () => {
    setForm({
      ...form,
      title: '',
      body: '',
      label: '',
      link: '',
    })
  }

  // don't forget async...
  const handleSubmit = async (e) => {
    e.preventDefault()

    const optionalFields = ['link']

    const isValid = validateFormBeforeSubmit({ form, optionalFields, setErrors })
    if (!isValid) {
      return
    }

    setHasSubmitted(true)

    const action = await createNotification({ notification: form })

    // reset the password form state if the login attempt is not successful
    if (action?.type !== GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION_SUCCESS) {
      setErrors((errors) => ({ ...errors, form: 'There was an error creating the notification' }))
    } else {
      closeModal()
      resetForm()
      if (closeFlyout) {
        closeFlyout()
      }
    }
  }

  const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' })

  const closeModal = () => {
    setIsModalVisible(false)
    resetForm()
    setErrors({})
  }
  const showModal = () => setIsModalVisible(true)

  const roleOptions: EuiSuperSelectProps<string>['options'] = Object.keys(ROLE_PERMISSIONS).map(
    (key: Partial<schema['Role']>) => ({
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
      onSubmit={handleSubmit}
      isInvalid={Boolean(getFormErrors().length)}
      error={getFormErrors()}
    >
      <EuiFormRow label="Title" isInvalid={Boolean(errors.title)} error="Please enter a valid title">
        <EuiFieldText
          name="title"
          placeholder="Enter title"
          maxLength={30}
          value={form.title}
          onChange={(e) =>
            handleInputChange({ label: 'message', formLabel: 'title', value: e.target.value, setForm, setErrors })
          }
          isInvalid={Boolean(errors.title)}
        />
      </EuiFormRow>

      <EuiFormRow label="Body" isInvalid={Boolean(errors.body)} error="Please enter a valid body">
        <EuiTextArea
          name="body"
          rows={5}
          placeholder="Enter the notification body"
          maxLength={200}
          value={form.body}
          onChange={(e) =>
            handleInputChange({ label: 'message', formLabel: 'body', value: e.target.value, setForm, setErrors })
          }
          isInvalid={Boolean(errors.body)}
        />
      </EuiFormRow>

      <EuiFormRow
        label="Label"
        helpText="Enter a notification label for context."
        isInvalid={Boolean(errors.label)}
        error="Please enter a valid label"
      >
        <EuiFieldText
          name="label"
          placeholder="e.g. 'Updates' or 'Warning'"
          maxLength={15}
          value={form.label}
          onChange={(e) =>
            handleInputChange({ label: 'message', formLabel: 'label', value: e.target.value, setForm, setErrors })
          }
          isInvalid={Boolean(errors.label)}
        />
      </EuiFormRow>

      <EuiFormRow
        label="Link"
        helpText="Provide an optional link."
        isInvalid={!!form.link && Boolean(errors.link)}
        error="Please enter a valid link"
      >
        <EuiFieldText
          name="link"
          required={false}
          placeholder="e.g. 'https://www.somewhere.com'"
          value={form.link}
          onChange={(e) =>
            handleInputChange({ label: 'message', formLabel: 'link', value: e.target.value, setForm, setErrors })
          }
          isInvalid={!!form.link && Boolean(errors.link)}
        />
      </EuiFormRow>

      <EuiFormRow
        label="Receiver role"
        helpText="Select the role that will receive this notification."
        isInvalid={Boolean(errors.receiver_role)}
        error="Please select a valid role"
      >
        <EuiSuperSelect
          name="receiver_role"
          options={roleOptions}
          valueOfSelected={receiverRole}
          onChange={(value: any) => {
            onSuperSelectChange(value)
            setForm((form) => ({ ...form, receiver_role: value }))
          }}
          itemLayoutAlign="top"
          hasDividers
          isInvalid={Boolean(errors.receiver_role)}
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

          <EuiButton type="submit" form={modalFormId} fill>
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
