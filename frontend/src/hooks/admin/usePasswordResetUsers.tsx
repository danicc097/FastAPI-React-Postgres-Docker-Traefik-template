import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { AdminActionCreators } from 'src/redux/modules/admin/admin'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

export const usePasswordResetUsers = () => {
  const dispatch = useAppDispatch()
  // references to state slices
  const adminError = useAppSelector((state) => state.admin.error)
  const isAdmin = useAppSelector((state) => state.auth.user.is_superuser)
  const passwordResetRequests = useAppSelector((state) => state.admin.data.passwordResetRequests, shallowEqual)

  // fetch password reset users whenever the hook is called in a component and isAdmin
  useEffect(() => {
    if (isAdmin && passwordResetRequests === undefined) {
      return dispatch(AdminActionCreators.fetchAllPasswordResetUsers())
      // specify a cleanup function as return (if any)
      // return () => dispatch(CleaningActions.clearCurrentCleaningJob())
    }
  }, [isAdmin, dispatch, AdminActionCreators.fetchAllPasswordResetUsers])

  // add a new key label: user.email for every user in the passwordResetRequests array using a reference to the original selector and without using the map function

  // use all this functionality anywhere
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
