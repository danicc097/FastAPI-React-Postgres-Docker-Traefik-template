/* eslint-disable @typescript-eslint/ban-ts-comment */
// ignore typescript errors on this file
// @ts-ignore

import { initialStateType as adminState } from 'src/redux/modules/admin/admin'
import { initialStateType as uiState } from 'src/redux/modules/ui/ui'
import { initialStateType as authState } from 'src/redux/modules/auth/auth'
import { initialStateType as globalNotificationsState } from 'src/redux/modules/feed/globalNotifications'
import { initialStateType as userProfileState } from 'src/redux/modules/userProfile/userProfile'

type testState = adminState & uiState & authState & globalNotificationsState & userProfileState

// TODO there must be a better way
export const testInitialState: any = {
  //: testState = {
  auth: {
    isLoading: false,
    isAuthenticated: true,
    error: null,
    pwdResetError: null,
    userLoaded: true,
    user: {
      username: 'admin',
      email: 'admin@myapp.com',
      role: 'admin',
      is_verified: true,
      is_active: true,
      is_superuser: true,
      last_notification_at: '2022-04-30T15:46:42.777999',
      created_at: '2022-04-30T15:31:59.943574',
      updated_at: '2022-04-30T15:46:42.773221',
      full_name: null,
      phone_number: null,
      bio: null,
      image: null,
      user_id: 1,
      salt: '$2b$12$1VMBvTEDdnoxS4dwuAcE3.',
      password: '$2b$12$3rPEdBGwPV6ozLLD7e9fN.9TLEyAw09Nf517rQLgCfaN50pWhSyoe',
      access_token: null,
    },
  },
  ui: {
    toastList: [],
    theme: 'dark',
    styleSheet: '/eui_theme_dark.min.css',
  },
  userProfile: {
    isLoading: false,
    error: null,
    userLoaded: false,
    user: null,
  },
  admin: {
    isLoading: false,
    error: null,
    data: {},
  },
  feed: {
    globalNotifications: {
      data: [],
      unreadData: null,
      canLoadMore: true,
      isLoading: true,
      error: null,
      hasNewGlobalNotifications: false,
    },
  },
}
