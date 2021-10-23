/**
The general pattern to follow whenever we want to create a new slice
of state (auth, cleanings, offers...) in redux is as follows:

1. Add the default state for our new slice in initialState.js.
2. Define and export any constants that are needed in action-types.
3. Create a new file in the redux directory for that slice.
4. Configure a new reducer and make it the default export for that file.
5. Export action creators that will be used to modify the state slice.
6. Import the reducer into the root reducer file and add it in the combineReducers call.
* */

import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import { schema } from 'src/types/schema_override'

export type AdminDataType = {
  unverifiedUsers?: Array<schema['UserPublic']>
  passwordResetRequests?: Array<schema['PasswordResetRequest']>
  allUsers?: Array<schema['UserPublic']>
  //   [key: number]: Array<schema['OfferPublic']>
}

export type initialStateType = {
  auth: {
    isLoading: boolean
    isUpdating: boolean
    isAuthenticated: boolean
    error?: schema['HTTPValidationError']
    pwdResetError?: schema['HTTPValidationError']
    userLoaded: boolean
    user: schema['UserPublic']
  }
  ui: {
    toastList: Toast[]
  }
  userProfile: {
    isLoading: boolean
    isUpdating: boolean
    isUpdated: boolean
    error?: schema['HTTPValidationError']
    userLoaded: boolean
    user: schema['UserPublic']
  }
  admin: {
    isLoading: boolean
    isUpdating: boolean
    error?: schema['HTTPValidationError'] | GenObjType<string>
    data?: AdminDataType | GenObjType<null>
  }
}

const initialState: initialStateType = {
  auth: {
    isLoading: false,
    isUpdating: false,
    isAuthenticated: false,
    error: null,
    pwdResetError: null,
    userLoaded: false,
    user: { id: null },
  },
  ui: {
    toastList: [],
  },
  userProfile: {
    isLoading: false,
    isUpdating: false,
    isUpdated: false,
    error: null,
    userLoaded: false,
    user: { id: null },
  },
  admin: {
    isLoading: false,
    isUpdating: false,
    error: null,
    data: {},
  },
}

export default initialState
