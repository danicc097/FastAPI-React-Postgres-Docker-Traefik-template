import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../../store'
import { UiActionCreators } from '../ui/ui'
import { schema } from 'src/types/schemaOverride'
import { loadingState, successState } from '../../utils/slices'

export type initialStateType = {
  auth: {
    isLoading: boolean
    isAuthenticated: boolean
    error?: schema['HTTPValidationError']
    pwdResetError?: schema['HTTPValidationError']
    userLoaded: boolean
    user: schema['UserPublic']
  }
}

const initialState: initialStateType = {
  auth: {
    isLoading: false,
    isAuthenticated: false,
    error: null,
    pwdResetError: null,
    userLoaded: false,
    user: null,
  },
}

export enum AuthActionType {
  REQUEST_LOGIN = 'auth/REQUEST_LOGIN',
  REQUEST_LOGIN_FAILURE = 'auth/REQUEST_LOGIN_FAILURE',
  REQUEST_LOGIN_SUCCESS = 'auth/REQUEST_LOGIN_SUCCESS',

  REQUEST_LOG_USER_OUT = 'auth/REQUEST_LOG_USER_OUT',

  FETCHING_USER_FROM_TOKEN = 'auth/FETCHING_USER_FROM_TOKEN',
  FETCHING_USER_FROM_TOKEN_SUCCESS = 'auth/FETCHING_USER_FROM_TOKEN_SUCCESS',
  FETCHING_USER_FROM_TOKEN_FAILURE = 'auth/FETCHING_USER_FROM_TOKEN_FAILURE',

  REQUEST_USER_SIGN_UP = 'auth/REQUEST_USER_SIGN_UP',
  REQUEST_USER_SIGN_UP_SUCCESS = 'auth/REQUEST_USER_SIGN_UP_SUCCESS',
  REQUEST_USER_SIGN_UP_FAILURE = 'auth/REQUEST_USER_SIGN_UP_FAILURE',

  REQUEST_PASSWORD_RESET = 'auth/REQUEST_PASSWORD_RESET',
  REQUEST_PASSWORD_RESET_SUCCESS = 'auth/REQUEST_PASSWORD_RESET_SUCCESS',
  REQUEST_PASSWORD_RESET_FAILURE = 'auth/REQUEST_PASSWORD_RESET_FAILURE',
}

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
        user: null,
      }

    case AuthActionType.REQUEST_LOGIN_SUCCESS:
      return successState(state)

    case AuthActionType.REQUEST_LOG_USER_OUT:
      return {
        ...initialState.auth,
      }

    case AuthActionType.FETCHING_USER_FROM_TOKEN:
      return loadingState(state)

    case AuthActionType.FETCHING_USER_FROM_TOKEN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        userLoaded: true,
        isLoading: false,
        user: action.data,
      }

    case AuthActionType.FETCHING_USER_FROM_TOKEN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        userLoaded: true,
        isLoading: false,
        error: action.error,
        user: null,
      }

    case AuthActionType.REQUEST_USER_SIGN_UP:
      return loadingState(state)

    case AuthActionType.REQUEST_USER_SIGN_UP_SUCCESS:
      return successState(state)

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

export type AuthActionsParams = {
  username?: string
  email?: string
  password?: string
  message?: string
}

type ActionCreators = {
  requestUserLogin: ({ email, password }: AuthActionsParams) => any
  fetchUserFromToken: () => any
  logUserOut: () => any
  registerNewUser: ({ username, email, password }: AuthActionsParams) => any
  requestPasswordReset: ({ email, message }: AuthActionsParams) => any
}

export const AuthActionCreators: Partial<ActionCreators> = {}

AuthActionCreators.requestUserLogin = ({ email, password }) => {
  return async (dispatch: AppDispatch) => {
    const formData = new FormData()
    formData.set('username', email)
    formData.set('password', password)

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
          dispatch({ type: AuthActionType.REQUEST_LOGIN_SUCCESS, data: res.data })

          return dispatch(AuthActionCreators.fetchUserFromToken())
        },
      }),
    )
  }
}

AuthActionCreators.requestPasswordReset = ({ email, message }) => {
  return async (dispatch: AppDispatch) => {
    const reset_request: schema['CreatePasswordResetRequestParams'] = {
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
          data: { reset_request },
          params: {},
        },
        onSuccess: (res) => {
          dispatch(
            UiActionCreators.addToast({
              toast: {
                id: 'password-reset-request-toast-success',
                title: `Your password reset request has been received!`,
                color: 'success',
                iconType: 'checkInCircleFilled',
                toastLifeTimeMs: 15000,
                text: 'An administrator will contact you shortly.',
              },
            }),
          )
          return dispatch({ type: AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS, data: res.data })
        },
      }),
    )
  }
}

AuthActionCreators.fetchUserFromToken = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(
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
          console.log(`res`, res)
          dispatch(UiActionCreators.removeToastById({ toastId: 'auth-toast-redirect' }))

          return dispatch({ type: AuthActionType.FETCHING_USER_FROM_TOKEN_SUCCESS, data: res.data })
        },
      }),
    )
  }
}

AuthActionCreators.logUserOut = () => {
  localStorage.removeItem('access_token')

  return {
    type: AuthActionType.REQUEST_LOG_USER_OUT,
  }
}

AuthActionCreators.registerNewUser = ({ username, email, password }) => {
  return async (dispatch: AppDispatch) => {
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
          console.log(`res`, res)
          dispatch(
            UiActionCreators.addToast({
              toast: {
                id: 'user-register-toast-success',
                title: `Successfully registered!`,
                color: 'success',
                iconType: 'checkInCircleFilled',
                toastLifeTimeMs: 50000,
                text: 'An administrator will approve your account shortly',
              },
            }),
          )

          return dispatch({ type: AuthActionType.REQUEST_USER_SIGN_UP_SUCCESS, data: res.data })
        },
      }),
    )
  }
}
