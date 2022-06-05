import { combineReducers } from 'redux'
import adminReducer from './modules/admin/admin'
import authReducer from './modules/auth/auth'
import uiReducer from './modules/ui/ui'
import userProfileReducer from './modules/userProfile/userProfile'
import globalNotificationsReducer from './modules/feed/globalNotifications'
import personalNotificationsReducer from './modules/feed/personalNotifications'

const feedReducer = combineReducers({
  globalNotifications: globalNotificationsReducer,
  personalNotifications: personalNotificationsReducer,
})

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  userProfile: userProfileReducer,
  admin: adminReducer,
  feed: feedReducer,
})
export default rootReducer
