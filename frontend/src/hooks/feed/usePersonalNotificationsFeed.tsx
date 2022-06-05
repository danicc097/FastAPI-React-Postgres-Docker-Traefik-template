import moment from 'moment'
import { useEffect, useCallback, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useToasts } from 'src/hooks/ui/useToasts'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { PersonalNotificationsActionCreators } from 'src/redux/modules/feed/personalNotifications'
import { extractErrorMessages } from 'src/utils/errors'
import { schema } from 'src/types/schemaOverride'

export function usePersonalNotificationsFeed() {
  const { addToast } = useToasts()

  const [docIsVisible, setDocIsVisible] = useState(true)
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((state) => state.feed.personalNotifications.isLoading)
  const feedItems = useAppSelector((state) => state.feed.personalNotifications.data, shallowEqual)
  const unreadItems = useAppSelector((state) => state.feed.personalNotifications.unreadData, shallowEqual)
  const hasNewPersonalNotifications = useAppSelector((state) =>
    Boolean(state.feed.personalNotifications.hasNewPersonalNotifications),
  )
  const notificationError = useAppSelector((state) => state.feed.personalNotifications.error, shallowEqual)

  const errorList = extractErrorMessages(notificationError)

  const fetchFeedItems = async ({ starting_date = new Date(moment().utc().format()) }: { starting_date?: Date }) => {
    dispatch(PersonalNotificationsActionCreators.fetchFeedItems({ starting_date }))
  }
  const setHasNewPersonalNotifications = (hasNewPersonalNotifications: boolean) => {
    dispatch(PersonalNotificationsActionCreators.setHasNewPersonalNotifications({ hasNewPersonalNotifications }))
  }

  return {
    isLoading,
    errorList,
    setHasNewPersonalNotifications,
    hasNewPersonalNotifications,
    feedItems,
    unreadItems,
    fetchFeedItems,
  }
}
