import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from './store'
import initialState, { initialStateType } from './initialState'
import { UiActions } from './ui'
import { AuthActionType, UserProfileActionType } from './action-types'
import { loadingState } from './utils/slices'

// recommended to enforce the return type of reducers to prevent "nevers", for instance
export default function userProfileReducer(
  state: initialStateType['userProfile'] = initialState.userProfile,
  action: AnyAction,
): initialStateType['userProfile'] {
  switch (action.type) {
    case UserProfileActionType.REQUEST_USER_UPDATE:
      return loadingState(state)
    case UserProfileActionType.REQUEST_USER_UPDATE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
        user: { id: null },
      }
    case UserProfileActionType.REQUEST_USER_UPDATE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    case AuthActionType.REQUEST_LOG_USER_OUT:
      return initialState.userProfile
    default:
      return state
  }
}

export type UserUpdateActionsParamsType = {
  username?: string
  email?: string
  password?: string
  passwordConfirm?: string
  old_password?: string
}

// make optional properties to allow easier usage of actions inside other actions in this file.
type UserUpdateActionsType = {
  requestUserUpdate: ({ email, username, password, old_password }: UserUpdateActionsParamsType) => any
}

export const UserUpdateActions: Partial<UserUpdateActionsType> = {}

UserUpdateActions.requestUserUpdate =
  ({ email, username, password, old_password }) =>
  async (dispatch: AppDispatch) => {
    // create the url-encoded form data

    // set the request headers (override defaulOptions)
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    // we HAVE TO _return_ a dispatch, else we won't get the
    // returns of onSuccess or onFailure and verify types in ProfilePage, etc
    return dispatch(
      apiClient({
        url: `/users/me/`,
        method: 'put',
        types: {
          REQUEST: UserProfileActionType.REQUEST_USER_UPDATE,
          SUCCESS: UserProfileActionType.REQUEST_USER_UPDATE_SUCCESS,
          FAILURE: UserProfileActionType.REQUEST_USER_UPDATE_FAILURE,
        },
        options: {
          data: {
            user_update: {
              // dynamically set update form data if truthy values
              ...(email && { email: email }),
              ...(username && { username: username }),
              ...(password && { password: password }),
              ...(old_password && { old_password: old_password }),
            },
          },
          headers,
          params: {},
        },
        onSuccess: (res) => {
          dispatch(
            UiActions.addToast({
              id: 'user-update-toast-success',
              title: `Your credentials have been updated!`,
              color: 'success',
              iconType: 'checkInCircleFilled',
              toastLifeTimeMs: 115000,
              text: 'You will be logged out and redirected to the login page in a few seconds.',
            }),
          )
          return dispatch({
            type: UserProfileActionType.REQUEST_USER_UPDATE_SUCCESS,
            success: true,
            status: res.status,
            data: res.data,
          })
        },
        onFailure: (res) => {
          console.log('onFailure: ')
          console.log(res)
          console.log(res.error?.data?.detail)
          dispatch(
            UiActions.addToast({
              id: 'user-update-toast-failure',
              title: 'Failure!',
              color: 'danger',
              iconType: 'crossInACircleFilled',
              toastLifeTimeMs: 15000,
              text: `We couldn't update your user data.\n ${res.error?.data?.detail}`,
            }),
          )
          return {
            type: UserProfileActionType.REQUEST_USER_UPDATE_FAILURE,
            success: false,
            status: res.error?.status,
            data: res.data,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }
