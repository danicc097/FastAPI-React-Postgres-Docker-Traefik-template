import * as React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Carousel from './Carousel'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'

import { render as renderWithStore } from 'src/test/test-utils'

test('Renders content', async () => {
  renderWithStore(<Carousel items={[]} current={null} />)
})
