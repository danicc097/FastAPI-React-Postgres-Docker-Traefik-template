import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { combineReducers } from 'redux'
import App from 'src/App'
import { useAuthenticatedUser } from './hooks/auth/useAuthenticatedUser'
import authReducer from './redux/modules/auth/auth'
// import '@fortawesome/fontawesome-free/js/all.js'; // terrible

import configureReduxStore from './redux/store'
import uiReducer from './redux/modules/ui/ui'
import userProfileReducer from './redux/modules/userProfile/userProfile'

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  // TODO disable console eventually
  // console.log = () => {};
}

export const store = configureReduxStore()

ReactDOM.render(
  <React.StrictMode>
    {/* The Provider acts similarly to React's Context.Provider,
    but instead of a value prop, it accepts a store prop. */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
