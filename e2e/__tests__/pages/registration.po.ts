import { users } from '../data/users'
import BasePO from './base.po'

class RegistrationPO extends BasePO {
  async go() {
    await this.navigate('/registration')
  }

  async register(user: keyof usersType): Promise<void> {
    // avatar leads to login page if unauthenticated
    await this.waitForVisibleSelectorAndClick("[data-test-subj='avatar']")
    // a link to the registration form in login page should appear
    const registrationLink = await page.$("a[href='/registration']")
    if (registrationLink) {
      await registrationLink.click()
      await this.waitForSelectorAndType("[data-test-subj='email-input']", users[user].email)
      await this.waitForSelectorAndType("[data-test-subj='username-input']", users[user].username)
      await this.waitForSelectorAndType("[data-test-subj='password-input']", users[user].password)
      await this.waitForSelectorAndType("[data-test-subj='password-confirm-input']", users[user].password)
      await this.waitForVisibleSelectorAndClick("[data-test-subj='registration-submit']")
    } else {
      // close the dropdown we just opened to not interfere with autoLogout
      await this.waitForVisibleSelectorAndClick("[data-test-subj='avatar']")
      // logout the current user
      await this.autoLogout()
      // retry registration
      await this.register(user)
    }
  }
}

export default new RegistrationPO()
