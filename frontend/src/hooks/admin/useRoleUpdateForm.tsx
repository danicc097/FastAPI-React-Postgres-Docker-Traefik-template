import moment from 'moment'
import { useEffect, useCallback, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { AdminActionCreators } from 'src/redux/modules/admin/admin'
import { schema } from 'src/types/schemaOverride'
import { extractErrorMessages } from 'src/utils/errors'
import { ROLE_PERMISSIONS } from 'src/services/permissions'
import { _getFormErrors } from 'src/utils/validation'
import { useGlobalNotifications } from '../ui/useGlobalNotifications'

export function useRoleUpdateForm() {
  const dispatch = useAppDispatch()

  const [form, setForm] = useState<schema['RoleUpdate']>({
    email: '',
    role: 'user',
  })
  const error = useAppSelector((state) => state.admin.error, shallowEqual)
  const [errors, setErrors] = useState<FormErrors<typeof form>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const errorList = extractErrorMessages(error)

  const getFormErrors = () => _getFormErrors(form, errors, hasSubmitted, errorList)

  const updateUserRole = async ({ role_update }) => {
    return dispatch(AdminActionCreators.updateUserRole({ role_update }))
  }

  return {
    form,
    setForm,
    errors,
    setErrors,
    getFormErrors,
    hasSubmitted,
    setHasSubmitted,
    updateUserRole,
  }
}
