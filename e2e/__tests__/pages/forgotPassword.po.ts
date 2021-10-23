import BasePO from './base.po'

class ForgotPasswordPO extends BasePO {
  private readonly $PasswordResetRequestSuccessToast = '#password-reset-request-toast-success'
  private readonly $PasswordResetForm = 'form[name="forgotPasswordForm"]'

  async go() {
    await this.navigate('/forgot-password')
  }

  async waitForPasswordResetRequestSuccessToast() {
    await page.waitForSelector(this.$PasswordResetRequestSuccessToast, { visible: true, timeout: 10000 })
  }

  async fillPasswordResetRequestForm(email: string, message: string) {
    await expect(page).toFillForm(`${this.$PasswordResetForm}`, {
      email,
      message,
    })
  }

  async submitPasswordResetRequestForm() {
    expect(page).toClick(`${this.$PasswordResetForm} button[type="submit"]`)
  }
}

export default new ForgotPasswordPO()
