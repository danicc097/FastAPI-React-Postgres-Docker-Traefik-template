import { useEffect } from 'react'
import { shallowEqual } from 'react-redux'
import { AdminActionCreators } from 'src/redux/modules/admin/admin'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

export const useUnverifiedUsers = () => {
  const dispatch = useAppDispatch()

  // references to state slices
  const adminError = useAppSelector((state) => state.admin.error)
  const isAdmin = useAppSelector((state) => state.auth.user.is_superuser)
  const unverifiedUsers = useAppSelector((state) => state.admin.data.unverifiedUsers, shallowEqual)

  useEffect(() => {
    if (isAdmin && unverifiedUsers === undefined) {
      return dispatch(AdminActionCreators.fetchAllNonVerifiedUsers())
      // specify a cleanup function as return (if any)
      // return () => dispatch(CleaningActions.clearCurrentCleaningJob())
    }
  }, [isAdmin, dispatch, AdminActionCreators.fetchAllNonVerifiedUsers])

  // use all this functionality anywhere
  const fetchAllNonVerifiedUsers = () => {
    return dispatch(AdminActionCreators.fetchAllNonVerifiedUsers())
  }

  const verifyUsers = ({ userEmails }) => {
    return dispatch(AdminActionCreators.verifyUsers({ userEmails }))
  }

  return {
    unverifiedUsers,
    adminError,
    fetchAllNonVerifiedUsers,
    verifyUsers,
  }
}
