module.exports = {
  testTimeout: 240000,
  testMatch: ['**/?(*.)+(spec|test).[t]s'],
  globals: {
    // requires env definition in Dockerfile
    FRONTEND_URL: process.env.FRONTEND_URL,
  },
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', 'dist'],
  setupFilesAfterEnv: ['expect-puppeteer'],
}
