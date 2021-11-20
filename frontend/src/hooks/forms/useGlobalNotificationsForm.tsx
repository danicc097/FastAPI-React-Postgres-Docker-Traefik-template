import moment from 'moment'
import { useEffect, useCallback, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { schema } from 'src/types/schema_override'
import { extractErrorMessages } from 'src/utils/errors'
import { ROLE_PERMISSIONS } from 'src/utils/permissions'
import { _getFormErrors } from 'src/utils/validation'
import { useGlobalNotifications } from '../ui/useGlobalNotifications'
import { useAuthenticatedUser } from '../auth/useAuthenticatedUser'

export function useGlobalNotificationsForm() {
  // grab functionality as needed
  const { createNotification, deleteNotification, errorList } = useGlobalNotifications()
  const { user } = useAuthenticatedUser()
  const dispatch = useAppDispatch()
  // define keys meant to be passed to API with original snake_case
  const [form, setForm] = useState<schema['GlobalNotificationCreate']>({
    sender: user.email,
    receiver_role: 'user',
    title: '',
    body: '',
    label: '',
    link: '',
  })
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  /**
   * Retrieve form errors specific to the current form.
   * Form-specific errors should be set in its own form key
   */
  const getFormErrors = () => _getFormErrors(form, errors, hasSubmitted, errorList)

  return {
    form,
    setForm,
    errors,
    setErrors,
    setHasSubmitted,
    getFormErrors,
    createNotification,
    deleteNotification,
  }
}
