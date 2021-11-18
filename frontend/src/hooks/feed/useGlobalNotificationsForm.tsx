import moment from 'moment'
import { useEffect, useCallback } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { GlobalNotificationsActionCreators } from 'src/redux/modules/feed/globalNotifications'
import { extractErrorMessages } from 'src/utils/errors'

export function useGlobalNotificationsForm() {
  const dispatch = useAppDispatch()

  const isLoading = useAppSelector((state) => state.feed.globalNotifications.isLoading)
  const error = useAppSelector((state) => state.feed.globalNotifications.error, shallowEqual)
  const feedItems = useAppSelector((state) => state.feed.globalNotifications.data, shallowEqual)
  const unreadItems = useAppSelector((state) => state.feed.globalNotifications.unreadData, shallowEqual)
  const hasNewNotifications = useAppSelector((state) => Boolean(state.feed.globalNotifications.hasNewNotifications))

  const errorList = extractErrorMessages(error)

  return {
    isLoading,
    errorList,
    hasNewNotifications,
    feedItems,
    unreadItems,
  }
}
