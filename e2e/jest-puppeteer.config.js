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
      '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"',
      "--proxy-server='direct://'",
      '--proxy-bypass-list=*',
      // '–-ignore-certificate-errors',
    ],
    defaultViewport: null,
  },
  browserContext: 'incognito',
  browserPerWorker: true,
}
