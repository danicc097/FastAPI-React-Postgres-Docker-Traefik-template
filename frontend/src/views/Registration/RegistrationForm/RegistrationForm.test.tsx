import * as React from 'react'
import { screen, within, waitFor, fireEvent, getByTestId, getByRole, cleanup } from '@testing-library/react'
import RegistrationForm from './RegistrationForm'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
// this is an overridden render from @testing-library/react
import { render as renderWithStore } from 'src/test/test-utils'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { testInitialState } from 'src/test/test-state'

afterEach(cleanup)

test('Registration form gives proper errors', async () => {
  const { container } = renderWithStore(
    <BrowserRouter>
      <RegistrationForm />
    </BrowserRouter>,
    { initialState: testInitialState },
  )

  const badEmail = 'badEmail'
  const shortUsername = 'a'
  const password = 'randomPassword'
  const badConfirmPassword = 'wrong'
  userEvent.type(screen.getByTestId('email-input'), badEmail)
  userEvent.type(screen.getByTestId('username-input'), shortUsername)
  userEvent.type(screen.getByTestId('password-input'), password)
  userEvent.type(screen.getByTestId('password-confirm-input'), badConfirmPassword)
  const registrationForm = screen.getByTestId('registration-form')
  expect(registrationForm).toHaveTextContent(/please enter a valid email/i)
  expect(registrationForm).toHaveTextContent(/please enter a valid username/i)
  expect(registrationForm).toHaveTextContent(/passwords must match/i)

  // const signupButton = screen.getByRole('button', { name: /sign up/i })
  // userEvent.click(within(signupButton).getByText(/sign up/i))
  // screen.debug()
})

test('Registration form shows no error with correct input', async () => {
  const { container } = renderWithStore(
    <BrowserRouter>
      <RegistrationForm />
    </BrowserRouter>,
    { initialState: testInitialState },
  )

  const email = 'email@somewhere.com'
  const username = 'username'
  const password = 'randomPassword'
  const confirmPassword = 'randomPassword'
  userEvent.type(screen.getByTestId('email-input'), email)
  userEvent.type(screen.getByTestId('username-input'), username)
  userEvent.type(screen.getByTestId('password-input'), password)
  userEvent.type(screen.getByTestId('password-confirm-input'), confirmPassword)
  const registrationForm = screen.getByTestId('registration-form')
  expect(registrationForm).not.toHaveTextContent(/please enter a valid email/i)
  expect(registrationForm).not.toHaveTextContent(/please enter a valid username/i)
  expect(registrationForm).not.toHaveTextContent(/passwords must match/i)

  // const signupButton = screen.getByRole('button', { name: /sign up/i })
  // userEvent.click(within(signupButton).getByText(/sign up/i))
  // screen.debug()
})
