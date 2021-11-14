import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { AuthActionCreators } from './modules/auth/auth'
import rootReducer from './rootReducer'

// no need to delete reducers from store based on access level.
// end user could at most see the initial state, which will
// have nothing compromising, just empty objects.
// admin: {
//     (...)
//     data: {}
//   }
// (in any case, the backend will ultimately reject based on role.)

const store = configureStore({
  // these are our combined reducers into rootReducer
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // .concat(thunkMiddleware)
  ...(process.env.NODE_ENV === 'production' && { devTools: false }),
})

export default function configureReduxStore() {
  // If a token exists in local storage, our action creator will
  // find it and attempt to fetch the logged in user right away
  store.dispatch(AuthActionCreators.fetchUserFromToken())

  // enable hot reloading in development
  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./rootReducer', () => store.replaceReducer(rootReducer))
  }

  return store
}

// as per docs. These AppDispatch and RootState will be pretyped inside hooks.ts to be used everywhere
// Use AppDispatch as type for dispatch from now on
export type AppDispatch = typeof store.dispatch
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// no idea what this is for.
// A thunk is a function that wraps an expression to delay its evaluation
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
