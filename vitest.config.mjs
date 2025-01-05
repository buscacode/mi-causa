import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
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
        '**/__test__/**',
        '**/node_modules/**'
      ],
      include: ['packages/**/*.{ts,js,tsx,jsx}'],
      all: true
    }
  }
})
