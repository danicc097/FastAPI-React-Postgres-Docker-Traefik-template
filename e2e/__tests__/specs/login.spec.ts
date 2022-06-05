import { Users } from '../initialData/users'
import loginPo from '../pages/login.po'

jest.retryTimes(3)

beforeEach(async () => {
  await loginPo.go()
  await loginPo.autoLogout()
})

// afterAll(async () => {
//   page.close()
// })

afterEach(async () => {
  await loginPo.waitUntilHTMLRendered(page, 25)
})

describe('Test logins', () => {
  it.each`
    user                  | error                             | expectResponse
    ${'unregisteredUser'} | ${'could not be authenticated'}   | ${false}
    ${'admin'}            | ${''}                             | ${false}
    ${'verified'}         | ${''}                             | ${false}
    ${'unverified'}       | ${'Current user is not verified'} | ${false}
  `(
    'should display an appropiate error in a callout message box',
    async ({ user, error, expectResponse }: { user: keyof Users; error: string; expectResponse: boolean }) => {
      await loginPo.login(user, expectResponse)
      const calloutErrors = (await loginPo.getFormCalloutErrors()).toString()
      expect(calloutErrors).toEqual(expect.stringMatching(error))
    },
  )

  it('should display 2 form errors given invalid email and password', async () => {
    await loginPo.login('badUser', false)
    const formErrors = await loginPo.getFormRowErrors()
    expect(formErrors).toHaveLength(2)
  })
})
