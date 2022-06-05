import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from 'src/App'
import configureReduxStore from './redux/store'
// import * as serviceWorkerRegistration from './serviceWorkerRegistration'
// FIXME use patch-package instead
// import './icons'
if (import.meta.env.NODE_ENV === 'production') {
}

export const store = configureReduxStore()

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// register or unregister
// serviceWorkerRegistration.register()
