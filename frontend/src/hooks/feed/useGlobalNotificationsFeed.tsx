import moment from 'moment'
import { useEffect, useCallback, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useToasts } from 'src/hooks/ui/useToasts'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { GlobalNotificationsActionCreators } from 'src/redux/modules/feed/globalNotifications'
import { extractErrorMessages } from 'src/utils/errors'
import { schema } from 'src/types/schemaOverride'

export function useGlobalNotificationsFeed() {
  const { addToast } = useToasts()

  const [docIsVisible, setDocIsVisible] = useState(true)
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((state) => state.feed.globalNotifications.isLoading)
  const feedItems = useAppSelector((state) => state.feed.globalNotifications.data, shallowEqual)
  const unreadItems = useAppSelector((state) => state.feed.globalNotifications.unreadData, shallowEqual)
  const hasNewGlobalNotifications = useAppSelector((state) =>
    Boolean(state.feed.globalNotifications.hasNewGlobalNotifications),
  )
  const notificationError = useAppSelector((state) => state.feed.globalNotifications.error, shallowEqual)

  const errorList = extractErrorMessages(notificationError)

  const fetchFeedItems = async ({ starting_date = new Date(moment().utc().format()) }: { starting_date?: Date }) => {
    dispatch(GlobalNotificationsActionCreators.fetchFeedItems({ starting_date }))
  }

  const setHasNewGlobalNotifications = (hasNewGlobalNotifications: boolean) => {
    dispatch(GlobalNotificationsActionCreators.setHasNewGlobalNotifications({ hasNewGlobalNotifications }))
  }

  return {
    isLoading,
    errorList,
    hasNewGlobalNotifications,
    feedItems,
    unreadItems,
    fetchFeedItems,
    setHasNewGlobalNotifications,
  }
}
