import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from './store'
import initialState, { initialStateType } from './initialState'
import { UiActions } from './ui'
import { AuthActionType } from './action-types'
import { schema } from 'src/types/schema_override'
import { loadingState } from './utils/slices'

// recommended to enforce the return type of reducers to prevent "nevers", for instance
export default function authReducer(
  state: initialStateType['auth'] = initialState.auth,
  action: AnyAction,
): initialStateType['auth'] {
  switch (action.type) {
    case AuthActionType.REQUEST_LOGIN:
      return loadingState(state)
    case AuthActionType.REQUEST_LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
        user: { id: null },
      }
    case AuthActionType.REQUEST_LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    case AuthActionType.REQUEST_LOG_USER_OUT:
      return {
        ...initialState.auth,
      }
    case AuthActionType.FETCHING_USER_FROM_TOKEN:
      return loadingState(state)
    case AuthActionType.FETCHING_USER_FROM_TOKEN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true, // for convenience
        userLoaded: true, // for convenience
        isLoading: false,
        user: action.data,
      }
    case AuthActionType.FETCHING_USER_FROM_TOKEN_FAILURE:
      return {
        ...state,
        isAuthenticated: false, // for convenience
        userLoaded: true, // for convenience
        isLoading: false,
        error: action.error,
        user: { id: null },
      }
    case AuthActionType.REQUEST_USER_SIGN_UP:
      return loadingState(state)
    case AuthActionType.REQUEST_USER_SIGN_UP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    case AuthActionType.REQUEST_USER_SIGN_UP_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.error,
      }
    case AuthActionType.REQUEST_PASSWORD_RESET:
      return loadingState(state)
    case AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        isLoading: false,
        pwdResetError: null,
      }
    case AuthActionType.REQUEST_PASSWORD_RESET_FAILURE:
      return {
        ...state,
        isLoading: false,
        pwdResetError: action.error,
      }

    default:
      return state
  }
}

export type AuthActionsParamsType = {
  username?: string
  email?: string
  password?: string
  message?: string
}

// make optional properties to allow easier usage of actions inside other actions in this file.
type AuthActionsType = {
  requestUserLogin: ({ email, password }: AuthActionsParamsType) => any
  fetchUserFromToken: () => any
  logUserOut: () => any
  registerNewUser: ({ username, email, password }: AuthActionsParamsType) => any
  requestPasswordReset: ({ email, message }: AuthActionsParamsType) => any
}

export const AuthActions: Partial<AuthActionsType> = {}

// make our action creators return asynchronous functions to take advantage
// of fastAPI async capabilities.
// Since those functions have access to the dispatch method,
// we can dispatch as many actions as we want inside the function.
// In a nutshell, this is what it does:
// dispatch REQUEST_LOGIN action as soon as we kick off the auth flow.
// That'll set the isLoading flag in the state tree.
// Then, we compose the form data and configure our axios request headers.
// Next we await the response from our API inside of a try/catch block.
// If the request is successful, we set the access_token in local storage
// and dispatch the REQUEST_LOGIN_SUCCESS action.
// As soon as an error pops up, we log it, and dispatch the REQUEST_LOGIN_FAILURE action.
// -- We also want to provide UI feedback for all this, over at LoginForm.js

AuthActions.requestUserLogin =
  ({ email, password }) =>
  async (dispatch: AppDispatch) => {
    // create the url-encoded form data
    const formData = new FormData()
    formData.set('username', email)
    formData.set('password', password)
    // set the request headers (override defaulOptions)
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    return dispatch(
      apiClient({
        url: `/users/login/token/`,
        method: 'post',
        types: {
          REQUEST: AuthActionType.REQUEST_LOGIN,
          SUCCESS: AuthActionType.REQUEST_LOGIN_SUCCESS,
          FAILURE: AuthActionType.REQUEST_LOGIN_FAILURE,
        },
        options: {
          data: formData,
          headers,
          params: {},
        },
        onSuccess: (res) => {
          const access_token = res?.data?.access_token
          localStorage.setItem('access_token', access_token)
          dispatch({ type: AuthActionType.REQUEST_LOGIN_SUCCESS })
          // dispatch the fetch user from token action creator instead
          return dispatch(AuthActions.fetchUserFromToken())
        },
        onFailure: (res) => {
          console.log(`onFailure res:`, res)
          return {
            type: res.type,
            success: false,
            status: res.error?.status,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }

AuthActions.requestPasswordReset =
  ({ email, message }) =>
  async (dispatch: AppDispatch) => {
    // create the url-encoded form data
    // set the request headers (override defaulOptions)
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const password_request: schema['PasswordResetRequestCreate'] = {
      email,
      message,
    }
    return dispatch(
      apiClient({
        url: `/users/request-password-reset/`,
        method: 'post',
        types: {
          REQUEST: AuthActionType.REQUEST_PASSWORD_RESET,
          SUCCESS: AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS,
          FAILURE: AuthActionType.REQUEST_PASSWORD_RESET_FAILURE,
        },
        options: {
          data: { password_request },
          headers,
          params: {},
        },
        onSuccess: (res) => {
          dispatch(
            UiActions.addToast({
              id: 'password-reset-request-toast-success',
              title: `Your password reset request has been received!`,
              color: 'success',
              iconType: 'checkInCircleFilled',
              toastLifeTimeMs: 15000,
              text: 'You can now contact an administrator for approval.',
            }),
          )
          return dispatch({ type: AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS })
        },
        onFailure: (res) => {
          console.log(`onFailure res:`, res)
          return {
            type: res.type,
            success: false,
            status: res.error?.status,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }

// retrieve all user data from backend
AuthActions.fetchUserFromToken = () => async (dispatch: AppDispatch) => {
  return dispatch(
    apiClient({
      url: '/users/me/',
      method: 'get',
      types: {
        REQUEST: AuthActionType.FETCHING_USER_FROM_TOKEN,
        SUCCESS: AuthActionType.FETCHING_USER_FROM_TOKEN_SUCCESS,
        FAILURE: AuthActionType.FETCHING_USER_FROM_TOKEN_FAILURE,
      },
      options: {
        data: {},
        params: {},
      },
      onSuccess: (res) => {
        // dispatch(cleaningActions.fetchAllUserOwnedCleaningJobs()); // why was this here in the first place
        console.log(`res`, res)
        dispatch(UiActions.removeToastById('auth-toast-redirect'))

        return { success: true, status: res.status, data: res.data }
      },
    }),
  )
}

AuthActions.logUserOut = () => {
  localStorage.removeItem('access_token')

  return {
    type: AuthActionType.REQUEST_LOG_USER_OUT,
  }
}

// use async actions for backend stuff.
// We are calling the dispatch function on the apiClient so that
// we have access to dispatch in the onSuccess handler
AuthActions.registerNewUser =
  ({ username, email, password }) =>
  async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: '/users/',
        method: 'post',
        types: {
          REQUEST: AuthActionType.REQUEST_USER_SIGN_UP,
          SUCCESS: AuthActionType.REQUEST_USER_SIGN_UP_SUCCESS,
          FAILURE: AuthActionType.REQUEST_USER_SIGN_UP_FAILURE,
        },
        options: {
          data: { new_user: { username, email, password } },
          params: {},
        },
        onSuccess: (res) => {
          // stash the access_token our server returns
          //   const access_token = res?.data?.access_token?.access_token
          //   localStorage.setItem('access_token', access_token)
          //   return dispatch(AuthActions.fetchUserFromToken())
          console.log(`res`, res)
          dispatch(
            UiActions.addToast({
              id: 'user-register-toast-success',
              title: `Successfully registered!`,
              color: 'success',
              iconType: 'checkInCircleFilled',
              toastLifeTimeMs: 50000,
              text: 'An administrator will approve your account shortly.',
            }),
          )
          //* have to return original response if we implement a custom onSuccess or onFailure
          return { type: res.type, success: true, status: res.status, data: res.data }
        },
        onFailure: (res) => {
          console.log(`res`, res)

          return {
            type: res.type,
            success: false,
            status: res.status,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }
