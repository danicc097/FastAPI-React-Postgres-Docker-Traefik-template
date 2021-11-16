// core logic for the cleaning feed.

import moment from 'moment'
import { useEffect, useCallback } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { GlobalNotificationsActionCreators } from 'src/redux/modules/feed/globalNotifications'

// useDispatch and useSelector in our custom hook to:
// 1. keep the body of our functional components clean,
// 2. offer a composable abstraction over a redux slice, so our components can be redux agnostic,
// 3. allow for descriptive names for a disparate collection of functions, effects, and data.
//    Everything in our custom hook belongs together.
export function useGlobalNotificationsFeed() {
  const dispatch = useAppDispatch()
  // The variables will be set to the state defined from their respective reducers
  // every time the hook useGlobalNotificationsFeed is called.
  // The selected state is compared to determine whether the component needs to be re-rendered.
  // When comparing booleans, strict equality is enough
  const isLoading = useAppSelector((state) => state.feed.globalNotifications.isLoading)
  // When comparing objects, remember to use shallow equal
  const error = useAppSelector((state) => state.feed.globalNotifications.error, shallowEqual)
  const globalNotificationsFeedItems = useAppSelector((state) => state.feed.globalNotifications.data, shallowEqual)
  const globalNotificationsUnreadItems = useAppSelector(
    (state) => state.feed.globalNotifications.unreadData,
    shallowEqual,
  )
  const hasNewNotifications = useAppSelector((state) => Boolean(state.feed.globalNotifications.hasNewNotifications))

  /**
   * Requires UTC dates.
   *  @example
   * starting_date = new Date(moment().utc().format())
   * fetchFeedItems(starting_date)
   */
  const fetchFeedItems = useCallback(
    (starting_date?) => {
      dispatch(GlobalNotificationsActionCreators.clearFeedItemsFromStore()) // must get rid of current feed items
      dispatch(GlobalNotificationsActionCreators.fetchFeedItems(starting_date))
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
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [dispatch, hasNewNotifications])

  return {
    isLoading,
    error,
    hasNewNotifications,
    globalNotificationsFeedItems,
    globalNotificationsUnreadItems,
    fetchFeedItems,
    fetchFeedItemsByLastRead,
  }
}
