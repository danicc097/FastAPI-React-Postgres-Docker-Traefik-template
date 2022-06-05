import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPage from './AdminPageBase'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'

import { render as renderWithStore } from 'src/test/test-utils'
import configureReduxStore from 'src/redux/store'
import { testInitialState } from 'src/test/test-state'

test('Renders content', async () => {
  renderWithStore(
    <BrowserRouter>
      <AdminPage title={null} element={null} />
    </BrowserRouter>,
    { initialState: testInitialState },
  )
})
