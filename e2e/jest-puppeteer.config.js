// per browser configuration

module.exports = {
  globalSetup: './globalSetup.js',
  globalTeardown: './globalTeardown.js',
  launch: {
    // slowMo: 50, // slow down all puppeteer operations to make debugging easier
    dumpio: false, // whether browser stdout and stderr are sent to process.stdout and process.stderr
    headless: process.env.HEADLESS !== 'false',

    args: [
      '--disable-infobars',
      '--window-size=2000,1200',
      '--no-sandbox',
      '--no-zygote',
      '--allow-insecure-localhost',
      // '–-ignore-certificate-errors',
    ],
    defaultViewport: null,
  },
  browserContext: 'incognito',
}
