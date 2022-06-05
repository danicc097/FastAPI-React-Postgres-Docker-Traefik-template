import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { AdminActionCreators } from 'src/redux/modules/admin/admin'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

export const usePasswordResetUsers = () => {
  const dispatch = useAppDispatch()
  const adminError = useAppSelector((state) => state.admin.error)
  const isAdmin = useAppSelector((state) => state.auth.user?.is_superuser)
  const passwordResetRequests = useAppSelector((state) => state.admin.data.passwordResetRequests, shallowEqual)

  useEffect(() => {
    if (isAdmin && passwordResetRequests === undefined) {
      return dispatch(AdminActionCreators.fetchAllPasswordResetUsers())
    }
  }, [isAdmin, dispatch, AdminActionCreators.fetchAllPasswordResetUsers])

  const fetchAllPasswordResetUsers = () => {
    return dispatch(AdminActionCreators.fetchAllPasswordResetUsers())
  }

  const resetPasswordForUser = ({ email }) => {
    return dispatch(AdminActionCreators.resetPasswordForUser({ email }))
  }

  const deletePasswordResetRequest = ({ request }) => {
    return dispatch(AdminActionCreators.deletePasswordResetRequest({ request }))
  }

  return {
    passwordResetRequests,
    adminError,
    deletePasswordResetRequest,
    fetchAllPasswordResetUsers,
    resetPasswordForUser,
  }
}
