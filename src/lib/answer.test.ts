import { describe, expect, it } from 'vitest'
import { checkAnswer } from './answer'

describe('checkAnswer', () => {
  it('matches an exact answer', () => {
    expect(checkAnswer('hablo', 'hablo')).toBe('correct')
  })

  it('is case-insensitive and trims whitespace', () => {
    expect(checkAnswer('  Hablo  ', 'hablo')).toBe('correct')
  })

  it('flags an accent-only mismatch separately', () => {
    expect(checkAnswer('hablo', 'habló')).toBe('accent')
    expect(checkAnswer('pense', 'pensé')).toBe('accent')
  })

  it('treats a genuinely wrong answer as incorrect', () => {
    expect(checkAnswer('como', 'hablo')).toBe('incorrect')
    expect(checkAnswer('', 'hablo')).toBe('incorrect')
  })
})
