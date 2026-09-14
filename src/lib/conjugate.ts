import type { Pronoun, StemChange, Tense, Verb } from './types'

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

const PRESENT_ENDINGS: Record<Verb['ending'], Record<Pronoun, string>> = {
  ar: { yo: 'o', tu: 'as', el: 'a', nosotros: 'amos', vosotros: 'áis', ellos: 'an' },
  er: { yo: 'o', tu: 'es', el: 'e', nosotros: 'emos', vosotros: 'éis', ellos: 'en' },
  ir: { yo: 'o', tu: 'es', el: 'e', nosotros: 'imos', vosotros: 'ís', ellos: 'en' },
}

const PRETERITE_ENDINGS: Record<Verb['ending'], Record<Pronoun, string>> = {
  ar: { yo: 'é', tu: 'aste', el: 'ó', nosotros: 'amos', vosotros: 'asteis', ellos: 'aron' },
  er: { yo: 'í', tu: 'iste', el: 'ió', nosotros: 'imos', vosotros: 'isteis', ellos: 'ieron' },
  ir: { yo: 'í', tu: 'iste', el: 'ió', nosotros: 'imos', vosotros: 'isteis', ellos: 'ieron' },
}

/** Pronouns whose stem sits in the stressed "boot" and takes the vowel change. */
const BOOT_PRONOUNS = new Set<Pronoun>(['yo', 'tu', 'el', 'ellos'])

function getStem(infinitive: string): string {
  return infinitive.slice(0, -2)
}

/** Replaces the last occurrence of the target vowel in the stem with its alternation. */
function applyStemChange(stem: string, change: StemChange): string {
  const [from, to] = change.split(':')
  const idx = stem.lastIndexOf(from)
  if (idx === -1) return stem
  return stem.slice(0, idx) + to + stem.slice(idx + from.length)
}

/**
 * -car/-gar/-zar verbs need a spelling adjustment in the yo-preterite so the
 * hard consonant sound is preserved in front of "é" (busqué, llegué, empecé).
 */
function applyPreteriteYoOrthography(stem: string, ending: Verb['ending']): string {
  if (ending !== 'ar') return stem
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu'
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'gu'
  if (stem.endsWith('z')) return stem.slice(0, -1) + 'c'
  return stem
}

/**
 * -er/-ir verbs whose stem ends in a vowel get an i-to-y swap in the 3rd
 * person preterite to avoid an illegal vowel hiatus (leyó, leyeron; not "leió").
 */
function applyThirdPersonYSwap(ending: string, ending2: Verb['ending']): string {
  if (ending2 === 'ar') return ending
  return ending.replace(/^i/, 'y')
}

function conjugateRegular(verb: Verb, tense: Tense, pronoun: Pronoun): string {
  let stem = getStem(verb.infinitive)
  const endingTable = tense === 'present' ? PRESENT_ENDINGS : PRETERITE_ENDINGS
  let suffix = endingTable[verb.ending][pronoun]

  if (tense === 'preterite' && pronoun === 'yo') {
    stem = applyPreteriteYoOrthography(stem, verb.ending)
  }

  if (tense === 'preterite' && (pronoun === 'el' || pronoun === 'ellos')) {
    const lastChar = stem.slice(-1)
    if (VOWELS.has(lastChar)) {
      suffix = applyThirdPersonYSwap(suffix, verb.ending)
    }
  }

  if (verb.stemChange && tense === 'present' && BOOT_PRONOUNS.has(pronoun)) {
    stem = applyStemChange(stem, verb.stemChange)
  }

  // -ir stem-changing verbs also reduce the vowel in the 3rd-person preterite
  // (pedir -> pidió/pidieron, dormir -> durmió/durmieron), using a single-step
  // reduction (e->i, o->u) regardless of the present-tense alternation.
  if (verb.stemChange && verb.ending === 'ir' && tense === 'preterite' && (pronoun === 'el' || pronoun === 'ellos')) {
    const reduced = verb.stemChange.startsWith('o') ? 'o:u' : 'e:i'
    stem = applyStemChange(stem, reduced as StemChange)
  }

  return stem + suffix
}

/**
 * Conjugates a verb for a given tense/pronoun. Regular endings and the
 * generic spelling/stem-change rules are computed programmatically; the
 * verb's `irregular` lookup table is consulted last and, when it has an
 * entry for this exact tense/pronoun, wins outright.
 */
export function conjugate(verb: Verb, tense: Tense, pronoun: Pronoun): string {
  const override = verb.irregular?.[tense]?.[pronoun]
  if (override) return override
  return conjugateRegular(verb, tense, pronoun)
}
