import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/__tests__/lib/**/*.test.ts',
    '<rootDir>/__tests__/api/**/*.test.ts',
    '<rootDir>/__tests__/app/**/*.test.tsx',
    '<rootDir>/__tests__/components/**/*.test.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
};

export default createJestConfig(config);
