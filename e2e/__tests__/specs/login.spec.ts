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
    userTitle             | message
    ${'unregisteredUser'} | ${'Authentication was unsuccessful'}
    ${'admin'}            | ${''}
    ${'verified'}         | ${''}
    ${'unverified'}       | ${'Current user is not verified'}
  `(
    'should display an appropiate error in a callout message box',
    async ({ userTitle, message }: { userTitle: userType; message: string }) => {
      await loginPo.login(userTitle)
      const calloutErrors = (await loginPo.getFormCalloutErrors()).toString()
      expect(calloutErrors).toEqual(expect.stringMatching(message))
    },
  )

  it('should display 2 form errors given invalid email and password', async () => {
    await loginPo.login('badUser')
    const formErrors = await loginPo.getFormRowErrors()
    expect(formErrors).toHaveLength(2)
  })
})
