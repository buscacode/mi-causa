import { describe, expect, test } from 'vitest'
import { createHttp } from '../src/index'

describe('Package index', () => {
  test('should import correctly', () => {
    expect(createHttp).toBeDefined()
  })
})
