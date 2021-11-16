import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
// this is an overridden render from @testing-library/react
import { render as renderWithStore } from 'src/test/test-utils'

test('Renders content', async () => {
  renderWithStore(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  )
})
