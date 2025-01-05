import eslint from '@eslint/js'
import parser from '@typescript-eslint/parser'
import vitest from '@vitest/eslint-plugin'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import customEslintRules from './custom/eslint-rules/index.mjs'

export default tseslint.config(
  {
    languageOptions: {
      ecmaVersion: 2016,
      sourceType: 'module',
      globals: { ...globals.node }
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    plugins: {
      custom: customEslintRules
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      camelase: 'off',
      'space-before-function-paren': ['error', { named: 'never' }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      'custom/no-use-process-env': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'prettier/prettier': 'error'
    }
  },
  {
    files: [
      '__tests__/**/*.[jt]s',
      '**/__tests__/**/*.[jt]s',
      '**/?(*.)+(spec|test).[jt]s/**'
    ], // or any other pattern
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules
    },
    settings: {
      vitest: {
        typecheck: true
      }
    },
    languageOptions: {
      parser: parser,
      globals: {
        ...vitest.environments.env.globals,
        ...globals.node
      }
    }
  },
  {
    ignores: ['node_modules/', 'dist/']
  }
)
