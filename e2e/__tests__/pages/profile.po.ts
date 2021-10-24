import BasePO from './base.po'

class ProfilePO extends BasePO {
  private readonly $UserUpdateAccordion = '.euiAccordion__button'
  private readonly $UserUpdateSuccessToast = '#user-update-toast-success'
  private readonly $UserUpdateFailureToast = '#user-update-toast-failure'

  async go() {
    await this.navigate('/profile')
  }

  async waitForUserUpdateSuccessToast() {
    await page.waitForSelector(this.$UserUpdateSuccessToast, { visible: true, timeout: 20000 })
  }

  async waitForUserUpdateFailureToast() {
    await page.waitForSelector(this.$UserUpdateFailureToast, { visible: true, timeout: 20000 })
  }

  async fillUserUpdateForm({
    newUsername,
    newEmail,
    newPassword,
    oldPassword,
  }: {
    newUsername?: string
    newEmail?: string
    newPassword?: string
    oldPassword?: string
  }) {
    !!newUsername && (await this.waitForSelectorAndType("[data-test-subj='new-username']", newUsername))
    !!newEmail && (await this.waitForSelectorAndType("[data-test-subj='new-email']", newEmail))
    !!oldPassword && (await this.waitForSelectorAndType("[data-test-subj='old-password']", oldPassword))
    !!newPassword && (await this.waitForSelectorAndType("[data-test-subj='new-password']", newPassword))
    !!newPassword && (await this.waitForSelectorAndType("[data-test-subj='new-password-confirm']", newPassword))
  }

  async submitUserUpdateForm() {
    // await this.waitUntilHTMLRendered(50)
    await this.waitForVisibleSelectorAndClick("[data-test-subj='user-update-submit']")
    await page.waitForNetworkIdle()
  }

  async openUserUpdateAccordion() {
    await this.waitForVisibleSelectorAndClick(this.$UserUpdateAccordion)
  }
}

export default new ProfilePO()
