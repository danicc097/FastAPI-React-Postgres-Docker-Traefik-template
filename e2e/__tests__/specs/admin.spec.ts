import { users } from '../data/users'
import adminPo from '../pages/admin.po'
import profilePo from '../pages/profile.po'

// afterAll(async () => {
//   page.close()
// })

afterEach(async () => {
  // Make sure we don't kill any requests when a test completes before all reponses are returned.
  await page.waitForNetworkIdle()
})

describe('Test admin panel', () => {
  beforeEach(async () => {
    await profilePo.login('admin')
    await adminPo.go()
  })

  test('verifying a user', async () => {
    // await page.click("[data-test-subj='user-update-form']")
    await adminPo.openUnverifiedUsersAccordion()
    await adminPo.selectFromUnverifiedUsersTable(users['toBeVerified'].email)
    await adminPo.waitUntilHTMLRendered(page, 100) // button will be rendered
    await adminPo.clickVerifyUsersButton()
  })

  test('resetting a user`s password manually', async () => {
    // await page.click("[data-test-subj='user-update-form']")
    await adminPo.openPasswordResetAccordion()
    await adminPo.selectFromPasswordResetTable(users['verified'].email)
    // button will be enabled
    await adminPo.waitUntilHTMLRendered(page, 100)
    await adminPo.clickPasswordResetButton()

    const trigger = async () => await adminPo.confirmModal()

    let newPassword
    while (!newPassword) {
      try {
        newPassword = await adminPo.interceptPasswordReset(trigger, 'verified')
      } catch (e) {}
    }

    await page.waitForNetworkIdle()
    expect(newPassword).not.toBe(undefined)
    expect(users['verified'].password).toBe(newPassword)
  })

  test('accepting and declining a user password reset request', async () => {
    await adminPo.openPasswordResetRequestsAccordion()

    // only passwordResetTestUser[*] are in the table
    const trigger = async () =>
      await adminPo.clickResetRequestsTableAction(users['passwordResetTestUser2'].email, 'reset')

    let newPassword
    while (!newPassword) {
      try {
        newPassword = await adminPo.interceptPasswordReset(trigger, 'passwordResetTestUser2')
      } catch (e) {}
    }
    await page.waitForNetworkIdle()
    expect(newPassword).not.toBe('')
    expect(users['passwordResetTestUser2'].password).toBe(newPassword)

    await adminPo.clickResetRequestsTableAction(users['passwordResetTestUser'].email, 'delete')
  })
})

describe('Test verification and access to admin panel', () => {
  test('accessing our profile now that we are verified', async () => {
    await page.waitForNetworkIdle()
    await profilePo.login('toBeVerified')
    const calloutErrors = (await profilePo.getFormCalloutErrors()).toString()
    expect(calloutErrors).not.toEqual(expect.stringMatching(/Current user is not verified/i))
  })

  it('should not let us see admin panel if we are not a superuser', async () => {
    await adminPo.go()
    await adminPo.getElementTextBySelector('body').then((text) => {
      expect(text).toEqual(expect.stringMatching(/You are not authorized/i))
    })
  })
})
