export type VerbEnding = 'ar' | 'er' | 'ir'

export type Tense = 'present' | 'preterite'

export type Pronoun = 'yo' | 'tu' | 'el' | 'nosotros' | 'vosotros' | 'ellos'

export const PRONOUNS: Pronoun[] = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos']

export const PRONOUN_LABEL: Record<Pronoun, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él / ella / usted',
  nosotros: 'nosotros/as',
  vosotros: 'vosotros/as',
  ellos: 'ellos/ellas/ustedes',
}

export const TENSE_LABEL: Record<Tense, string> = {
  present: 'present indicative',
  preterite: 'preterite (simple past)',
}

/** A vowel alternation applied to the last stressed syllable of the stem. */
export type StemChange = 'e:ie' | 'o:ue' | 'e:i' | 'u:ue'

/**
 * Sparse override table: only the forms that deviate from the regular
 * (or stem-changed) rule need an entry. Anything absent falls through to
 * the programmatic conjugation engine.
 */
export type IrregularOverrides = Partial<Record<Tense, Partial<Record<Pronoun, string>>>>

export interface Verb {
  infinitive: string
  translation: string
  ending: VerbEnding
  /** Boot-pattern vowel change applied to stressed forms, if any. */
  stemChange?: StemChange
  /** Whole-verb or per-form irregular lookup overrides. */
  irregular?: IrregularOverrides
}

export interface Question {
  verb: Verb
  tense: Tense
  pronoun: Pronoun
  answer: string
}
