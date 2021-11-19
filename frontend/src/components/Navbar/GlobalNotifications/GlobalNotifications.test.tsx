import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
// this is an overridden render from @testing-library/react
import { render as renderWithStore } from 'src/test/test-utils'
import { testInitialState } from 'src/test/test-state'
import GlobalNotifications from './GlobalNotifications'

test('Renders content', async () => {
  renderWithStore(
    <BrowserRouter>
      <GlobalNotifications user={testInitialState.user} />
    </BrowserRouter>,
    { initialState: testInitialState },
  )
})
