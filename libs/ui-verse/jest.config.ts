/* eslint-disable */
export default {
  displayName: 'ui-verse',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    // Global stylesheets only. `.module.scss` keeps going through the Nx file transform.
    '^(?!.*\\.module\\.scss$).+\\.(css|scss)$': '<rootDir>/src/test-style-stub.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/ui-verse',
};
