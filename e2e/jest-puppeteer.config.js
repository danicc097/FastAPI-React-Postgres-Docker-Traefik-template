// per browser configuration

module.exports = {
  // globalSetup: './globalSetup.js',
  // globalTeardown: './globalTeardown.js',
  launch: {
    // slowMo: 50, // slow down all puppeteer operations to make debugging easier
    dumpio: false, // whether browser stdout and stderr are sent to process.stdout and process.stderr
    headless: process.env.HEADLESS !== 'false',
    product: 'chrome',
    args: [
      '--disable-infobars',
      '--window-size=2000,1200',
      '--no-sandbox',
      '--no-zygote',
      '--allow-insecure-localhost',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; W0W64; Trident/7.0; rv:11.0) like Gecko',
      // '–-ignore-certificate-errors',
    ],
    defaultViewport: null,
  },
  browserContext: 'incognito',
  browserPerWorker: true,
}
