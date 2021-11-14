import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { AdminActions } from 'src/redux/modules/admin/admin'

export const useAllUsers = () => {
  const dispatch = useAppDispatch()

  const adminError = useAppSelector((state) => state.admin.error)
  const isAdmin = useAppSelector((state) => state.auth.user.is_superuser)
  const allUsers = useAppSelector((state) => state.admin.data.allUsers, shallowEqual)

  useEffect(() => {
    if (isAdmin && allUsers === undefined) {
      return dispatch(AdminActions.fetchAllUsers())
    }
  }, [isAdmin, dispatch, AdminActions.fetchAllUsers])

  const fetchAllUsers = () => {
    return dispatch(AdminActions.fetchAllUsers())
  }

  return {
    allUsers,
    adminError,
    fetchAllUsers,
  }
}
