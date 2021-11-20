import moment from 'moment'
import { useEffect, useCallback } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { GlobalNotificationsActionCreators } from 'src/redux/modules/feed/globalNotifications'
import { extractErrorMessages } from 'src/utils/errors'

// useDispatch and useSelector in our custom hook to:
// 1. keep the body of our functional components clean,
// 2. offer a composable abstraction over a redux slice, so our components can be redux agnostic,
// 3. allow for descriptive names for a disparate collection of functions, effects, and data.
//    Everything in our custom hook belongs together.
export function useGlobalNotificationsFeed() {
  const GLOBAL_NOTIFICATIONS_CHECK_INTERVAL_MS = 1000 * 10

  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((state) => state.feed.globalNotifications.isLoading)
  const error = useAppSelector((state) => state.feed.globalNotifications.error, shallowEqual)
  const feedItems = useAppSelector((state) => state.feed.globalNotifications.data, shallowEqual)
  const unreadItems = useAppSelector((state) => state.feed.globalNotifications.unreadData, shallowEqual)
  const hasNewNotifications = useAppSelector((state) => Boolean(state.feed.globalNotifications.hasNewNotifications))

  const errorList = extractErrorMessages(error)

  /**
   * Requires UTC dates.
   *  @example
   * starting_date = new Date(moment().utc().format())
   * fetchFeedItems(starting_date)
   */
  const fetchFeedItems = useCallback(
    ({ starting_date = new Date(moment().utc().format()) }: { starting_date?: Date }) => {
      console.log(`starting_date`, starting_date)
      // dispatch(GlobalNotificationsActionCreators.clearFeedItemsFromStore()) // must get rid of current feed items
      // if (starting_date) {
      //   dispatch(GlobalNotificationsActionCreators.fetchFeedItemsByLastRead(starting_date))
      // }
      dispatch(GlobalNotificationsActionCreators.fetchFeedItems({ starting_date }))
    },
    [dispatch],
  )

  const fetchFeedItemsByLastRead = () => {
    dispatch(GlobalNotificationsActionCreators.clearFeedItemsFromStore()) // must get rid of current feed items
    dispatch(GlobalNotificationsActionCreators.fetchFeedItemsByLastRead())
  }

  // one-off dispatch when the component mounts
  useEffect(() => {
    dispatch(GlobalNotificationsActionCreators.updateHasNewNotifications())
  }, [dispatch])

  useEffect(() => {
    if (!hasNewNotifications) {
      const interval = setInterval(() => {
        dispatch(GlobalNotificationsActionCreators.updateHasNewNotifications())
      }, GLOBAL_NOTIFICATIONS_CHECK_INTERVAL_MS)
      return () => clearInterval(interval)
    }
  }, [dispatch, hasNewNotifications])

  return {
    isLoading,
    errorList,
    hasNewNotifications,
    feedItems,
    unreadItems,
    fetchFeedItems,
    fetchFeedItemsByLastRead,
  }
}
