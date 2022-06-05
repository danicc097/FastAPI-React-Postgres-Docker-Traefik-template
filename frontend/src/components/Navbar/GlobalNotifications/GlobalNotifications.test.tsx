import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { render as renderWithStore } from 'src/test/test-utils'
import { testInitialState } from 'src/test/test-state'
import GlobalNotifications from './GlobalNotifications'

const mEventSourceInstance = {
  addEventListener: vi.fn(),
}
const mEventSource: any = jest.fn(() => mEventSourceInstance)

global.EventSource = mEventSource

test('Renders content', async () => {
  renderWithStore(
    <BrowserRouter>
      <GlobalNotifications user={testInitialState.auth.user} />
    </BrowserRouter>,
    { initialState: testInitialState },
  )
})
