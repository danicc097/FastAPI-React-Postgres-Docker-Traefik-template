import registrationPo from '../pages/registration.po'
import puppeteer from 'puppeteer'

beforeEach(async () => {
  // await registrationPo.setupPuppeteerLogging()
  await registrationPo.go()
  await registrationPo.autoLogout()
})

// afterAll(async () => {
//   browser.close()
// })

describe('Test registration', () => {
  it.each`
    userTitle       | error
    ${'admin'}      | ${'already exists'}
    ${'unverified'} | ${'already exists'}
    ${'newUser'}    | ${''}
  `(
    'should display an appropiate error in a callout error box',
    async ({ userTitle, error }: { userTitle: userType; error: string }) => {
      await registrationPo.register(userTitle)
      if (!!error) {
        const calloutErrors = (await registrationPo.getFormCalloutErrors()).toString()
        expect(calloutErrors).toEqual(expect.stringMatching(error))
      }
    },
  )

  it('should display 3 form errors given invalid email, username and password', async () => {
    await registrationPo.register('badUser')
    const formErrors = await registrationPo.getFormRowErrors()
    expect(formErrors).toHaveLength(3)
  })
})
