import loginPo from '../pages/login.po'

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
    userTitle             | error                                | expectResponse
    ${'unregisteredUser'} | ${'Authentication was unsuccessful'} | ${false}
    ${'admin'}            | ${''}                                | ${true}
    ${'verified'}         | ${''}                                | ${true}
    ${'unverified'}       | ${'Current user is not verified'}    | ${false}
  `(
    'should display an appropiate error in a callout message box',
    async ({ userTitle, error, expectResponse }: { userTitle: userType; error: string; expectResponse: boolean }) => {
      await loginPo.login(userTitle, expectResponse)
      const calloutErrors = (await loginPo.getFormCalloutErrors()).toString()
      expect(calloutErrors).toEqual(expect.stringMatching(error))
    },
  )

  it('should display 2 form errors given invalid email and password', async () => {
    await loginPo.login('badUser')
    const formErrors = await loginPo.getFormRowErrors()
    expect(formErrors).toHaveLength(2)
  })
})
