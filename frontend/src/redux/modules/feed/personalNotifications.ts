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
    personalNotifications: {
      data?: Array<schema['PersonalNotificationFeedItem']>
      unreadData?: Array<schema['PersonalNotificationFeedItem']['personal_notification_id']>
      canLoadMore: boolean
      hasNewPersonalNotifications: boolean
      isLoading: boolean
      error: schema['HTTPValidationError']
    }
  }
}

const initialState: initialStateType = {
  feed: {
    personalNotifications: {
      data: null,
      unreadData: null,
      canLoadMore: false,
      hasNewPersonalNotifications: false,
      isLoading: false,
      error: null,
    },
  },
}

export enum PersonalNotificationsActionType {
  FETCH_NOTIFICATIONS = 'personalNotifications/FETCH_NOTIFICATIONS',
  FETCH_NOTIFICATIONS_SUCCESS = 'personalNotifications/FETCH_NOTIFICATIONS_SUCCESS',
  FETCH_NOTIFICATIONS_FAILURE = 'personalNotifications/FETCH_NOTIFICATIONS_FAILURE',

  FETCH_HAS_NEW_NOTIFICATIONS = 'personalNotifications/FETCH_HAS_NEW_NOTIFICATIONS',
  FETCH_HAS_NEW_NOTIFICATIONS_SUCCESS = 'personalNotifications/FETCH_HAS_NEW_NOTIFICATIONS_SUCCESS',
  FETCH_HAS_NEW_NOTIFICATIONS_FAILURE = 'personalNotifications/FETCH_HAS_NEW_NOTIFICATIONS_FAILURE',

  CLEAR_NOTIFICATIONS = 'personalNotifications/CLEAR_NOTIFICATIONS',

  SET_CAN_LOAD_MORE_NOTIFICATIONS = 'personalNotifications/SET_CAN_LOAD_MORE_NOTIFICATIONS',
  SET_HAS_NEW_NOTIFICATIONS = 'personalNotifications/SET_HAS_NEW_NOTIFICATIONS',

  CREATE_NEW_NOTIFICATION = 'personalNotifications/CREATE_NEW_NOTIFICATION',
  CREATE_NEW_NOTIFICATION_SUCCESS = 'personalNotifications/CREATE_NEW_NOTIFICATION_SUCCESS',
  CREATE_NEW_NOTIFICATION_FAILURE = 'personalNotifications/CREATE_NEW_NOTIFICATION_FAILURE',

  DELETE_NOTIFICATION = 'personalNotifications/DELETE_NOTIFICATION',
  DELETE_NOTIFICATION_SUCCESS = 'personalNotifications/DELETE_NOTIFICATION_SUCCESS',
  DELETE_NOTIFICATION_FAILURE = 'personalNotifications/DELETE_NOTIFICATION_FAILURE',
}

export default function personalNotificationsReducer(
  state: initialStateType['feed']['personalNotifications'] = initialState.feed.personalNotifications,
  action: AnyAction,
): initialStateType['feed']['personalNotifications'] {
  switch (action.type) {
    case PersonalNotificationsActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS:
      return {
        ...state,
        canLoadMore: action.canLoadMore,
      }

    case PersonalNotificationsActionType.SET_HAS_NEW_NOTIFICATIONS:
      return {
        ...state,
        hasNewPersonalNotifications: action.hasNewPersonalNotifications,
      }

    case PersonalNotificationsActionType.FETCH_NOTIFICATIONS:
      return loadingState(state)

    case PersonalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS:
      const lastDateUTC = state.data?.[state.data?.length - 1]?.event_timestamp
      console.log(`LastDateUTC: ${lastDateUTC}`)
      return {
        ...state,
        isLoading: false,
        error: null,
        data: [...action.data, ...(state.data || [])]
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.personal_notification_id === item.personal_notification_id),
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
            !state.data?.find(
              (notification) => notification?.personal_notification_id === item.personal_notification_id,
            ) &&
            action.data?.find((notification) => notification?.event_timestamp > lastDateUTC) &&
            state.data.length > 0
          ) {
            acc.push(item.personal_notification_id)
          }
          return acc
        }, []),
      }

    case PersonalNotificationsActionType.FETCH_NOTIFICATIONS_FAILURE:
      return errorState(state, action)

    case PersonalNotificationsActionType.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        data: [],
      }

    case PersonalNotificationsActionType.CREATE_NEW_NOTIFICATION:
      return loadingState(state)

    case PersonalNotificationsActionType.CREATE_NEW_NOTIFICATION_SUCCESS:
      return successState(state)

    case PersonalNotificationsActionType.CREATE_NEW_NOTIFICATION_FAILURE:
      return errorState(state, action)

    case PersonalNotificationsActionType.DELETE_NOTIFICATION:
      return loadingState(state)

    case PersonalNotificationsActionType.DELETE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: state.data?.filter((notification) => notification?.personal_notification_id !== action.id),
      }

    case PersonalNotificationsActionType.DELETE_NOTIFICATION_FAILURE:
      return errorState(state, action)

    case AuthActionType.REQUEST_LOG_USER_OUT:
      return initialState.feed.personalNotifications

    default:
      return state
  }
}

type ActionCreatorsParams = {
  id?: schema['PersonalNotificationFeedItem']['personal_notification_id']
  notification?: schema['CreateGlobalNotificationParams']
  starting_date?: Date
}

type ActionCreators = {
  clearFeedItems: () => any
  fetchFeedItems: ({ starting_date }: ActionCreatorsParams) => any
  setHasNewPersonalNotifications: ({ hasNewPersonalNotifications }) => any
  createNotification: ({ notification }: ActionCreatorsParams) => any
  deleteNotification: ({ id }: ActionCreatorsParams) => any
}

export const PersonalNotificationsActionCreators: Partial<ActionCreators> = {}

PersonalNotificationsActionCreators.clearFeedItems = () => ({
  type: PersonalNotificationsActionType.CLEAR_NOTIFICATIONS,
})

PersonalNotificationsActionCreators.fetchFeedItems = ({ starting_date }) => {
  const PAGE_CHUNK_SIZE = 5
  console.log(starting_date.toISOString())
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/users/personal-notifications/',
        method: 'get',
        types: {
          REQUEST: PersonalNotificationsActionType.FETCH_NOTIFICATIONS,
          SUCCESS: PersonalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS,
          FAILURE: PersonalNotificationsActionType.FETCH_NOTIFICATIONS_FAILURE,
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
            type: PersonalNotificationsActionType.SET_CAN_LOAD_MORE_NOTIFICATIONS,
            canLoadMore: Boolean(res?.data?.length === PAGE_CHUNK_SIZE), // assume there's more
          })
          return dispatch({
            type: PersonalNotificationsActionType.FETCH_NOTIFICATIONS_SUCCESS,
            data: res?.data,
          })
        },
      }),
    )
  }
}

PersonalNotificationsActionCreators.setHasNewPersonalNotifications = ({ hasNewPersonalNotifications }) => {
  return async (dispatch: AppDispatch) => {
    return dispatch({
      type: PersonalNotificationsActionType.SET_HAS_NEW_NOTIFICATIONS,
      hasNewPersonalNotifications,
    })
  }
}

PersonalNotificationsActionCreators.createNotification = ({ notification }) => {
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/users/create-personal-notification/',
        method: 'post',
        types: {
          REQUEST: PersonalNotificationsActionType.CREATE_NEW_NOTIFICATION,
          SUCCESS: PersonalNotificationsActionType.CREATE_NEW_NOTIFICATION_SUCCESS,
          FAILURE: PersonalNotificationsActionType.CREATE_NEW_NOTIFICATION_FAILURE,
        },
        options: {
          data: { notification },
          params: {},
        },
        onSuccess: (res) => {
          dispatch(
            UiActionCreators.addToast({
              toast: {
                id: 'create-personal-notification-success',
                title: `Successfully created the notification!`,
                color: 'success',
                iconType: 'checkInCircleFilled',
                toastLifeTimeMs: 5000,
                text: `Users with role '${notification.receiver_role}' will receive it.`,
              },
            }),
          )
          return dispatch({ type: PersonalNotificationsActionType.CREATE_NEW_NOTIFICATION_SUCCESS })
        },
      }),
    )
  }
}

PersonalNotificationsActionCreators.deleteNotification = ({ id }) => {
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: `/admin/delete-notification/${id}/`,
        method: 'delete',
        types: {
          REQUEST: PersonalNotificationsActionType.DELETE_NOTIFICATION,
          SUCCESS: PersonalNotificationsActionType.DELETE_NOTIFICATION_SUCCESS,
          FAILURE: PersonalNotificationsActionType.DELETE_NOTIFICATION_FAILURE,
        },
        options: {
          data: {},
          params: {},
        },
        onSuccess: (res) => {
          return dispatch({ type: PersonalNotificationsActionType.DELETE_NOTIFICATION_SUCCESS, id })
        },
      }),
    )
  }
}
