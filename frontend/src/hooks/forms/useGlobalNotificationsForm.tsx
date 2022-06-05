import moment from 'moment'
import { useEffect, useCallback, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { schema } from 'src/types/schemaOverride'
import { extractErrorMessages } from 'src/utils/errors'
import { ROLE_PERMISSIONS } from 'src/services/permissions'
import { _getFormErrors } from 'src/utils/validation'
import { useGlobalNotifications } from '../ui/useGlobalNotifications'
import { useAuthenticatedUser } from '../auth/useAuthenticatedUser'

export function useGlobalNotificationsForm() {
  const { createNotification, deleteNotification, errorList } = useGlobalNotifications()
  const { user } = useAuthenticatedUser()
  const dispatch = useAppDispatch()

  const [form, setForm] = useState<schema['CreateGlobalNotificationParams']>({
    sender: user?.email,
    receiver_role: 'user',
    title: '',
    body: '',
    label: '',
    link: '',
  })
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

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
