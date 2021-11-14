import moment from 'moment'
import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import initialState, { initialStateType } from '../../initialState'
import { AppDispatch } from '../../store'
import { AuthActionType, GlobalNotificationsFeedActionType } from '../../action-types'

export default function globalNotificationsReducer(
  state: initialStateType['feed']['globalNotifications'] = initialState.feed.globalNotifications,
  action: AnyAction,
): initialStateType['feed']['globalNotifications'] {
  switch (action.type) {
    case GlobalNotificationsFeedActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS:
      return {
        ...state,
        canLoadMore: action.canLoadMore,
      }

    case GlobalNotificationsFeedActionType.FETCH_NOTIFICATIONS:
      return {
        ...state,
        isLoading: true,
      }
    case GlobalNotificationsFeedActionType.FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          // acccumulate retrieved feed items
          globalNotification: [...(state.data.globalNotification || []), ...action.data],
        },
      }
    case GlobalNotificationsFeedActionType.FETCH_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      }
    case GlobalNotificationsFeedActionType.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        data: {
          ...state.data,
          cleaning: null,
        },
      }
    // also include auth actions that affect the feed
    case AuthActionType.REQUEST_LOG_USER_OUT:
      return initialState.feed.globalNotifications
    default:
      return state
  }
}

type FeedActionsType = {
  clearFeedItems?: () => any
  fetchCleaningFeedItems?: (starting_date?, page_chunk_size?: number) => any
}

export const FeedActions: FeedActionsType = {}

FeedActions.clearFeedItems = () => ({ type: GlobalNotificationsFeedActionType.CLEAR_NOTIFICATIONS })

FeedActions.fetchCleaningFeedItems =
  (starting_date = new Date(), page_chunk_size = 20) =>
  (dispatch: AppDispatch) =>
    dispatch(
      apiClient({
        url: '/feed/cleanings/',
        method: 'get',
        types: {
          REQUEST: GlobalNotificationsFeedActionType.FETCH_NOTIFICATIONS,
          SUCCESS: GlobalNotificationsFeedActionType.FETCH_NOTIFICATIONS_SUCCESS,
          FAILURE: GlobalNotificationsFeedActionType.FETCH_NOTIFICATIONS_FAILURE,
        },
        options: {
          data: {},
          // endpoint is expecting them as query parameters, not data
          params: {
            starting_date: moment(starting_date).format(),
            page_chunk_size,
          },
        },
        onSuccess: (res) => {
          dispatch({
            type: GlobalNotificationsFeedActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS,
            // assume that there are more items if we receive the max chunk size
            canLoadMore: Boolean(res?.data?.length === page_chunk_size),
          })
          return { success: true, status: res.status, data: res.data }
        },
      }),
    )
