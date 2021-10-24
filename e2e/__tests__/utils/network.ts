/**
Alternative to Puppeteer built-in network idle checks.
Shamelessly stolen from https://github.com/puppeteer/puppeteer/issues/3627#issuecomment-884470195
*/

import { Page, HTTPRequest } from 'puppeteer'
import EventEmitter from 'events'

export function createFunctionWaitForIdleNetwork(): (
  page: Page,
  idleTimeout: number,
  failTimeout: number,
) => Promise<void> {
  class Emitter extends EventEmitter {}

  let pendingRequests: HTTPRequest[] = []
  const emitter = new Emitter()

  function pushRequest(request: HTTPRequest) {
    pendingRequests.push(request)
    emitter.emit('active')
  }

  function popRequest(request: HTTPRequest) {
    pendingRequests = pendingRequests.filter((r) => r !== request)
    if (pendingRequests.length === 0) {
      emitter.emit('idle')
    }
  }

  page.on('request', pushRequest)
  page.on('requestfinished', popRequest)
  page.on('requestfailed', popRequest)

  /**
   * Return a promise that will resolve when the network is idle.
   *
   * @param idleTimeout
   *   The minimum amount of time that the network must be idle before the promise will resolve.
   *
   * @param failTimeout
   *   The maximum amount of time to wait for the network to become idle before rejecting.
   */
  async function waitForIdleNetwork(page: Page, idleTimeout: number, failTimeout: number): Promise<void> {
    let failTimer: NodeJS.Timeout
    let idleTimer: NodeJS.Timeout

    return new Promise((resolve, reject) => {
      function fail() {
        reject(new Error(`After ${failTimeout}ms, there are still ${pendingRequests.length} pending network requests.`))
      }

      function succeed() {
        clearTimeout(failTimer)
        resolve()
      }

      // Start failure time immediately.
      failTimer = setTimeout(fail, failTimeout)

      // Handle edge case where neither active nor idle is emitted during the lifetime of this promise.
      if (pendingRequests.length === 0) {
        idleTimer = setTimeout(succeed, idleTimeout)
      }

      // Play a game of whack-a-mole with the idle and active events.
      emitter.on('idle', () => {
        idleTimer = setTimeout(succeed, idleTimeout)
      })
      emitter.on('active', () => {
        clearTimeout(idleTimer)
      })
    })
  }

  return waitForIdleNetwork
}

/**
 * Alternative to network idle check in waitForNavigation (not useful for SPA).
 *
 * Ref: https://stackoverflow.com/a/61304202/11995537
 */
export function createFunctionWaitUntilHTMLRendered() {
  /**
   * Alternative to network idle check in waitForNavigation (not useful for SPA).
   *
   * Ref: https://stackoverflow.com/a/61304202/11995537
   */
  return async function waitUntilHTMLRendered(page: Page, intervalCheck: number): Promise<void> {
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
}
