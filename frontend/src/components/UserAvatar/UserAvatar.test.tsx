import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserAvatar, { UserAvatarPropTypes } from './UserAvatar'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
// this is an overridden render from @testing-library/react
import { render as renderWithStore } from 'src/test/test-utils'
import { testInitialState } from 'src/test/test-state'

test('Renders content', async () => {
  const props: UserAvatarPropTypes = {
    user: testInitialState['auth']['user'],
    size: 'l',
    initialsLength: 2,
    type: 'user',
    color: '#eee',
  }
  renderWithStore(<UserAvatar {...props} />)
})
