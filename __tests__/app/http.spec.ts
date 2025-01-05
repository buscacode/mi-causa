import { create } from '@/app/http'
import { describe, expect, test } from 'vitest'

describe('Package index', () => {
  test('should import correctly', () => {
    expect(create).toBeDefined()
  })
})
