import { Users, users } from '../initialData/users'
import forgotPasswordPo from '../pages/forgotPassword.po'

jest.retryTimes(3)

beforeEach(async () => {
  // submit button will be disabled once sent, reload first
  await forgotPasswordPo.go()

  // await page.waitForNetworkIdle()
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
    ${users['verified'].email}         | ${'please help'} | ${null}
    ${users['verified'].email}         | ${'please help'} | ${'already exists'}
    ${users['unregisteredUser'].email} | ${'please help'} | ${'not found'}
  `(
    'should display an appropiate error in a callout message box',
    async ({ email, message, error }: { email: string; message: string; error: string }) => {
      await forgotPasswordPo.fillPasswordResetRequestForm(email, message)
      await forgotPasswordPo.submitPasswordResetRequestForm()

      if (!!error) {
        const calloutErrors = (await forgotPasswordPo.getFormCalloutErrors()).toString()
        expect(calloutErrors).toEqual(expect.stringMatching(error))
      } else {
        try {
          await forgotPasswordPo.waitForPasswordResetRequestSuccessToast()
        } catch (error) {
          // if retrying failed test, might be we missed the toast
          // TODO this shouldnt be happening in the first place
          const calloutErrors = (await forgotPasswordPo.getFormCalloutErrors()).toString()
          expect(calloutErrors).toEqual(expect.stringMatching('already exists'))
        }
      }
    },
  )

  it('should display 1 form error given invalid email', async () => {
    await forgotPasswordPo.fillPasswordResetRequestForm('a', 'some message')
    const formErrors = await forgotPasswordPo.getFormRowErrors()
    expect(formErrors).toHaveLength(1)
  })
})
