import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPage from './AdminPage'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
// this is an overridden render from @testing-library/react
import { render as renderWithStore } from 'src/test/test-utils'
import configureReduxStore from 'src/redux/store'
import { testInitialState } from 'src/test/test-state'

test('Renders content', async () => {
  renderWithStore(
    <BrowserRouter>
      <AdminPage />
    </BrowserRouter>,
    { initialState: testInitialState },
  )
})
