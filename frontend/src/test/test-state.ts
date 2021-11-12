import { initialStateType } from 'src/redux/initialState'

export const testInitialState: initialStateType = {
  auth: {
    isLoading: false,
    isUpdating: false,
    isAuthenticated: true,
    error: null,
    userLoaded: true,
    user: {
      email: 'admin@myapp.com',
      username: 'admin',
      is_verified: true,
      is_active: true,
      is_superuser: true,
      created_at: '2021-09-30T16:38:33.860453+00:00',
      updated_at: '2021-09-30T16:39:29.965159+00:00',
      id: 1,
      access_token: null,
      profile: {
        full_name: null,
        phone_number: null,
        bio: null,
        image: null,
        created_at: '2021-09-30T16:38:33.864848+00:00',
        updated_at: '2021-09-30T16:38:33.864848+00:00',
        id: 1,
        user_id: 1,
        username: null,
        email: null,
      },
    },
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
    user: {
      id: null,
    },
  },
  admin: {
    isLoading: false,
    isUpdating: false,
    error: {
      detail: 'No unverified users found',
    },
    data: {},
  },
}
