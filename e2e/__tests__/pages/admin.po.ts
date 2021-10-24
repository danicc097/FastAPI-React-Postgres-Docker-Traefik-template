import { ElementHandle } from 'puppeteer'
import BasePO from './base.po'

class AdminPO extends BasePO {
  private readonly $PasswordResetRequestsAccordion = '.PasswordResetRequestsAccordion__button'
  private readonly $UnverifiedUsersAccordion = '.UnverifiedUsersAccordion__button'
  private readonly $PasswordResetAccordion = '.PasswordResetAccordion__button'

  private readonly $VerifyUserButton = "[data-test-subj='verify-users-submit']"
  private readonly $EnabledPasswordResetFormButton = "[data-test-subj='passwordResetForm__submit']:not([disabled])"

  private readonly $xPasswordResetRequestsRow = '//*[@data-test-subj="passwordResetTable__row"]'

  async go() {
    await this.navigate('/admin')
  }

  //////////////////////////////////////////////////////////////////////////////

  async openUnverifiedUsersAccordion() {
    await this.waitForSelectorAndClick(this.$UnverifiedUsersAccordion)
  }

  async selectFromUnverifiedUsersTable(email: string) {
    await this.waitForSelectorAndClick(`[data-test-subj="checkboxSelectRow-${email}"]`)
  }

  async clickVerifyUsersButton() {
    // button is hidden by default and shown on row selection
    await this.waitForVisibleSelectorAndClick(this.$VerifyUserButton)
  }
  //////////////////////////////////////////////////////////////////////////////

  async openPasswordResetAccordion() {
    await this.waitForSelectorAndClick(this.$PasswordResetAccordion)
  }

  async selectFromPasswordResetTable(email: string) {
    await this.waitForSelectorAndClick(`.euiSelectableListItem[title="${email}"]`)
  }

  async clickPasswordResetButton() {
    await this.waitForSelectorAndClick(this.$EnabledPasswordResetFormButton)
  }

  //////////////////////////////////////////////////////////////////////////////

  async openPasswordResetRequestsAccordion() {
    await this.waitForSelectorAndClick(this.$PasswordResetRequestsAccordion)
  }

  // We must rely on XPaths to get text content
  async clickResetRequestsTableAction(email: string, action: 'reset' | 'delete') {
    await page.waitForXPath(this.$xPasswordResetRequestsRow, { timeout: 20000 })
    const $xEmailCell = `${this.$xPasswordResetRequestsRow}//*[contains(text(), "${email}")]`
    const $xActionRow = `${$xEmailCell}/ancestor::*[@data-test-subj="passwordResetTable__row"]`
    await page.waitForXPath($xActionRow, { timeout: 20000 })
    // const row = await page.$x($xActionRow) // email is unique
    const $xResetAction = $xActionRow + '//*[@data-test-subj="passwordResetTable__resetAction"]'
    const $xDeleteAction = $xActionRow + '//*[@data-test-subj="passwordResetTable__deleteAction"]'
    switch (action) {
      case 'reset':
        await this.waitForXPathAndClick($xResetAction)
        break
      case 'delete':
        await this.waitForXPathAndClick($xDeleteAction)
        break
      default:
        throw new Error(`Unknown ResetRequestsTable action: ${action}`)
    }
  }
}

export default new AdminPO()
