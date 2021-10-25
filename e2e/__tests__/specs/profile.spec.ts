import { users } from '../data/users'
import profilePo from '../pages/profile.po'

const newUsername = 'newUsername'
const newPassword = 'newPassword'

beforeEach(async () => {
  // await profilePo.setupPuppeteerLogging()
  await profilePo.go()
  await profilePo.autoLogout()
  await profilePo.login('profileTestUser', true)
})

// afterAll(async () => {
//   page.close()
// })

// afterEach(async () => {
//   await profilePo.waitUntilHTMLRendered(page, 25)
// })

describe('Test profile', () => {
  it('should not let us update with a taken username', async () => {
    await profilePo.openUserUpdateAccordion()
    await profilePo.fillUserUpdateForm({ newUsername: users['admin'].username })
    await profilePo.submitUserUpdateForm()
    await profilePo.retry(
      page,
      async () => {
        await profilePo.confirmModal()
      },
      10,
    )
    await profilePo.waitForUserUpdateFailureToast()

    const calloutErrors = (await profilePo.getFormCalloutErrors()).toString()
    expect(calloutErrors).toEqual(expect.stringMatching('already exists'))
  })

  // this is a unit test...
  it('should not let us update with a bad username', async () => {
    await profilePo.openUserUpdateAccordion()
    await profilePo.fillUserUpdateForm({ newUsername: 'a' })

    const formErrors = await profilePo.getFormRowErrors()
    expect(formErrors).toHaveLength(1)
  })

  it('should update our username', async () => {
    await profilePo.openUserUpdateAccordion()
    await profilePo.fillUserUpdateForm({ newUsername })
    await profilePo.submitUserUpdateForm()
    await profilePo.retry(
      page,
      async () => {
        await profilePo.confirmModal()
      },
      10,
    )
    await profilePo.waitForUserUpdateSuccessToast()

    users['profileTestUser'].username = newUsername
  })

  it('should update our password', async () => {
    await profilePo.openUserUpdateAccordion()
    await profilePo.fillUserUpdateForm({ newPassword, oldPassword: users['profileTestUser'].password })
    await profilePo.submitUserUpdateForm()
    await profilePo.retry(
      page,
      async () => {
        await profilePo.confirmModal()
      },
      10,
    )
    await profilePo.waitForUserUpdateSuccessToast()

    users['profileTestUser'].password = newPassword
  })

  it('should let us login with new credentials', async () => {
    // auto logged in at this point
    expect(users['profileTestUser'].username).toBe(newUsername)
    expect(users['profileTestUser'].password).toBe(newPassword)
  })
})
