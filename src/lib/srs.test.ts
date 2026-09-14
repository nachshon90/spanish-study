import { describe, expect, it } from 'vitest'
import { cardId, createInitialState, dueCount, pickNextCandidate, recordAnswer, type Candidate } from './srs'
import { VERBS } from './verbs'

const hablar = VERBS.find((v) => v.infinitive === 'hablar')!
const comer = VERBS.find((v) => v.infinitive === 'comer')!

describe('recordAnswer', () => {
  it('advances a card up the Leitner boxes on repeated correct answers', () => {
    const id = cardId(hablar, 'present', 'yo')
    let state = createInitialState()
    let now = 1000

    state = recordAnswer(state, id, true, now)
    expect(state.cards[id].box).toBe(2)

    now += 1
    state = recordAnswer(state, id, true, now)
    expect(state.cards[id].box).toBe(3)
    expect(state.cards[id].dueAt).toBeGreaterThan(now)
  })

  it('drops a card back to box 1 and marks it due immediately on a miss', () => {
    const id = cardId(hablar, 'present', 'yo')
    let state = createInitialState()
    state = recordAnswer(state, id, true, 0)
    state = recordAnswer(state, id, true, 1)
    expect(state.cards[id].box).toBeGreaterThan(1)

    state = recordAnswer(state, id, false, 2)
    expect(state.cards[id].box).toBe(1)
    expect(state.cards[id].dueAt).toBe(2)
    expect(state.cards[id].lapses).toBe(1)
  })

  it('tracks score, streak, and best streak', () => {
    const id = cardId(hablar, 'present', 'yo')
    let state = createInitialState()
    state = recordAnswer(state, id, true, 0)
    state = recordAnswer(state, id, true, 1)
    state = recordAnswer(state, id, false, 2)
    state = recordAnswer(state, id, true, 3)

    expect(state.score.attempted).toBe(4)
    expect(state.score.correct).toBe(3)
    expect(state.score.currentStreak).toBe(1)
    expect(state.score.bestStreak).toBe(2)
  })
})

describe('pickNextCandidate', () => {
  const candidates: Candidate[] = [
    { verb: hablar, tense: 'present', pronoun: 'yo', id: cardId(hablar, 'present', 'yo') },
    { verb: comer, tense: 'present', pronoun: 'yo', id: cardId(comer, 'present', 'yo') },
  ]

  it('always returns a due (never-seen) card when nothing has been answered yet', () => {
    const state = createInitialState()
    const picked = pickNextCandidate(state, candidates, 1000, () => 0)
    expect(candidates.map((c) => c.id)).toContain(picked.id)
  })

  it('prioritizes a missed card over one that was just answered correctly and is not yet due', () => {
    let state = createInitialState()
    // comer: answered correctly, pushed far into the future (not due).
    state = recordAnswer(state, candidates[1].id, true, 1000)
    // hablar: missed, so it's due immediately (box 1).
    state = recordAnswer(state, candidates[0].id, false, 1000)

    const now = 1001
    // Only the missed card should be in the "due" pool at this instant.
    expect(dueCount(state, candidates, now)).toBe(1)
    const picked = pickNextCandidate(state, candidates, now, () => 0)
    expect(picked.id).toBe(candidates[0].id)
  })

  it('falls back to the full candidate pool when nothing is due', () => {
    let state = createInitialState()
    state = recordAnswer(state, candidates[0].id, true, 0)
    state = recordAnswer(state, candidates[1].id, true, 0)
    // Immediately after, both cards are scheduled into the future.
    expect(dueCount(state, candidates, 1)).toBe(0)
    const picked = pickNextCandidate(state, candidates, 1, () => 0.99)
    expect(candidates.map((c) => c.id)).toContain(picked.id)
  })
})
