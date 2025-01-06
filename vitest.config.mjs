import path from 'path'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'json', 'html', 'text'],
      //reporter: ['lcov', 'json'],
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
      exclude: [
        ...configDefaults.exclude,
        '**/*.{mjs,cjs}',
        '**/dist/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/node_modules/**'
      ],
      include: ['src/**/*.{ts,js,tsx,jsx}'],
      all: true
    },
    setupFiles: ['./__mocks__/setup.ts'],
    // to avoid the Multi-threading default of vitest
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src')
      },
      {
        find: '@/',
        replacement: path.resolve(__dirname, 'src/')
      }
    ]
  }
})
