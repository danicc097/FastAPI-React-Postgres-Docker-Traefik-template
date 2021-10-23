import { useEffect } from 'react'
import { shallowEqual } from 'react-redux'
import { AdminActions } from 'src/redux/admin'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

export const useUnverifiedUsers = () => {
  const dispatch = useAppDispatch()

  // references to state slices
  const adminError = useAppSelector((state) => state.admin.error)
  const isAdmin = useAppSelector((state) => state.auth.user.is_superuser)
  const unverifiedUsers = useAppSelector((state) => state.admin.data.unverifiedUsers, shallowEqual)

  useEffect(() => {
    if (isAdmin && unverifiedUsers === undefined) {
      return dispatch(AdminActions.fetchAllNonVerifiedUsers())
      // specify a cleanup function as return (if any)
      // return () => dispatch(CleaningActions.clearCurrentCleaningJob())
    }
  }, [isAdmin, dispatch, AdminActions.fetchAllNonVerifiedUsers])

  // use all this functionality anywhere
  const fetchAllNonVerifiedUsers = () => {
    return dispatch(AdminActions.fetchAllNonVerifiedUsers())
  }

  const verifyUsers = ({ userEmails }) => {
    return dispatch(AdminActions.verifyUsers({ userEmails }))
  }

  const removeVerifiedUsersFromStore = ({ users }) => {
    return dispatch(AdminActions.removeVerifiedUsersFromStore({ users }))
  }

  return {
    unverifiedUsers,
    removeVerifiedUsersFromStore,
    adminError,
    fetchAllNonVerifiedUsers,
    verifyUsers,
  }
}
