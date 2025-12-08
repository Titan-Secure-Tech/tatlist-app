/**
 * Unit Tests for utility functions
 * Tests the cn (className merge) utility function
 */

import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const result = cn('text-red-500', false && 'hidden', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    const result = cn('px-4', 'px-2')
    // tailwind-merge should keep the last one
    expect(result).toBe('px-2')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['text-red-500', 'bg-blue-500'])
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle objects with truthy values', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': true,
      hidden: false,
    })
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle undefined and null values', () => {
    const result = cn('text-red-500', undefined, null, 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle empty string', () => {
    const result = cn('')
    expect(result).toBe('')
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'px-4 py-2',
      'text-red-500',
      { 'bg-blue-500': true, hidden: false },
      ['rounded-md', 'shadow-sm']
    )
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
    expect(result).toContain('rounded-md')
    expect(result).toContain('shadow-sm')
    expect(result).not.toContain('hidden')
  })
})
