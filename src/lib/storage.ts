import { createInitialState, type AppState } from './srs'

const STORAGE_KEY = 'spanish-study:v1'

/**
 * localStorage is a boundary: it can be unavailable (SSR, privacy mode),
 * full, or hold data from a previous schema version, so every access is
 * guarded and falls back to a fresh in-memory state instead of throwing.
 */
export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (parsed.version !== 1 || !parsed.score || !parsed.cards) {
      return createInitialState()
    }
    return parsed as AppState
  } catch {
    return createInitialState()
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable or quota exceeded — progress simply won't persist
    // for this session, which is preferable to crashing the quiz.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
