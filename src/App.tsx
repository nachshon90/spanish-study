import { type FormEvent } from 'react'
import './App.css'
import { useQuiz } from './hooks/useQuiz'
import { PRONOUN_LABEL, TENSE_LABEL, type Tense } from './lib/types'

const ALL_TENSES: Tense[] = ['present', 'preterite']

function App() {
  const {
    current,
    feedback,
    input,
    setInput,
    submitAnswer,
    nextQuestion,
    score,
    dueCount,
    totalCards,
    enabledTenses,
    toggleTense,
    resetProgress,
  } = useQuiz()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (feedback) {
      nextQuestion()
    } else {
      submitAnswer()
    }
  }

  const accuracy = score.attempted > 0 ? Math.round((score.correct / score.attempted) * 100) : null

  return (
    <div className="app">
      <header>
        <h1>Verbo</h1>
        <p className="subtitle">Spanish verb conjugation practice, with spaced repetition on the verbs you miss.</p>
      </header>

      <section className="scoreboard" aria-label="Score">
        <div className="stat">
          <span className="stat-value">{score.correct}/{score.attempted}</span>
          <span className="stat-label">correct</span>
        </div>
        <div className="stat">
          <span className="stat-value">{accuracy === null ? '—' : `${accuracy}%`}</span>
          <span className="stat-label">accuracy</span>
        </div>
        <div className="stat">
          <span className="stat-value">{score.currentStreak}</span>
          <span className="stat-label">streak</span>
        </div>
        <div className="stat">
          <span className="stat-value">{score.bestStreak}</span>
          <span className="stat-label">best streak</span>
        </div>
        <div className="stat">
          <span className="stat-value">{dueCount}/{totalCards}</span>
          <span className="stat-label">due for review</span>
        </div>
      </section>

      <section className="settings" aria-label="Practice settings">
        <span className="settings-label">Tenses:</span>
        {ALL_TENSES.map((tense) => (
          <label key={tense} className="tense-toggle">
            <input
              type="checkbox"
              checked={enabledTenses.includes(tense)}
              onChange={() => toggleTense(tense)}
            />
            {TENSE_LABEL[tense]}
          </label>
        ))}
        <button type="button" className="link-button" onClick={resetProgress}>
          Reset progress
        </button>
      </section>

      {current && (
        <form className="quiz-card" onSubmit={handleSubmit}>
          <p className="prompt-tense">{TENSE_LABEL[current.tense]}</p>
          <p className="prompt-verb">
            {current.verb.infinitive}
            <span className="prompt-translation"> — {current.verb.translation}</span>
          </p>
          <p className="prompt-pronoun">{PRONOUN_LABEL[current.pronoun]}</p>

          <input
            type="text"
            className="answer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type the conjugated verb…"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={!!feedback}
            aria-label="Your answer"
          />

          {feedback && (
            <div className={`feedback feedback-${feedback.result}`} role="status">
              {feedback.result === 'correct' && <p>¡Correcto!</p>}
              {feedback.result === 'accent' && (
                <p>
                  Almost — mind the accent. Correct answer: <strong>{feedback.correctAnswer}</strong>
                </p>
              )}
              {feedback.result === 'incorrect' && (
                <p>
                  Not quite. Correct answer: <strong>{feedback.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}

          <button type="submit" className="submit-button">
            {feedback ? 'Next →' : 'Check'}
          </button>
        </form>
      )}

      <footer>
        <p>Progress is saved automatically in this browser.</p>
      </footer>
    </div>
  )
}

export default App
