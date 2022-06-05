import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { AdminActionCreators } from 'src/redux/modules/admin/admin'

export const useAllUsers = () => {
  const dispatch = useAppDispatch()

  const adminError = useAppSelector((state) => state.admin.error)
  const isAdmin = useAppSelector((state) => state.auth.user?.is_superuser)
  const allUsers = useAppSelector((state) => state.admin.data.allUsers, shallowEqual)

  useEffect(() => {
    if (isAdmin && allUsers === undefined) {
      return dispatch(AdminActionCreators.fetchAllUsers())
    }
  }, [isAdmin, dispatch, AdminActionCreators.fetchAllUsers])

  const fetchAllUsers = () => {
    return dispatch(AdminActionCreators.fetchAllUsers())
  }

  return {
    allUsers,
    adminError,
    fetchAllUsers,
  }
}
