import { users } from '../data/users'
import forgotPasswordPo from '../pages/forgotPassword.po'

beforeEach(async () => {
  // submit button will be disabled once sent, reload first
  await forgotPasswordPo.go()

  await page.waitForNetworkIdle()
})

// afterAll(async () => {
//   page.close()
// })

afterEach(async () => {
  await forgotPasswordPo.waitUntilHTMLRendered(page, 25)
})

describe('Test forgot password form', () => {
  it.each`
    email                              | message          | error
    ${users['verified'].email}         | ${'please help'} | ${''}
    ${users['verified'].email}         | ${'please help'} | ${'already requested'}
    ${users['unregisteredUser'].email} | ${'please help'} | ${'not found'}
  `(
    'should display an appropiate error in a callout message box',
    async ({ email, message, error }: { email: userType; message: string; error: string }) => {
      await forgotPasswordPo.fillPasswordResetRequestForm(email, message)
      await forgotPasswordPo.submitPasswordResetRequestForm()

      if (!!error) {
        const calloutErrors = (await forgotPasswordPo.getFormCalloutErrors()).toString()
        expect(calloutErrors).toEqual(expect.stringMatching(error))
      } else {
        await forgotPasswordPo.waitForPasswordResetRequestSuccessToast()
      }
    },
  )

  it('should display 2 form errors given invalid email and message', async () => {
    await forgotPasswordPo.fillPasswordResetRequestForm('a', 'b')
    const formErrors = await forgotPasswordPo.getFormRowErrors()
    expect(formErrors).toHaveLength(2)
  })
})
