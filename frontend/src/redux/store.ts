import { configureStore, ThunkAction, Action, Store } from '@reduxjs/toolkit'
import moment from 'moment'
import { AuthActionCreators } from './modules/auth/auth'
import rootReducer from './rootReducer'
import thunkMiddleware from 'redux-thunk'

const loggerMiddleware = (storeAPI) => (next) => (action) => {
  console.log(`%c${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`, 'color: #0099ff; font-weight: bold;', action)
  const result = next(action)
  return result
}

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunkMiddleware),
  ...(import.meta.env.NODE_ENV === 'production' && { devTools: false }),
})

export default function configureReduxStore() {
  store.dispatch(AuthActionCreators.fetchUserFromToken())

  if (import.meta.env.NODE_ENV !== 'production' && import.meta.hot) {
    import.meta.hot.accept('./rootReducer', () => store.replaceReducer(rootReducer))
  }

  return store
}

export type AppDispatch = typeof store.dispatch

export type RootState = ReturnType<typeof store.getState>

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
