module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'js/app.js',
    '!js/app.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
