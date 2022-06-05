import registrationPo from '../pages/registration.po'
import puppeteer from 'puppeteer'
import { Users } from '../initialData/users'

jest.retryTimes(3)

beforeEach(async () => {
  // await registrationPo.setupPuppeteerLogging()
  await registrationPo.go()
  await registrationPo.autoLogout()
})

// afterAll(async () => {
//   browser.close()
// })

afterEach(async () => {
  await registrationPo.waitUntilHTMLRendered(page, 25)
})

describe('Test registration', () => {
  it.each`
    user            | error
    ${'admin'}      | ${'already exists'}
    ${'unverified'} | ${'already exists'}
    ${'newUser'}    | ${''}
  `(
    'should display an appropiate error in a callout error box',
    async ({ user, error }: { user: keyof Users; error: string }) => {
      await registrationPo.register(user)
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
