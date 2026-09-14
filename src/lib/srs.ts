import type { Pronoun, Tense, Verb } from './types'

export interface CardState {
  id: string
  /** Leitner box 1 (just missed) through 5 (well known). */
  box: number
  /** Epoch ms when this card is next eligible to be asked again. */
  dueAt: number
  reps: number
  lapses: number
}

export interface ScoreState {
  correct: number
  attempted: number
  currentStreak: number
  bestStreak: number
}

export interface AppState {
  version: 1
  score: ScoreState
  cards: Record<string, CardState>
}

export const MAX_BOX = 5

/** Delay before a card in each box is due again. Box 1 is always "due now". */
const BOX_INTERVAL_MS: Record<number, number> = {
  1: 0,
  2: 10 * 60 * 1000, // 10 minutes
  3: 24 * 60 * 60 * 1000, // 1 day
  4: 3 * 24 * 60 * 60 * 1000, // 3 days
  5: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export function createInitialState(): AppState {
  return {
    version: 1,
    score: { correct: 0, attempted: 0, currentStreak: 0, bestStreak: 0 },
    cards: {},
  }
}

export function cardId(verb: Verb, tense: Tense, pronoun: Pronoun): string {
  return `${verb.infinitive}|${tense}|${pronoun}`
}

function getCard(state: AppState, id: string, now: number): CardState {
  return state.cards[id] ?? { id, box: 1, dueAt: now, reps: 0, lapses: 0 }
}

/**
 * Records the result of answering one card and returns a new AppState.
 * Correct answers advance the card to the next Leitner box (longer delay
 * before it resurfaces); a miss drops it back to box 1 so it comes up again
 * almost immediately — this is what drives the "spaced repetition on missed
 * verbs" behavior.
 */
export function recordAnswer(state: AppState, id: string, correct: boolean, now: number = Date.now()): AppState {
  const prev = getCard(state, id, now)
  const box = correct ? Math.min(prev.box + 1, MAX_BOX) : 1
  const card: CardState = {
    id,
    box,
    dueAt: now + BOX_INTERVAL_MS[box],
    reps: prev.reps + 1,
    lapses: prev.lapses + (correct ? 0 : 1),
  }

  return {
    ...state,
    score: {
      correct: state.score.correct + (correct ? 1 : 0),
      attempted: state.score.attempted + 1,
      currentStreak: correct ? state.score.currentStreak + 1 : 0,
      bestStreak: correct ? Math.max(state.score.bestStreak, state.score.currentStreak + 1) : state.score.bestStreak,
    },
    cards: { ...state.cards, [id]: card },
  }
}

export interface Candidate {
  verb: Verb
  tense: Tense
  pronoun: Pronoun
  id: string
}

/**
 * Picks the next quiz item. Cards that are due (missed verbs come back at
 * box 1, i.e. immediately due) are weighted so lower boxes / more lapses
 * surface more often; when nothing is due yet, falls back to a uniform
 * random pick across every candidate so review sessions don't stall.
 */
export function pickNextCandidate(
  state: AppState,
  candidates: Candidate[],
  now: number = Date.now(),
  random: () => number = Math.random,
): Candidate {
  if (candidates.length === 0) {
    throw new Error('pickNextCandidate requires at least one candidate')
  }

  const due = candidates.filter((c) => getCard(state, c.id, now).dueAt <= now)
  const pool = due.length > 0 ? due : candidates

  const weights = pool.map((c) => {
    const card = getCard(state, c.id, now)
    // Lower box and more lapses => higher weight => asked more often.
    return (MAX_BOX - card.box + 1) + card.lapses * 2
  })

  const total = weights.reduce((a, b) => a + b, 0)
  let roll = random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

export function dueCount(state: AppState, candidates: Candidate[], now: number = Date.now()): number {
  return candidates.filter((c) => getCard(state, c.id, now).dueAt <= now).length
}

export function getCardSnapshot(state: AppState, id: string, now: number = Date.now()): CardState {
  return getCard(state, id, now)
}
