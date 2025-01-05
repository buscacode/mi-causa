import { describe, expect, test } from 'vitest'
import http from '../src/index'

describe('Package index', () => {
  test('should import correctly', () => {
    expect(http).toBeDefined()
  })
})
