import moment from 'moment'
import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../../store'
import { AuthActionType } from 'src/redux/modules/auth/auth'
import { schema } from 'src/types/schema_override'

type initialStateType = {
  feed: {
    globalNotifications: {
      data?: Array<schema['GlobalNotificationFeedItem']> | []
      unreadData?: Array<schema['GlobalNotificationFeedItem']> | []
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
      data: [],
      unreadData: [],
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

  FETCH_UNREAD_NOTIFICATIONS = 'globalNotifications/FETCH_UNREAD_NOTIFICATIONS',
  FETCH_UNREAD_NOTIFICATIONS_SUCCESS = 'globalNotifications/FETCH_UNREAD_NOTIFICATIONS_SUCCESS',
  FETCH_UNREAD_NOTIFICATIONS_FAILURE = 'globalNotifications/FETCH_UNREAD_NOTIFICATIONS_FAILURE',

  FETCH_HAS_NEW_NOTIFICATIONS = 'globalNotifications/FETCH_HAS_NEW_NOTIFICATIONS',
  FETCH_HAS_NEW_NOTIFICATIONS_SUCCESS = 'globalNotifications/FETCH_HAS_NEW_NOTIFICATIONS_SUCCESS',
  FETCH_HAS_NEW_NOTIFICATIONS_FAILURE = 'globalNotifications/FETCH_HAS_NEW_NOTIFICATIONS_FAILURE',

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
    case GlobalNotificationsActionType.SET_HAS_NEW_NOTIFICATIONS:
      return {
        ...state,
        hasNewNotifications: action.hasNewNotifications,
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
        data: [...(state.data || []), ...action.data],
      }
    case GlobalNotificationsActionType.FETCH_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      }
    case GlobalNotificationsActionType.FETCH_UNREAD_NOTIFICATIONS:
      return {
        ...state,
        isLoading: true,
      }
    case GlobalNotificationsActionType.FETCH_UNREAD_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        unreadData: [...action.data], // override each time
      }
    case GlobalNotificationsActionType.FETCH_UNREAD_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      }
    case GlobalNotificationsActionType.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        data: [],
      }
    // remove data when user logs out
    case AuthActionType.REQUEST_LOG_USER_OUT:
      return initialState.feed.globalNotifications
    default:
      return state
  }
}

type ActionCreatorsType = {
  clearFeedItemsFromStore: () => any
  fetchFeedItems: (starting_date?: Date) => any
  fetchFeedItemsByLastRead: () => any
  updateHasNewNotifications: () => any
}

export const GlobalNotificationsActionCreators: Partial<ActionCreatorsType> = {}

GlobalNotificationsActionCreators.clearFeedItemsFromStore = () => ({
  type: GlobalNotificationsActionType.CLEAR_NOTIFICATIONS,
})

GlobalNotificationsActionCreators.fetchFeedItems = (starting_date = new Date(moment().utc().format())) => {
  const PAGE_CHUNK_SIZE = 10
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/users/notifications/', // /notifications-by-last-read/
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
            starting_date: starting_date.toISOString(),
            page_chunk_size: PAGE_CHUNK_SIZE,
          },
        },
        onSuccess: (res) => {
          dispatch({
            type: GlobalNotificationsActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS,
            // assume that there are more items if we receive the max chunk size
            canLoadMore: Boolean(res?.data?.length === PAGE_CHUNK_SIZE),
          })
          return { success: true, status: res.status, data: res.data }
        },
      }),
    )
  }
}

GlobalNotificationsActionCreators.fetchFeedItemsByLastRead = () => {
  const PAGE_CHUNK_SIZE = 10
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/users/notifications-by-last-read/',
        method: 'get',
        types: {
          REQUEST: GlobalNotificationsActionType.FETCH_UNREAD_NOTIFICATIONS,
          SUCCESS: GlobalNotificationsActionType.FETCH_UNREAD_NOTIFICATIONS_SUCCESS,
          FAILURE: GlobalNotificationsActionType.FETCH_UNREAD_NOTIFICATIONS_FAILURE,
        },
        options: {
          data: {},
          params: {},
        },
        onSuccess: (res) => {
          return { success: true, status: res.status, data: res.data }
        },
      }),
    )
  }
}

GlobalNotificationsActionCreators.updateHasNewNotifications = () => {
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/users/check-user-has-unread-notifications/',
        method: 'get',
        types: {
          REQUEST: GlobalNotificationsActionType.FETCH_HAS_NEW_NOTIFICATIONS,
          SUCCESS: GlobalNotificationsActionType.FETCH_HAS_NEW_NOTIFICATIONS_SUCCESS,
          FAILURE: GlobalNotificationsActionType.FETCH_HAS_NEW_NOTIFICATIONS_FAILURE,
        },
        options: {
          data: {},
          params: {},
        },
        onSuccess: (res) => {
          console.log(`res.data`, res.data)
          dispatch({
            type: GlobalNotificationsActionType.SET_HAS_NEW_NOTIFICATIONS,
            hasNewNotifications: res.data, // boolean returned by backend
          })
          return { success: true, status: res.status, data: res.data }
        },
      }),
    )
  }
}
