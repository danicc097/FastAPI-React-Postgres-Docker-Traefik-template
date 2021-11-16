/* eslint-disable react/prop-types */
import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { Provider } from 'react-redux'

import configureReduxStore from '../redux/store' // overridden
import { applyMiddleware, compose, createStore } from 'redux'
import rootReducer from 'src/redux/rootReducer'
import thunkMiddleware from 'redux-thunk'

const middlewareEnhancer = applyMiddleware(thunkMiddleware)
const composedEnhancers = compose(middlewareEnhancer)

function render(
  ui,
  { initialState = {}, store = createStore(rootReducer, initialState, composedEnhancers), ...renderOptions } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { render }
