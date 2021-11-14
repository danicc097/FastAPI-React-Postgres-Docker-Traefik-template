// Redux allows us to package all of our reducers up into a single root reducer
// that assigns each reducer to the slice of state associated with it
import { combineReducers } from 'redux'
import adminReducer from './modules/admin/admin'
import authReducer from './modules/auth/auth'
import uiReducer from './modules/ui/ui'
import userProfileReducer from './modules/userProfile/userProfile'
import globalNotificationsReducer from './modules/feed/globalNotifications'

const feedReducer = combineReducers({
  globalNotifications: globalNotificationsReducer,
})

// don't mind `admin` slice included, since it's empty in its initial state
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  userProfile: userProfileReducer,
  admin: adminReducer,
  feed: feedReducer,
})
export default rootReducer
