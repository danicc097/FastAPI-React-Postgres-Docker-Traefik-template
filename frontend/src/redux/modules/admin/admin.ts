// TODO use action.data as source of truth for reducers.
// e.g.: dispatch( {...} , data: { newStuff: arrayOfStuff, isRemoval: true, ... } )

import apiClient from 'src/services/apiClient'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../../store'
import { UiActionCreators } from '../ui/ui'
import { schema } from 'src/types/schema_override'
import { errorState, loadingState } from '../../utils/slices'
import { AuthActionType } from 'src/redux/modules/auth/auth'
import { paths } from 'src/types/schema'

type AdminDataType = {
  unverifiedUsers?: Array<schema['UserPublic']>
  passwordResetRequests?: Array<schema['PasswordResetRequest']>
  allUsers?: Array<schema['UserPublic']>
  //   [key: number]: Array<schema['OfferPublic']>
}

type initialStateType = {
  admin: {
    isLoading: boolean
    error?: schema['HTTPValidationError'] | GenObjType<string>
    data?: AdminDataType | GenObjType<null>
  }
}

const initialState: initialStateType = {
  admin: {
    isLoading: false,
    error: null,
    data: {},
  },
}

export enum AdminActionType {
  FETCH_ALL_USERS = 'admin/FETCH_ALL_USERS',
  FETCH_ALL_USERS_SUCCESS = 'admin/FETCH_ALL_USERS_SUCCESS',
  FETCH_ALL_USERS_FAILURE = 'admin/FETCH_ALL_USERS_FAILURE',

  FETCH_ALL_UNVERIFIED_USERS = 'admin/FETCH_ALL_UNVERIFIED_USERS',
  FETCH_ALL_UNVERIFIED_USERS_SUCCESS = 'admin/FETCH_ALL_UNVERIFIED_USERS_SUCCESS',
  FETCH_ALL_UNVERIFIED_USERS_FAILURE = 'admin/FETCH_ALL_UNVERIFIED_USERS_FAILURE',

  VERIFY_USERS = 'admin/VERIFY_USERS',
  VERIFY_USERS_SUCCESS = 'admin/VERIFY_USERS_SUCCESS',
  VERIFY_USERS_FAILURE = 'admin/VERIFY_USERS_FAILURE',

  UPDATE_USER_ROLE = 'admin/UPDATE_USER_ROLE',
  UPDATE_USER_ROLE_SUCCESS = 'admin/UPDATE_USER_ROLE_SUCCESS',
  UPDATE_USER_ROLE_FAILURE = 'admin/UPDATE_USER_ROLE_FAILURE',

  FETCH_ALL_PASSWORD_RESET_REQUESTS = 'admin/FETCH_ALL_PASSWORD_RESET_REQUESTS',
  FETCH_ALL_PASSWORD_RESET_REQUESTS_SUCCESS = 'admin/FETCH_ALL_PASSWORD_RESET_REQUESTS_SUCCESS',
  FETCH_ALL_PASSWORD_RESET_REQUESTS_FAILURE = 'admin/FETCH_ALL_PASSWORD_RESET_REQUESTS_FAILURE',

  RESET_PASSWORD_FOR_USER = 'admin/RESET_PASSWORD_FOR_USER',
  RESET_PASSWORD_FOR_USER_SUCCESS = 'admin/RESET_PASSWORD_FOR_USER_SUCCESS',
  RESET_PASSWORD_FOR_USER_FAILURE = 'admin/RESET_PASSWORD_FOR_USER_FAILURE',

  DELETE_PASSWORD_RESET_REQUEST = 'admin/DELETE_PASSWORD_RESET_REQUEST',
  DELETE_PASSWORD_RESET_REQUEST_SUCCESS = 'admin/DELETE_PASSWORD_RESET_REQUEST_SUCCESS',
  DELETE_PASSWORD_RESET_REQUEST_FAILURE = 'admin/DELETE_PASSWORD_RESET_REQUEST_FAILURE',

  REMOVE_PASSWORD_RESET_REQUEST_FROM_STORE = 'admin/REMOVE_PASSWORD_RESET_REQUEST_FROM_STORE',
}

/**
 * @param isRemoval whether it's a removal or addition of unverified users
 */
function updateStateOfUnverifiedUsers(
  state: initialStateType['admin'],
  users: Array<schema['UserPublic']>,
  isRemoval: boolean,
) {
  return {
    ...state,
    isLoading: false,
    error: null,
    data: {
      ...state.data,
      ...(users?.length > 0
        ? {
            unverifiedUsers: isRemoval
              ? // filter where oldUser's email key is not in the new array's object's email key
                state.data.unverifiedUsers.filter(
                  (oldUser) => !users.some((newUser) => newUser.email === oldUser.email),
                )
              : [...users],
          }
        : {}),
    },
  }
}

/*
isRemoval: whether it's a removal or addition of unverified users
*/
function updateStateOfPasswordResetRequests(
  state: initialStateType['admin'],
  requests: Array<schema['PasswordResetRequestCreate']> | Array<any>,
  isRemoval: boolean,
) {
  return {
    ...state,
    isLoading: false,
    error: null,
    data: {
      ...state.data,
      ...(requests?.length > 0
        ? {
            passwordResetRequests: isRemoval
              ? // removing requests from the store is done individually by email
                state.data.passwordResetRequests.filter((existingRequest) => requests[0] !== existingRequest.email)
              : [...requests],
          }
        : {}),
    },
  }
}

// recommended to enforce the return type of reducers to prevent "nevers", for instance
export default function adminReducer(
  state: initialStateType['admin'] = initialState.admin,
  action: AnyAction,
): initialStateType['admin'] {
  switch (action.type) {
    case AdminActionType.FETCH_ALL_USERS:
      return loadingState(state)

    case AdminActionType.FETCH_ALL_USERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          ...(action.data?.length > 0
            ? {
                allUsers: [...action.data],
              }
            : {}),
        },
      }
    case AdminActionType.FETCH_ALL_USERS_FAILURE:
      return errorState(state, action)

    case AdminActionType.FETCH_ALL_UNVERIFIED_USERS:
      return loadingState(state)

    case AdminActionType.FETCH_ALL_UNVERIFIED_USERS_SUCCESS:
      return updateStateOfUnverifiedUsers(state, action.data, false)

    case AdminActionType.FETCH_ALL_UNVERIFIED_USERS_FAILURE:
      return errorState(state, action)

    case AdminActionType.VERIFY_USERS_SUCCESS:
      return updateStateOfUnverifiedUsers(state, action.data, true)

    case AdminActionType.FETCH_ALL_PASSWORD_RESET_REQUESTS:
      return loadingState(state)

    case AdminActionType.FETCH_ALL_PASSWORD_RESET_REQUESTS_SUCCESS:
      return updateStateOfPasswordResetRequests(state, action.data, false)

    case AdminActionType.FETCH_ALL_PASSWORD_RESET_REQUESTS_FAILURE:
      return errorState(state, action)

    case AdminActionType.REMOVE_PASSWORD_RESET_REQUEST_FROM_STORE:
      return updateStateOfPasswordResetRequests(state, action.data, true)

    case AdminActionType.UPDATE_USER_ROLE:
      return loadingState(state)

    case AdminActionType.UPDATE_USER_ROLE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          allUsers: state.data.allUsers?.map((user) => {
            if (user.email === action.data?.email) {
              return {
                ...user,
                role: action.data?.role,
              }
            }
            return user
          }),
        },
      }

    case AdminActionType.UPDATE_USER_ROLE_FAILURE:
      return errorState(state, action)

    // remove data when user logs out
    case AuthActionType.REQUEST_LOG_USER_OUT:
      return initialState.admin

    default:
      return state
  }
}

type AdminActionsParams = {
  userEmails?: Array<schema['UserPublic']['email']>
  users?: Array<schema['UserPublic']>
  email?: string
  request?: schema['PasswordResetRequest']
  role_update?: schema['RoleUpdate']
}

type ActionCreators = {
  fetchAllUsers: () => any
  fetchAllNonVerifiedUsers: () => any
  verifyUsers: ({ userEmails }: AdminActionsParams) => any
  fetchAllPasswordResetUsers: () => any
  /**
   * Accept a password reset request created by a user.
   * Also used to manually reset passwords.
   */
  resetPasswordForUser: ({ email }: AdminActionsParams) => any
  /**
   * Delete a password reset request created by a user.
   */
  deletePasswordResetRequest: ({ request }: AdminActionsParams) => any
  _removeResetPasswordRequestFromStore: ({ email }: AdminActionsParams) => any
  updateUserRole: ({ role_update }: AdminActionsParams) => any
}

export const AdminActionCreators: Partial<ActionCreators> = {}

AdminActionCreators.fetchAllUsers = () => {
  return async (dispatch: AppDispatch) => {
    const headers = {}
    return dispatch(
      apiClient({
        url: `/admin/users/`,
        method: 'get',
        types: {
          REQUEST: AdminActionType.FETCH_ALL_USERS,
          SUCCESS: AdminActionType.FETCH_ALL_USERS_SUCCESS,
          FAILURE: AdminActionType.FETCH_ALL_USERS_FAILURE,
        },
        options: {
          headers,
          data: {},
          params: {},
        },
      }),
    )
  }
}

AdminActionCreators.fetchAllNonVerifiedUsers = () => {
  return async (dispatch: AppDispatch) => {
    // set the request headers (override defaultOptions)
    const headers = {}
    // we HAVE TO _return_ a dispatch, else we won't get the
    // returns of onSuccess or onFailure and verify types
    return dispatch(
      apiClient({
        url: `/admin/users-unverified/`,
        method: 'get',
        types: {
          REQUEST: AdminActionType.FETCH_ALL_UNVERIFIED_USERS,
          SUCCESS: AdminActionType.FETCH_ALL_UNVERIFIED_USERS_SUCCESS,
          FAILURE: AdminActionType.FETCH_ALL_UNVERIFIED_USERS_FAILURE,
        },
        options: {
          headers,
          data: {},
          params: {},
        },
      }),
    )
  }
}

AdminActionCreators.verifyUsers = ({ userEmails }) => {
  return async (dispatch: AppDispatch) => {
    const data: paths['/api/admin/users-unverified/']['post']['requestBody']['content']['application/json'] = {
      user_emails: userEmails,
    }

    const headers = {}
    // we HAVE TO _return_ a dispatch, else we won't get the
    // returns of onSuccess or onFailure and verify types
    return dispatch(
      apiClient({
        url: `/admin/users-unverified/`,
        method: 'post',
        types: {
          REQUEST: AdminActionType.VERIFY_USERS,
          SUCCESS: AdminActionType.VERIFY_USERS_SUCCESS,
          FAILURE: AdminActionType.VERIFY_USERS_FAILURE,
        },
        options: {
          headers,
          data,
          params: {},
        },
        onSuccess: (res) => {
          console.log(`res.data`, res.data)
          dispatch({ type: AdminActionType.VERIFY_USERS_SUCCESS, data: res.data })
          dispatch(
            UiActionCreators.addToast({
              id: 'verify-user-toast-success',
              title: `Successfully verified users!`,
              color: 'success',
              iconType: 'checkInCircleFilled',
              toastLifeTimeMs: 5000,
              text: 'All selected users have had their email verified',
            }),
          )

          return {
            type: AdminActionType.VERIFY_USERS_SUCCESS,
            success: true,
            status: res.status,
            data: res.data,
          }
        },
        onFailure: (res) => {
          console.log('onFailure: ', res)
          dispatch(
            UiActionCreators.addToast({
              id: 'verify-user-toast-failure',
              title: 'Failure!',
              color: 'danger',
              iconType: 'crossInACircleFilled',
              toastLifeTimeMs: 15000,
              text: `We couldn't verify the given users.\n ${res.error?.detail}`,
            }),
          )
          return {
            type: AdminActionType.VERIFY_USERS_FAILURE,
            success: false,
            status: res.status,
            data: res.data,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }
}

AdminActionCreators.fetchAllPasswordResetUsers = () => {
  return async (dispatch: AppDispatch) => {
    return dispatch(
      apiClient({
        url: `/admin/reset-user-password/`,
        method: 'get',
        types: {
          REQUEST: AdminActionType.FETCH_ALL_PASSWORD_RESET_REQUESTS,
          SUCCESS: AdminActionType.FETCH_ALL_PASSWORD_RESET_REQUESTS_SUCCESS,
          FAILURE: AdminActionType.FETCH_ALL_PASSWORD_RESET_REQUESTS_FAILURE,
        },
        options: {
          data: {},
          params: {},
        },
      }),
    )
  }
}

AdminActionCreators.resetPasswordForUser = ({ email }) => {
  return (dispatch: AppDispatch) => {
    const data: paths['/api/admin/reset-user-password/']['post']['requestBody']['content']['application/json'] = {
      email,
    }
    const headers = {}
    return dispatch(
      apiClient({
        url: `/admin/reset-user-password/`,
        method: 'post',
        types: {
          REQUEST: AdminActionType.RESET_PASSWORD_FOR_USER,
          SUCCESS: AdminActionType.RESET_PASSWORD_FOR_USER_SUCCESS,
          FAILURE: AdminActionType.RESET_PASSWORD_FOR_USER_FAILURE,
        },
        options: {
          headers,
          // fastapi will only grab 'email' from body
          data,
          params: {},
        },
        onSuccess: (res) => {
          dispatch(AdminActionCreators._removeResetPasswordRequestFromStore({ email }))
          dispatch(
            UiActionCreators.addToast({
              id: 'reset-user-password-success',
              title: `Successfully reset password!`,
              color: 'success',
              iconType: 'checkInCircleFilled',
              toastLifeTimeMs: 5000,
              text: `User with email:'${email}' has had its password reset.`,
            }),
          )
          console.log('onSuccess: ', res)

          return {
            type: AdminActionType.RESET_PASSWORD_FOR_USER_SUCCESS,
            success: true,
            status: res.status,
            data: res.data,
          }
        },
        onFailure: (res) => {
          console.log('onFailure: ', res)
          dispatch(
            UiActionCreators.addToast({
              id: 'reset-user-password-failure',
              title: 'Failure!',
              color: 'danger',
              iconType: 'crossInACircleFilled',
              toastLifeTimeMs: 15000,
              text: `Couldn't reset password for user with email:'${email}'.`,
            }),
          )
          return {
            type: AdminActionType.RESET_PASSWORD_FOR_USER_FAILURE,
            success: false,
            status: res.status,
            data: res.data,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }
}

AdminActionCreators.deletePasswordResetRequest = ({ request }) => {
  return (dispatch: AppDispatch) => {
    // set the request headers (override defaultOptions)
    const headers = {}
    // we HAVE TO _return_ a dispatch, else we won't get the
    // returns of onSuccess or onFailure and verify types
    return dispatch(
      apiClient({
        url: `/admin/delete-password-reset-request/${request.id}/`,
        method: 'delete',
        types: {
          REQUEST: AdminActionType.DELETE_PASSWORD_RESET_REQUEST,
          SUCCESS: AdminActionType.DELETE_PASSWORD_RESET_REQUEST_SUCCESS,
          FAILURE: AdminActionType.DELETE_PASSWORD_RESET_REQUEST_FAILURE,
        },
        options: {
          headers,
          params: {},
        },
        onSuccess: (res) => {
          dispatch(AdminActionCreators._removeResetPasswordRequestFromStore({ email: request.email }))
          return {
            type: AdminActionType.DELETE_PASSWORD_RESET_REQUEST_SUCCESS,
            success: true,
            status: res.status,
            data: res.data,
          }
        },
        onFailure: (res) => {
          console.log('onFailure: ', res)
          return {
            type: AdminActionType.DELETE_PASSWORD_RESET_REQUEST_FAILURE,
            success: false,
            status: res.status,
            data: res.data,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }
}

// we can directly dispatch an action that edits the store
AdminActionCreators._removeResetPasswordRequestFromStore = ({ email }) => {
  return (dispatch: AppDispatch) => {
    return dispatch({ type: AdminActionType.REMOVE_PASSWORD_RESET_REQUEST_FROM_STORE, data: [email] })
  }
}

AdminActionCreators.updateUserRole = ({ role_update }) => {
  return async (dispatch: AppDispatch) => {
    const data: paths['/api/admin/update-user-role/']['put']['requestBody']['content']['application/json'] = {
      role_update,
    }
    const headers = {}
    return dispatch(
      apiClient({
        url: `/admin/update-user-role/`,
        method: 'put',
        types: {
          REQUEST: AdminActionType.UPDATE_USER_ROLE,
          SUCCESS: AdminActionType.UPDATE_USER_ROLE_SUCCESS,
          FAILURE: AdminActionType.UPDATE_USER_ROLE_FAILURE,
        },
        options: {
          headers,
          // fastapi will only grab 'role_update' key from body
          data,
          params: {},
        },
        onSuccess: (res) => {
          dispatch(
            UiActionCreators.addToast({
              id: 'update-user-role-success',
              title: `Successfully updated user role!`,
              color: 'success',
              iconType: 'checkInCircleFilled',
              toastLifeTimeMs: 5000,
              text: `User with email:'${role_update.email}' has had its role updated to '${role_update.role}'.`,
            }),
          )
          return dispatch({
            type: AdminActionType.UPDATE_USER_ROLE_SUCCESS,
            success: true,
            status: res.status,
            data: role_update,
          })
        },
        onFailure: (res) => {
          console.log('onFailure: ', res)
          return {
            type: AdminActionType.UPDATE_USER_ROLE_FAILURE,
            success: false,
            status: res.status,
            data: res.data,
            error: res.error?.data?.detail,
          }
        },
      }),
    )
  }
}
