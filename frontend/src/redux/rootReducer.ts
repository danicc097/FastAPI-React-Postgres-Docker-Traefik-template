// Redux allows us to package all of our reducers up into a single root reducer
// that assigns each reducer to the slice of state associated with it
import { combineReducers } from 'redux'
import adminReducer from './admin'
import authReducer from './auth'
import uiReducer from './ui'
import userProfileReducer from './userProfile'

// use the complete state to develop. Actual state will be defined in store
// based on user roles, etc.
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  userProfile: userProfileReducer,
  admin: adminReducer,
})
export default rootReducer
