# Verbo — Spanish Verb Conjugation Trainer

A small study app for practicing Spanish verb conjugation (present indicative
and preterite). Questions are generated programmatically from a verb list and
a set of conjugation rules — there is no fixed bank of question/answer pairs.
Verbs you get wrong come back sooner via a simple spaced-repetition scheduler,
and your score and progress are saved in the browser between visits.

**Live app:** deployed via GitHub Pages — see [Deployment](#deployment) for
the URL and how it's published.

## Features

- **Programmatic conjugation, not a fact table.** `-ar`/`-er`/`-ir` endings,
  orthographic spelling changes (`buscar` → `busqué`), and boot stem-changes
  (`pensar` → `pienso`) are all computed by rule at quiz time. A separate
  sparse lookup table supplies only the handful of forms that are genuinely
  irregular (`ser`, `ir`, `tener`, …). See [Architecture](#architecture).
- **Spaced repetition on missed verbs.** A Leitner-box scheduler tracks every
  (verb, tense, pronoun) combination independently. A miss drops that card
  back to box 1 so it resurfaces almost immediately; repeated correct answers
  push it further out.
- **Score tracking**: running accuracy, current streak, best streak, and how
  many cards are currently due for review.
- **Persisted state**: score and spaced-repetition progress are saved to
  `localStorage` and reloaded on your next visit. Storage access is
  best-effort — the app still works (without persistence) if storage is
  blocked or unavailable.
- **Tense filters** so you can practice present, preterite, or both.

## Setup

Requires Node.js 20+.

```bash
npm install
npm run dev       # start the dev server (Vite), then open the printed URL
```

Other useful scripts:

```bash
npm run build     # type-check and build the production bundle to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
npx vitest run    # run the unit test suite
npx vitest        # run tests in watch mode
```

## Architecture

```
src/
  lib/
    types.ts       # Verb, Tense, Pronoun types shared across the app
    conjugate.ts    # The rule engine: regular endings, orthographic
                     # adjustments, stem-change handling, and the final
                     # irregular-table override
    verbs.ts        # Verb data: infinitive, translation, ending, optional
                     # stem-change pattern, optional irregular overrides
    srs.ts          # Leitner-box spaced-repetition scheduler
    storage.ts       # localStorage persistence (load/save/clear), guarded
                     # against unavailable/corrupt storage
    answer.ts        # Compares typed input to the computed answer
                     # (exact / accent-only-miss / wrong)
  hooks/
    useQuiz.ts       # Wires verb data + SRS + storage into quiz state
                      # for the UI
  App.tsx            # Quiz UI: prompt, input, feedback, score dashboard
```

### Why "programmatic rules + irregular lookup", not hardcoded Q&A

A naive verb quiz could just store a giant list of
`{question: "yo + hablar", answer: "hablo"}` pairs. That doesn't scale (every
new tense or verb needs its own manually-written answers) and it can't
express *why* an answer is correct. Instead:

1. **`conjugate.ts`** implements the actual rules of Spanish conjugation as
   code: the six-person present/preterite endings for each of `-ar`/`-er`/`-ir`,
   the `-car/-gar/-zar` spelling adjustment needed before an `é` ending
   (`toqué`, `llegué`, `empecé`), the `i → y` swap for vowel-stem verbs in the
   3rd-person preterite (`leyó`, `leyeron`), and boot stem-changes (`e:ie`,
   `o:ue`, `e:i`, `u:ue`) restricted to the stressed forms (not
   `nosotros`/`vosotros`), including the reduced-vowel version that
   `-ir` stem-changers take in the 3rd-person preterite (`pidió`, `durmió`).
2. **`verbs.ts`** is a *data table*, not a question bank: each entry states
   facts about a verb (its ending, its stem-change pattern if any, and — for
   verbs that are genuinely irregular — only the specific forms that can't be
   derived by rule, e.g. `tener` → `tengo`). Everything else is left for the
   engine to compute.
3. At quiz time, `conjugate(verb, tense, pronoun)` checks the verb's
   irregular-override table first; if there's no override for that exact
   tense/pronoun, it falls through to the programmatic rule. This means the
   same small amount of code correctly conjugates all ~50 verbs in the data
   set across both tenses and all six persons (300+ distinct forms), and
   adding a new regular verb requires only one line of data.

`src/lib/conjugate.test.ts` exercises this directly, including a test that
conjugates every verb in `verbs.ts` across every tense/pronoun combination
without throwing, plus targeted assertions on the trickier rules above.

### Spaced repetition design

Each `(verb, tense, pronoun)` combination is an independent "card" identified
by a string key. A card's state is `{ box: 1..5, dueAt, reps, lapses }`:

- A **correct** answer advances the card one box (capped at 5) and pushes
  `dueAt` further into the future (10 min → 1 day → 3 days → 7 days).
- An **incorrect** answer resets the card to box 1 with `dueAt = now`, so it
  is immediately eligible to be asked again.

When picking the next question, the app first restricts to cards that are
currently due (which always includes anything never seen before, since a new
card defaults to due-now). Among due cards, ones with a lower box or more
past lapses are weighted to appear more often. If nothing is due yet (e.g.
you've recently answered everything correctly), it falls back to a uniform
random pick across the whole candidate pool so a session never stalls.

This is intentionally a simple, easy-to-verify scheme (see
`src/lib/srs.test.ts`) rather than a full SM-2/Anki-style implementation —
appropriate for a personal study tool, and straightforward to swap out later
if a more sophisticated scheduler is wanted.

### Persistence

`src/lib/storage.ts` wraps `localStorage` behind `loadState()` / `saveState()`
/ `clearState()`. All access is wrapped in `try/catch` and falls back to a
fresh in-memory state on any failure (private browsing, storage disabled,
corrupted/old-schema data), so a storage problem degrades to "progress isn't
saved this session" rather than crashing the app.

## Testing

```bash
npx vitest run
```

Unit tests cover the conjugation engine (regular endings, orthographic
adjustments, stem-changes, irregular overrides), the spaced-repetition
scheduler (box progression, due-card weighting, fallback behavior), and the
answer-comparison logic (exact match, accent-only mismatch, wrong answer).

The UI has also been manually smoke-tested end-to-end (question generation,
answer feedback, score/streak/due-count updates, tense filtering, and
progress reset) against a production build.

## Deployment

This is a static single-page app (Vite + React), so it's deployed to
**GitHub Pages** directly from this repository — no server or database to
run.

- `.github/workflows/deploy.yml` builds the app (setting Vite's `base` to
  `/<repo-name>/`, which is what a GitHub Pages *project* site requires) and
  publishes `dist/` using GitHub's official `actions/deploy-pages` flow. It
  runs on every push to `main` and can also be triggered manually
  (Actions → "Deploy to GitHub Pages" → Run workflow).
- `.github/workflows/ci.yml` runs lint, type-checking, the unit test suite,
  and a production build on every push and pull request.

### One-time repository setup

In the repository's **Settings → Pages**, set "Build and deployment → Source"
to **GitHub Actions**. After that, every push to `main` (or a manual dispatch
of the deploy workflow) publishes the latest build to
`https://<owner>.github.io/<repo-name>/`.

### Deploying elsewhere

Because it's a plain static build (`npm run build` → `dist/`), the app can
just as easily be deployed to any static host (Netlify, Vercel, Cloudflare
Pages, S3 + CloudFront, etc.) by pointing the host at the build command
`npm run build` and the output directory `dist`. If the host serves the app
from a subpath rather than the domain root, set `VITE_BASE_PATH` accordingly
before building (see `vite.config.ts`); most hosts (Netlify, Vercel) serve
from the root and need no extra configuration.
