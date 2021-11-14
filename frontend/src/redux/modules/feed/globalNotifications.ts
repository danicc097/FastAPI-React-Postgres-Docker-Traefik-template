import moment from 'moment'
import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../../store'
import { AuthActionType } from 'src/redux/modules/auth/auth'
import { schema } from 'src/types/schema_override'

type GlobalNotificationsFeedDataType = {
  globalNotification: Array<schema['GlobalNotificationFeedItem']>
}

type initialStateType = {
  feed: {
    globalNotifications: {
      data?: GlobalNotificationsFeedDataType | GenObjType<null>
      canLoadMore: boolean
      hasNewNotifications: boolean
      isLoading: boolean
      error: schema['HTTPValidationError']
    }
  }
}

const initialState: initialStateType = {
  feed: {
    globalNotifications: {
      data: null,
      canLoadMore: false,
      hasNewNotifications: false,
      isLoading: false,
      error: null,
    },
  },
}

export enum GlobalNotificationsActionType {
  FETCH_NOTIFICATIONS = 'globalNotifications/FETCH_NOTIFICATIONS',
  FETCH_NOTIFICATIONS_SUCCESS = 'globalNotifications/FETCH_NOTIFICATIONS_SUCCESS',
  FETCH_NOTIFICATIONS_FAILURE = 'globalNotifications/FETCH_NOTIFICATIONS_FAILURE',

  CLEAR_NOTIFICATIONS = 'globalNotifications/CLEAR_NOTIFICATIONS',

  SET_CAN_LOAD_MORE_NOTIFICATIONS = 'globalNotifications/SET_CAN_LOAD_MORE_NOTIFICATIONS',
  SET_HAS_NEW_NOTIFICATIONS = 'globalNotifications/SET_HAS_NEW_NOTIFICATIONS',
}

export default function globalNotificationsReducer(
  state: initialStateType['feed']['globalNotifications'] = initialState.feed.globalNotifications,
  action: AnyAction,
): initialStateType['feed']['globalNotifications'] {
  switch (action.type) {
    case GlobalNotificationsActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS:
      return {
        ...state,
        canLoadMore: action.canLoadMore,
      }

    case GlobalNotificationsActionType.FETCH_NOTIFICATIONS:
      return {
        ...state,
        isLoading: true,
      }
    case GlobalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS:
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
    case GlobalNotificationsActionType.FETCH_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      }
    case GlobalNotificationsActionType.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        data: {
          ...state.data,
          cleaning: null,
        },
      }
    // remove data when user logs out
    case AuthActionType.REQUEST_LOG_USER_OUT:
      return initialState.feed.globalNotifications
    default:
      return state
  }
}

type FeedActionsType = {
  clearFeedItems?: () => any
  fetchCleaningFeedItems?: (starting_date?: Date, page_chunk_size?: number) => any
}

export const GlobalNotificationsActionCreators: FeedActionsType = {}

GlobalNotificationsActionCreators.clearFeedItems = () => ({ type: GlobalNotificationsActionType.CLEAR_NOTIFICATIONS })

GlobalNotificationsActionCreators.fetchCleaningFeedItems = (starting_date = new Date(), page_chunk_size = 20) => {
  ;(dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/feed/cleanings/',
        method: 'get',
        types: {
          REQUEST: GlobalNotificationsActionType.FETCH_NOTIFICATIONS,
          SUCCESS: GlobalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS,
          FAILURE: GlobalNotificationsActionType.FETCH_NOTIFICATIONS_FAILURE,
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
            type: GlobalNotificationsActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS,
            // assume that there are more items if we receive the max chunk size
            canLoadMore: Boolean(res?.data?.length === page_chunk_size),
          })
          return { success: true, status: res.status, data: res.data }
        },
      }),
    )
  }
}
