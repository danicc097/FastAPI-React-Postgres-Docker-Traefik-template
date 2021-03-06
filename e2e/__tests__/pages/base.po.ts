import chalk from 'chalk'
import { ElementHandle, Page } from 'puppeteer'
import { Users, users } from '../initialData/users'
import * as expectPup from 'expect-puppeteer'
import { createFunctionWaitForIdleNetwork, createFunctionWaitUntilHTMLRendered } from '../utils/network'
import { globalNotifications } from '../initialData/globalNotifications'
import { personalNotifications } from '../initialData/personalNotifications'

export default abstract class BasePO {
  protected readonly FRONTEND_URL = FRONTEND_URL
  protected readonly $RowErrorContainer = '.euiFormErrorText'
  protected readonly $CalloutErrorContainer = '.euiForm__error'
  private readonly $ConfirmModal = "[data-test-subj='confirmModalConfirmButton']"
  private readonly $CancelModal = "[data-test-subj='confirmModalCancelButton']"
  private readonly $headerPersonalNotificationsButton = "[data-test-subj='headerPersonalNotificationsButton']"
  private readonly $headerGlobalNotificationsButton = "[data-test-subj='headerGlobalNotificationsButton']"

  /**
   * Throw an error if ``failTimeout`` is reached and there are pending requests.
   */
  public waitForIdleNetwork = createFunctionWaitForIdleNetwork()

  public waitUntilHTMLRendered = createFunctionWaitUntilHTMLRendered()

  async waitForNetwork0(page: Page, timeout = 500) {
    await new Promise((resolve) => {
      let timer: NodeJS.Timeout
      page.on('response', () => {
        clearTimeout(timer)
        timer = setTimeout(resolve, timeout)
      })
    })
  }

  async setupPuppeteerLogging() {
    page
      .on('console', (message) => {
        const type = message.type().substr(0, 3).toUpperCase()
        const colors: any = {
          LOG: (text: any) => text,
          ERR: chalk.red,
          WAR: chalk.yellow,
          INF: chalk.cyan,
        }
        const color = colors[type] || chalk.blue
        console.log(color(`${type} ${message.text()}`))
      })
      .on('pageerror', ({ message }) => console.log(chalk.red(message.toString() || message)))
      // .on('response', (response) => console.log(chalk.green(`${response.status()} ${response.url()}`)))
      .on('requestfailed', (request) => console.log(chalk.magenta(`${request.failure().errorText} ${request.url()}`)))
  }

  abstract go(): Promise<void> // to be derived from per page

  /**
   *Generic retry for a given async function ``fn``
   * @example
      ```
      await this.retry(
         page,
         async () => {
           return await myFunction()
         },
         30,
       )
       ```
   */
  async retry(page: Page, fn: () => Promise<any>, retryCount: number): Promise<any> {
    while (retryCount > 0) {
      try {
        return await fn()
      } catch (e) {
        await this.waitUntilHTMLRendered(page, 50)
        return await this.retry(page, fn, retryCount - 1)
      }
    }
    throw new Error(`Retry count reached ${retryCount} for ${fn.toString()}`)
  }

  async confirmModal() {
    await this.retry(
      page,
      async () => {
        await this.waitForSelectorAndClick(this.$ConfirmModal)
      },
      5,
    )
  }

  async cancelModal() {
    await this.retry(
      page,
      async () => {
        await this.waitForSelectorAndClick(this.$CancelModal)
      },
      5,
    )
  }

  async getFormRowErrors(): Promise<(string | null)[]> {
    const errors = await page.$$(this.$RowErrorContainer)
    return Promise.all(errors.map((error) => error.evaluate((node) => node.textContent)))
  }

  async openGlobalNotifications() {
    await this.waitForSelectorAndClick(this.$headerGlobalNotificationsButton)
  }

  async closeGlobalNotifications() {
    await this.waitForSelectorAndClick('[data-test-subj="euiFlyoutCloseButton"]')
  }

  async viewGlobalNotificationData(id: number) {
    // : Promise<NotificationAlert[]>
    await this.openGlobalNotifications()
    const $xNotification = `[@data-test-subj="global-notifications-alert-${id}"]`
    await page.waitForXPath(`//*${$xNotification}`, { timeout: 7000 })
    const key = `testnotification${id}` as keyof typeof globalNotifications
    expect(globalNotifications[key].receiver_role).toBe('admin')
    const $xTitle = `//*${$xNotification}//*[contains(text(), "${globalNotifications[key].title}")]`
    const $xBody = `//*${$xNotification}//*[contains(text(), "${globalNotifications[key].body}")]`
    const $xLink = `//*${$xNotification}//*[contains(text(), "${globalNotifications[key].link}")]`
    const $xLabel = `//*${$xNotification}//*[contains(text(), "${globalNotifications[key].label}")]`

    const notification = await page.evaluate(
      (xTitle, xBody, xLink, xLabel) => {
        const title = document.evaluate(xTitle, document, null, XPathResult.STRING_TYPE, null).stringValue
        const body = document.evaluate(xBody, document, null, XPathResult.STRING_TYPE, null).stringValue
        const link = document.evaluate(xLink, document, null, XPathResult.STRING_TYPE, null).stringValue
        const label = document.evaluate(xLabel, document, null, XPathResult.STRING_TYPE, null).stringValue
        return { title, body, link, label } as NotificationAlert
      },
      $xTitle,
      $xBody,
      $xLink,
      $xLabel,
    )

    await this.closeGlobalNotifications()

    return notification
  }

  async openPersonalNotifications() {
    await this.waitForSelectorAndClick(this.$headerPersonalNotificationsButton)
    await this.waitUntilHTMLRendered(page, 150)
  }

  async viewPersonalNotificationData(id: number) {
    await this.openPersonalNotifications()

    const $xNotification = `@data-test-subj="personal-notifications-alert-${id}"`
    await page.waitForXPath(`//*[${$xNotification}]`, { timeout: 7000 })
    const key = `testnotification${id}` as keyof typeof personalNotifications
    expect(personalNotifications[key].receiver_email).toBe(users.admin.email)
    const $xTitle = `//*[${$xNotification} and //*[text()="${personalNotifications[key].title}"]]`
    const $xBody = `//*[${$xNotification} and //*[text()="${personalNotifications[key].body}"]]`
    const $xLink = `//*[${$xNotification} and //*[text()="${personalNotifications[key].link}"]]`
    const $xLabel = `//*[${$xNotification} and //*[text()="${personalNotifications[key].label}"]]`

    const notification = await page.evaluate(
      (xTitle, xBody, xLink, xLabel) => {
        const title = document.evaluate(xTitle, document, null, XPathResult.STRING_TYPE, null).stringValue
        const body = document.evaluate(xBody, document, null, XPathResult.STRING_TYPE, null).stringValue
        const link = document.evaluate(xLink, document, null, XPathResult.STRING_TYPE, null).stringValue
        const label = document.evaluate(xLabel, document, null, XPathResult.STRING_TYPE, null).stringValue
        return { title, body, link, label } as NotificationAlert
      },
      $xTitle,
      $xBody,
      $xLink,
      $xLabel,
    )

    return notification
  }

  async waitForSelectorAndSelect($selector: string, value: string) {
    await this.waitUntilHTMLRendered(page, 25)
    await page.waitForSelector($selector, { timeout: 3000 })
    await page.select($selector, value)
  }

  /** Increase wait time for rendering to avoid random failures */
  async waitForSelectorAndClick($selector: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 50)
    await page.waitForSelector($selector, { timeout: 3000 })
    await page.click($selector, { delay: 50 })
  }

  /** Increase wait time for rendering to avoid random failures */
  async waitForVisibleSelectorAndClick($selector: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 50)
    await page.waitForSelector($selector, { visible: true, timeout: 3000 })
    await page.click($selector, { delay: 50 })
  }

  /** Increase wait time for rendering to avoid random failures */
  async waitForSelectorAndType($selector: string, text: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 50)
    await page.waitForSelector($selector, { timeout: 3000 })

    await page.type($selector, text)
  }

  /** Increase wait time for rendering to avoid random failures */
  async waitForXPathAndClick($xXPath: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 50)
    await page.waitForXPath($xXPath, { timeout: 3000 })

    const elements = await page.$x($xXPath)
    await elements[0]?.click()
  }

  async getFormCalloutErrors(): Promise<(string | null)[]> {
    await this.waitUntilHTMLRendered(page, 50)
    const errors = await page.$$(this.$CalloutErrorContainer)
    // handle multiple promises, else it will nested promises and not the actual error
    return Promise.all(errors.map((error) => error.evaluate((node) => node.textContent)))
  }

  async navigate(url: string) {
    await page.goto(`${this.FRONTEND_URL}${url}`, { waitUntil: 'domcontentloaded' })
    await this.waitUntilHTMLRendered(page, 50)
  }

  async getElementTextBySelector($selector: string): Promise<string> {
    const element = await page.$($selector)

    if (!element) {
      return ''
    }

    return page.evaluate((ele) => ele.textContent || '', element)
  }

  async getElementText($element: ElementHandle<Element>): Promise<string> {
    return $element.evaluate((ele) => ele.textContent || '')
  }

  /** Ensure a specific user is logged in */
  async isLoggedIn(user: keyof Users): Promise<boolean> {
    await this.waitUntilHTMLRendered(page, 50)
    return await page.$(`[title='${users[user].username}']`).then((ele) => !!ele)
  }

  /** Login as a predefined user */
  async login(user: keyof Users, expectSuccess: boolean = false): Promise<void> {
    await this.navigate(`/login`)
    await this.waitUntilHTMLRendered(page, 50)
    const isLoggedIn: boolean = await this.retry(
      page,
      async () => {
        return await this.isLoggedIn(user)
      },
      30,
    )
    if (!isLoggedIn) {
      await this.autoLogout() // in case we were testing someone else
      // avatar might take a while to render or something? selector might fail
      await this.waitForVisibleSelectorAndClick("[data-test-subj='avatar']")

      await this.waitForSelectorAndType("[data-test-subj='email-input']", users[user].email)
      await this.waitForSelectorAndType("[data-test-subj='password-input']", users[user].password)
      await this.waitForVisibleSelectorAndClick("[data-test-subj='login-submit']")

      if (expectSuccess) {
        await page.waitForResponse(
          (response) => {
            return response.request().url().includes('users/me') && response.status() === 200
          },
          { timeout: 10000 },
        )
      }
      await this.waitUntilHTMLRendered(page, 50) // will redirect to profile immediately
    }
  }
  /**
   * Intercept an user's password request right after a triggering event is emitted.
   */
  async interceptPasswordReset(trigger: () => Promise<void>, user: keyof Users): Promise<string | undefined> {
    let newPassword

    trigger().then(() =>
      page.once('response', async (response) => {
        if (response.request().url().includes('reset-user-password')) {
          // equivalent to response.buffer().toString('utf-8')
          newPassword = await response.text()
          console.log(`New password for ${users[user].email}:`, newPassword)
          users[user].password = newPassword
        }
      }),
    )

    const initialPassword = users[user].password
    while (users[user].password === initialPassword) {
      await page.waitForTimeout(100)
    }

    return newPassword
  }

  /** Log out regardless of current user */
  async autoLogout(): Promise<void> {
    await this.waitForVisibleSelectorAndClick("[data-test-subj='avatar']")
    const logoutButton = await page.$("[data-test-subj='logout']")

    if (!!logoutButton) {
      await logoutButton.click()
      await this.waitUntilHTMLRendered(page, 125) // will redirect to root
    } else {
      return // already logged out
    }
  }
}
