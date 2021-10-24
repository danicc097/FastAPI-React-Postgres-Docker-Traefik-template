import chalk from 'chalk'
import { ElementHandle, Page } from 'puppeteer'
import { users } from '../data/users'
import * as expectPup from 'expect-puppeteer'

export default abstract class BasePO {
  protected readonly FRONTEND_URL = FRONTEND_URL
  protected readonly $RowErrorContainer = '.euiFormErrorText'
  protected readonly $CalloutErrorContainer = '.euiForm__error'

  private readonly $ConfirmModal = "[data-test-subj='confirmModalConfirmButton']"
  private readonly $CancelModal = "[data-test-subj='confirmModalCancelButton']"

  /**
   * Alternative to network idle check in waitForNavigation (not useful for SPA).
   *
   * Ref: https://stackoverflow.com/a/61304202/11995537
   */
  async waitUntilHTMLRendered(page: Page, intervalCheck = 100): Promise<void> {
    const maxChecks = (10 * 1000) / intervalCheck
    let lastHTMLSize = 0
    let checkCounts = 1
    let countStableSizeIterations = 0
    const minStableSizeIterations = 3

    while (checkCounts++ <= maxChecks) {
      let html = await page.content()
      let currentHTMLSize = html.length

      // let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length)
      // console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, ' body html size: ', bodyHTMLSize)

      if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) countStableSizeIterations++
      else countStableSizeIterations = 0 //reset the counter

      if (countStableSizeIterations >= minStableSizeIterations) {
        // console.log('Page rendered fully..')
        break
      }

      lastHTMLSize = currentHTMLSize
      await page.waitForTimeout(intervalCheck)
    }
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

  async confirmModal() {
    // await this.waitUntilHTMLRendered(page, 250)
    await this.waitForVisibleSelectorAndClick(this.$ConfirmModal)
  }

  async cancelModal() {
    // await this.waitUntilHTMLRendered(page, 250)
    await this.waitForVisibleSelectorAndClick(this.$CancelModal)
  }

  async getFormRowErrors(): Promise<(string | null)[]> {
    const errors = await page.$$(this.$RowErrorContainer)
    return Promise.all(errors.map((error) => error.evaluate((node) => node.textContent)))
  }

  async waitForSelectorAndClick($selector: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 15)
    await page.waitForNetworkIdle()
    await page.waitForSelector($selector, { timeout: 30000 }).then(async () => {
      await page.click($selector, { delay: 50 })
    })
  }

  async waitForVisibleSelectorAndClick($selector: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 15)
    await page.waitForNetworkIdle()
    await page.waitForSelector($selector, { visible: true, timeout: 30000 }).then(async () => {
      await page.click($selector, { delay: 50 })
    })
  }

  async waitForSelectorAndType($selector: string, text: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 15)
    await page.waitForNetworkIdle()
    await page.waitForSelector($selector, { timeout: 30000 })
    await page.type($selector, text)
  }

  /** Wait for element and click */
  async waitForXPathAndClick($xXPath: string): Promise<void> {
    await this.waitUntilHTMLRendered(page, 50)
    await page.waitForNetworkIdle()
    await page.waitForXPath($xXPath, { timeout: 30000 })
    const elements = await page.$x($xXPath)
    await elements[0]?.click()
  }

  async getFormCalloutErrors(): Promise<(string | null)[]> {
    await page.waitForNetworkIdle()
    await this.waitUntilHTMLRendered(page, 15)
    const errors = await page.$$(this.$CalloutErrorContainer)
    // handle multiple promises, else it will nested promises and not the actual error
    return Promise.all(errors.map((error) => error.evaluate((node) => node.textContent)))
  }

  async navigate(url: string) {
    await page.goto(`${this.FRONTEND_URL}${url}`)
    await this.waitUntilHTMLRendered(page, 75)
    await page.waitForNetworkIdle()
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
  async isLoggedIn(user: userType | updatableUserType): Promise<boolean> {
    await this.waitUntilHTMLRendered(page, 15)
    return await page.$(`[title='${users[user].username}']`).then((ele) => !!ele)
  }

  /** Login as a predefined user */
  async login(user: userType | updatableUserType): Promise<void> {
    await this.navigate(`/login`)
    await page.waitForNetworkIdle()
    await this.waitUntilHTMLRendered(page, 50)
    const isLoggedIn = await this.isLoggedIn(user)
    if (!isLoggedIn) {
      await this.autoLogout() // in case we were testing someone else
      // avatar might take a while to render or something? selector might fail
      await this.waitForVisibleSelectorAndClick("[data-test-subj='avatar']")

      await this.waitForSelectorAndType("[data-test-subj='email-input']", users[user].email)
      await this.waitForSelectorAndType("[data-test-subj='password-input']", users[user].password)
      await this.waitForVisibleSelectorAndClick("[data-test-subj='login-submit']")
      // this almost fixes the Not Authenticated permanent error due to first
      // attempt to fetch token when visiting the page.
      page.once('response', async (response) => {
        while (!response.request().url().includes('users/me') && response.status() !== 200) {
          await page.waitForTimeout(100)
        }
      })
      await this.waitUntilHTMLRendered(page, 125) // necessary
    }
  }
  /**
   * Intercept an user's password request right after a triggering event is emitted.
   */
  async interceptPasswordReset(
    trigger: () => Promise<void>,
    user: userType | updatableUserType,
  ): Promise<string | undefined> {
    let newPassword

    await trigger().then(() =>
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
      await page.waitForNetworkIdle()
    } else {
      return // already logged out
    }
  }
}
