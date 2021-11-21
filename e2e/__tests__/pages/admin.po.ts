import { ElementHandle } from 'puppeteer'
import { schema } from '../types/schema_override'
import BasePO from './base.po'

export class UnverifiedUsersPO extends BasePO {
  private readonly $VerifyUserButton = "[data-test-subj='verify-users-submit']"

  async go() {
    await this.navigate('/admin/unverified-users')
  }

  async selectFromUnverifiedUsersTable(email: string) {
    await this.waitForVisibleSelectorAndClick(`[data-test-subj="checkboxSelectRow-${email}"]`)
  }

  async clickVerifyUsersButton() {
    // button is hidden by default and shown on row selection
    await this.waitForVisibleSelectorAndClick(this.$VerifyUserButton)
  }
}

export class PasswordResetPO extends BasePO {
  private readonly $EnabledPasswordResetFormButton = "[data-test-subj='passwordResetForm__submit']:not([disabled])"

  async go() {
    await this.navigate('/admin/password-reset')
  }

  async selectFromPasswordResetTable(email: string) {
    await this.waitForVisibleSelectorAndClick(`.euiSelectableListItem[title="${email}"]`)
  }

  async clickPasswordResetButton() {
    await this.waitForVisibleSelectorAndClick(this.$EnabledPasswordResetFormButton)
  }
}

export class PasswordResetRequestsPO extends BasePO {
  private readonly $xPasswordResetRequestsRow = '[@data-test-subj="passwordResetTable__row"]'

  async go() {
    await this.navigate('/admin/password-reset-requests')
  }

  // We must rely on XPaths to get text content
  async clickResetRequestsTableAction(email: string, action: 'reset' | 'delete') {
    await page.waitForXPath(`//*${this.$xPasswordResetRequestsRow}`, { timeout: 20000 })
    const $xEmailCell = `//*${this.$xPasswordResetRequestsRow}//*[contains(text(), "${email}")]`
    const $xActionRow = `${$xEmailCell}/ancestor::*${this.$xPasswordResetRequestsRow}`
    await page.waitForXPath($xActionRow, { timeout: 20000 })
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

/**
 * Page to test generic admin functionality not specific to any one page
 */
export class AdminPO extends BasePO {
  async go() {
    await this.navigate('/')
  }
  async clickOnAddNewGlobalNotification() {
    await this.waitForVisibleSelectorAndClick('[data-test-subj="addGlobalNotification"]')
  }

  async fillGlobalNotificationForm(notification: schema['GlobalNotificationCreate']) {
    await this.waitForSelectorAndType('[data-test-subj="notificationTitle"]', notification.title)
    await this.waitForSelectorAndType('[data-test-subj="notificationBody"]', notification.body)
    await this.waitForSelectorAndType('[data-test-subj="notificationLabel"]', notification.label)
    notification.link
      ? await this.waitForSelectorAndType('[data-test-subj="notificationLink"]', notification.link)
      : null
    await this.waitForSelectorAndSelect('[data-test-subj="notificationReceiverRole"]', notification.receiver_role)
  }

  async clickOnPublishGlobalNotification() {
    await this.waitForVisibleSelectorAndClick('[data-test-subj="publishGlobalNotification"]')
  }
}
