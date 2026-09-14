import { useCallback, useEffect, useMemo, useState } from 'react'
import { checkAnswer, type AnswerResult } from '../lib/answer'
import { conjugate } from '../lib/conjugate'
import { loadState, saveState } from '../lib/storage'
import { cardId, dueCount, pickNextCandidate, recordAnswer, type AppState, type Candidate } from '../lib/srs'
import type { Tense } from '../lib/types'
import { VERBS } from '../lib/verbs'
import { PRONOUNS } from '../lib/types'

export type FeedbackState = { result: AnswerResult; correctAnswer: string } | null

const ALL_TENSES: Tense[] = ['present', 'preterite']

function buildCandidates(tenses: Tense[]): Candidate[] {
  const candidates: Candidate[] = []
  for (const verb of VERBS) {
    for (const tense of tenses) {
      for (const pronoun of PRONOUNS) {
        candidates.push({ verb, tense, pronoun, id: cardId(verb, tense, pronoun) })
      }
    }
  }
  return candidates
}

export function useQuiz() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [enabledTenses, setEnabledTenses] = useState<Tense[]>(ALL_TENSES)
  const [current, setCurrent] = useState<Candidate | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [input, setInput] = useState('')

  const candidates = useMemo(
    () => buildCandidates(enabledTenses.length > 0 ? enabledTenses : ALL_TENSES),
    [enabledTenses],
  )

  const advance = useCallback(
    (fromState: AppState) => {
      setCurrent(pickNextCandidate(fromState, candidates))
      setFeedback(null)
      setInput('')
    },
    [candidates],
  )

  // Persist on every state change.
  useEffect(() => {
    saveState(state)
  }, [state])

  // Pick a fresh question whenever the active candidate pool changes
  // (initial load, or the learner toggles which tenses to practice).
  useEffect(() => {
    advance(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates])

  const submitAnswer = useCallback(() => {
    if (!current || feedback) return
    const correctAnswer = conjugate(current.verb, current.tense, current.pronoun)
    const result = checkAnswer(input, correctAnswer)
    setFeedback({ result, correctAnswer })
    setState((prev) => recordAnswer(prev, current.id, result === 'correct'))
  }, [current, feedback, input])

  const nextQuestion = useCallback(() => {
    advance(state)
  }, [advance, state])

  const toggleTense = useCallback((tense: Tense) => {
    setEnabledTenses((prev) => {
      const next = prev.includes(tense) ? prev.filter((t) => t !== tense) : [...prev, tense]
      // Always keep at least one tense active.
      return next.length > 0 ? next : prev
    })
  }, [])

  const resetProgress = useCallback(() => {
    const fresh = { version: 1 as const, score: { correct: 0, attempted: 0, currentStreak: 0, bestStreak: 0 }, cards: {} }
    setState(fresh)
    advance(fresh)
  }, [advance])

  const due = useMemo(() => dueCount(state, candidates), [state, candidates])

  return {
    current,
    feedback,
    input,
    setInput,
    submitAnswer,
    nextQuestion,
    score: state.score,
    dueCount: due,
    totalCards: candidates.length,
    enabledTenses,
    toggleTense,
    resetProgress,
  }
}
