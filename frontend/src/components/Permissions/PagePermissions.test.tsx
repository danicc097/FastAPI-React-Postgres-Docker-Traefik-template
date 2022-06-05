import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PagePermissions from './PagePermissions'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'

import { render as renderWithStore } from 'src/test/test-utils'
import { testInitialState } from 'src/test/test-state'

test('Renders content', async () => {
  renderWithStore(
    <BrowserRouter>
      <PagePermissions element={<div></div>} isAllowed />
    </BrowserRouter>,
    { initialState: testInitialState },
  )
})
