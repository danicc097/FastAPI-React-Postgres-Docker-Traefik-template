import moment from 'moment'
import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../../store'
import { AuthActionType } from 'src/redux/modules/auth/auth'
import { schema } from 'src/types/schemaOverride'
import { errorState, loadingState, successState } from 'src/redux/utils/slices'
import { UiActionCreators } from 'src/redux/modules/ui/ui'

export type initialStateType = {
  feed: {
    globalNotifications: {
      data?: Array<schema['GlobalNotificationFeedItem']>
      unreadData?: Array<schema['GlobalNotificationFeedItem']['global_notification_id']>
      canLoadMore: boolean
      hasNewGlobalNotifications: boolean
      isLoading: boolean
      error: schema['HTTPValidationError']
    }
  }
}

const initialState: initialStateType = {
  feed: {
    globalNotifications: {
      data: null,
      unreadData: null,
      canLoadMore: false,
      hasNewGlobalNotifications: false,
      isLoading: false,
      error: null,
    },
  },
}

export enum GlobalNotificationsActionType {
  FETCH_NOTIFICATIONS = 'globalNotifications/FETCH_NOTIFICATIONS',
  FETCH_NOTIFICATIONS_SUCCESS = 'globalNotifications/FETCH_NOTIFICATIONS_SUCCESS',
  FETCH_NOTIFICATIONS_FAILURE = 'globalNotifications/FETCH_NOTIFICATIONS_FAILURE',

  FETCH_HAS_NEW_NOTIFICATIONS = 'globalNotifications/FETCH_HAS_NEW_NOTIFICATIONS',
  FETCH_HAS_NEW_NOTIFICATIONS_SUCCESS = 'globalNotifications/FETCH_HAS_NEW_NOTIFICATIONS_SUCCESS',
  FETCH_HAS_NEW_NOTIFICATIONS_FAILURE = 'globalNotifications/FETCH_HAS_NEW_NOTIFICATIONS_FAILURE',

  CLEAR_NOTIFICATIONS = 'globalNotifications/CLEAR_NOTIFICATIONS',

  SET_CAN_LOAD_MORE_NOTIFICATIONS = 'globalNotifications/SET_CAN_LOAD_MORE_NOTIFICATIONS',
  SET_HAS_NEW_NOTIFICATIONS = 'globalNotifications/SET_HAS_NEW_NOTIFICATIONS',

  CREATE_NEW_NOTIFICATION = 'globalNotifications/CREATE_NEW_NOTIFICATION',
  CREATE_NEW_NOTIFICATION_SUCCESS = 'globalNotifications/CREATE_NEW_NOTIFICATION_SUCCESS',
  CREATE_NEW_NOTIFICATION_FAILURE = 'globalNotifications/CREATE_NEW_NOTIFICATION_FAILURE',

  DELETE_NOTIFICATION = 'globalNotifications/DELETE_NOTIFICATION',
  DELETE_NOTIFICATION_SUCCESS = 'globalNotifications/DELETE_NOTIFICATION_SUCCESS',
  DELETE_NOTIFICATION_FAILURE = 'globalNotifications/DELETE_NOTIFICATION_FAILURE',
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
        hasNewGlobalNotifications: action.hasNewGlobalNotifications,
      }

    case GlobalNotificationsActionType.FETCH_NOTIFICATIONS:
      return loadingState(state)

    case GlobalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS:
      const lastDateUTC = state.data?.[state.data?.length - 1]?.event_timestamp
      console.log(`LastDateUTC: ${lastDateUTC}`)
      return {
        ...state,
        isLoading: false,
        error: null,
        data: [...action.data, ...(state.data || [])]
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.global_notification_id === item.global_notification_id),
          )
          .sort((a, b) => {
            if (a.event_timestamp > b.event_timestamp) {
              return -1
            }
            if (a.event_timestamp < b.event_timestamp) {
              return 1
            }
            return 0
          }),
        unreadData: action.data?.reduce((acc, item) => {
          if (
            !state.data?.find((notification) => notification?.global_notification_id === item.global_notification_id) &&
            action.data?.find((notification) => notification?.event_timestamp > lastDateUTC) &&
            state.data.length > 0
          ) {
            acc.push(item.global_notification_id)
          }
          return acc
        }, []),
      }

    case GlobalNotificationsActionType.FETCH_NOTIFICATIONS_FAILURE:
      return errorState(state, action)

    case GlobalNotificationsActionType.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        data: [],
      }

    case GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION:
      return loadingState(state)

    case GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION_SUCCESS:
      return successState(state)

    case GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION_FAILURE:
      return errorState(state, action)

    case GlobalNotificationsActionType.DELETE_NOTIFICATION:
      return loadingState(state)

    case GlobalNotificationsActionType.DELETE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: state.data?.filter((notification) => notification?.global_notification_id !== action.id),
      }

    case GlobalNotificationsActionType.DELETE_NOTIFICATION_FAILURE:
      return errorState(state, action)

    case AuthActionType.REQUEST_LOG_USER_OUT:
      return initialState.feed.globalNotifications

    default:
      return state
  }
}

type ActionCreatorsParams = {
  id?: schema['GlobalNotificationFeedItem']['global_notification_id']
  notification?: schema['CreateGlobalNotificationParams']
  starting_date?: Date
  hasNewGlobalNotifications?: boolean
}

type ActionCreators = {
  clearFeedItems: () => any
  fetchFeedItems: ({ starting_date }: ActionCreatorsParams) => any
  setHasNewGlobalNotifications: ({ hasNewGlobalNotifications }) => any
  createNotification: ({ notification }: ActionCreatorsParams) => any
  deleteNotification: ({ id }: ActionCreatorsParams) => any
}

export const GlobalNotificationsActionCreators: Partial<ActionCreators> = {}

GlobalNotificationsActionCreators.clearFeedItems = () => ({
  type: GlobalNotificationsActionType.CLEAR_NOTIFICATIONS,
})

GlobalNotificationsActionCreators.fetchFeedItems = ({ starting_date }) => {
  const PAGE_CHUNK_SIZE = 5
  console.log(starting_date.toISOString())
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/users/global-notifications/',
        method: 'get',
        types: {
          REQUEST: GlobalNotificationsActionType.FETCH_NOTIFICATIONS,
          SUCCESS: GlobalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS,
          FAILURE: GlobalNotificationsActionType.FETCH_NOTIFICATIONS_FAILURE,
        },
        options: {
          data: {},
          params: {
            starting_date: starting_date.toISOString(),
            page_chunk_size: PAGE_CHUNK_SIZE,
          },
        },
        onSuccess: (res) => {
          dispatch({
            type: GlobalNotificationsActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS,
            canLoadMore: Boolean(res?.data?.length === PAGE_CHUNK_SIZE), // assume there's more
          })
          return dispatch({
            type: GlobalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS,
            data: res?.data,
          })
        },
      }),
    )
  }
}

GlobalNotificationsActionCreators.setHasNewGlobalNotifications = ({ hasNewGlobalNotifications }) => {
  return async (dispatch: AppDispatch) => {
    return dispatch({
      type: GlobalNotificationsActionType.SET_HAS_NEW_NOTIFICATIONS,
      hasNewGlobalNotifications,
    })
  }
}

GlobalNotificationsActionCreators.createNotification = ({ notification }) => {
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/admin/create-global-notification/',
        method: 'post',
        types: {
          REQUEST: GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION,
          SUCCESS: GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION_SUCCESS,
          FAILURE: GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION_FAILURE,
        },
        options: {
          data: { notification },
          params: {},
        },
        onSuccess: (res) => {
          dispatch(
            UiActionCreators.addToast({
              toast: {
                id: 'create-global-notification-success',
                title: `Successfully created the notification!`,
                color: 'success',
                iconType: 'checkInCircleFilled',
                toastLifeTimeMs: 5000,
                text: `Users with role '${notification.receiver_role}' will receive it.`,
              },
            }),
          )
          return dispatch({ type: GlobalNotificationsActionType.CREATE_NEW_NOTIFICATION_SUCCESS })
        },
      }),
    )
  }
}

GlobalNotificationsActionCreators.deleteNotification = ({ id }) => {
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: `/admin/delete-notification/${id}/`,
        method: 'delete',
        types: {
          REQUEST: GlobalNotificationsActionType.DELETE_NOTIFICATION,
          SUCCESS: GlobalNotificationsActionType.DELETE_NOTIFICATION_SUCCESS,
          FAILURE: GlobalNotificationsActionType.DELETE_NOTIFICATION_FAILURE,
        },
        options: {
          data: {},
          params: {},
        },
        onSuccess: (res) => {
          return dispatch({ type: GlobalNotificationsActionType.DELETE_NOTIFICATION_SUCCESS, id })
        },
      }),
    )
  }
}
