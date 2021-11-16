import { users } from '../data/users'
import { PasswordResetPO, PasswordResetRequestsPO, UnverifiedUsersPO } from '../pages/admin.po'
import profilePo from '../pages/profile.po'

const passwordResetPo = new PasswordResetPO()
const passwordResetRequestsPo = new PasswordResetRequestsPO()
const unverifiedUsersPo = new UnverifiedUsersPO()

// afterEach(async () => {
//   await profilePo.waitUntilHTMLRendered(page, 25)
// })

describe('Test admin functionality', () => {
  beforeEach(async () => {
    await profilePo.login('admin', true)
  })

  test('verifying a user', async () => {
    // await page.click("[data-test-subj='user-update-form']")
    await unverifiedUsersPo.go()
    await unverifiedUsersPo.selectFromUnverifiedUsersTable(users['toBeVerified'].email)
    await unverifiedUsersPo.waitUntilHTMLRendered(page, 100) // button will be rendered
    await await unverifiedUsersPo.clickVerifyUsersButton()
  })

  test('resetting a user`s password manually', async () => {
    // await page.click("[data-test-subj='user-update-form']")
    await passwordResetPo.go()
    await passwordResetPo.selectFromPasswordResetTable(users['verified'].email)
    // button will be enabled
    await passwordResetPo.waitUntilHTMLRendered(page, 100)
    await passwordResetPo.clickPasswordResetButton()

    const trigger = async () => await passwordResetPo.confirmModal()

    let newPassword
    while (!newPassword) {
      newPassword = await passwordResetPo.retry(
        page,
        async () => {
          return await passwordResetPo.interceptPasswordReset(trigger, 'verified')
        },
        50,
      )
    }

    expect(newPassword).not.toBe(undefined)
    expect(users['verified'].password).toBe(newPassword)
  })

  test('accepting and declining a user password reset request', async () => {
    await passwordResetRequestsPo.go()

    // only passwordResetTestUser[*] are in the table
    const trigger = async () =>
      await passwordResetRequestsPo.clickResetRequestsTableAction(users['passwordResetTestUser2'].email, 'reset')

    let newPassword
    while (!newPassword) {
      try {
        newPassword = await passwordResetRequestsPo.interceptPasswordReset(trigger, 'passwordResetTestUser2')
      } catch (e) {}
    }
    // await page.waitForNetworkIdle()
    expect(newPassword).not.toBe('')
    expect(users['passwordResetTestUser2'].password).toBe(newPassword)

    await passwordResetRequestsPo.clickResetRequestsTableAction(users['passwordResetTestUser'].email, 'delete')
  })
})

describe('Test verification and access to admin panel for user', () => {
  test('accessing our profile now that we are verified', async () => {
    // await page.waitForNetworkIdle()
    await profilePo.login('toBeVerified')
    const calloutErrors = (await profilePo.getFormCalloutErrors()).toString()
    expect(calloutErrors).not.toEqual(expect.stringMatching(/Current user is not verified/i))
  })

  it('should not let us see admin functionality if we are not a superuser', async () => {
    const pages = [passwordResetPo, passwordResetRequestsPo, unverifiedUsersPo]
    for (const page of pages) {
      await page.go()
      await page.getElementTextBySelector('body').then((text) => {
        expect(text).toEqual(expect.stringMatching(/You are not authorized/i))
      })
    }
  })
})
