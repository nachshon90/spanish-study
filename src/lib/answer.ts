function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function normalize(value: string): string {
  return stripAccents(value.trim().toLowerCase())
}

export type AnswerResult = 'correct' | 'accent' | 'incorrect'

/**
 * Compares a typed answer to the computed conjugation. An accent-only
 * mismatch (e.g. "hablo" vs "hábló") is flagged separately so the UI can
 * explain the mistake, but it still counts as a miss for spaced-repetition
 * purposes — accents are part of correct Spanish.
 */
export function checkAnswer(input: string, correct: string): AnswerResult {
  const typed = input.trim().toLowerCase()
  if (typed === correct.toLowerCase()) return 'correct'
  if (normalize(typed) === normalize(correct)) return 'accent'
  return 'incorrect'
}
