import { describe, expect, it } from 'vitest'
import { conjugate } from './conjugate'
import { VERBS } from './verbs'
import type { Verb } from './types'

function verb(infinitive: string): Verb {
  const found = VERBS.find((v) => v.infinitive === infinitive)
  if (!found) throw new Error(`fixture verb not found: ${infinitive}`)
  return found
}

describe('regular -ar/-er/-ir present tense', () => {
  it('conjugates hablar (regular -ar)', () => {
    const v = verb('hablar')
    expect(conjugate(v, 'present', 'yo')).toBe('hablo')
    expect(conjugate(v, 'present', 'tu')).toBe('hablas')
    expect(conjugate(v, 'present', 'el')).toBe('habla')
    expect(conjugate(v, 'present', 'nosotros')).toBe('hablamos')
    expect(conjugate(v, 'present', 'vosotros')).toBe('habláis')
    expect(conjugate(v, 'present', 'ellos')).toBe('hablan')
  })

  it('conjugates comer (regular -er)', () => {
    const v = verb('comer')
    expect(conjugate(v, 'present', 'yo')).toBe('como')
    expect(conjugate(v, 'present', 'nosotros')).toBe('comemos')
  })

  it('conjugates vivir (regular -ir)', () => {
    const v = verb('vivir')
    expect(conjugate(v, 'present', 'yo')).toBe('vivo')
    expect(conjugate(v, 'present', 'vosotros')).toBe('vivís')
  })
})

describe('regular preterite', () => {
  it('conjugates hablar in the preterite', () => {
    const v = verb('hablar')
    expect(conjugate(v, 'preterite', 'yo')).toBe('hablé')
    expect(conjugate(v, 'preterite', 'el')).toBe('habló')
    expect(conjugate(v, 'preterite', 'ellos')).toBe('hablaron')
  })

  it('conjugates comer/vivir in the preterite with shared -er/-ir endings', () => {
    expect(conjugate(verb('comer'), 'preterite', 'yo')).toBe('comí')
    expect(conjugate(verb('vivir'), 'preterite', 'nosotros')).toBe('vivimos')
  })
})

describe('orthographic spelling-change rules', () => {
  it('adjusts -car/-gar/-zar verbs only in the yo-preterite', () => {
    expect(conjugate(verb('buscar'), 'preterite', 'yo')).toBe('busqué')
    expect(conjugate(verb('llegar'), 'preterite', 'yo')).toBe('llegué')
    expect(conjugate(verb('empezar'), 'preterite', 'yo')).toBe('empecé')
    // other persons are unaffected by the orthographic rule
    expect(conjugate(verb('buscar'), 'preterite', 'tu')).toBe('buscaste')
  })

  it('swaps i->y in the 3rd-person preterite when the stem ends in a vowel', () => {
    expect(conjugate(verb('leer'), 'preterite', 'el')).toBe('leyó')
    expect(conjugate(verb('leer'), 'preterite', 'ellos')).toBe('leyeron')
    expect(conjugate(verb('leer'), 'preterite', 'yo')).toBe('leí')
  })
})

describe('stem-changing (boot) verbs', () => {
  it('applies e:ie only to boot forms in the present tense', () => {
    const v = verb('pensar')
    expect(conjugate(v, 'present', 'yo')).toBe('pienso')
    expect(conjugate(v, 'present', 'tu')).toBe('piensas')
    expect(conjugate(v, 'present', 'el')).toBe('piensa')
    expect(conjugate(v, 'present', 'ellos')).toBe('piensan')
    expect(conjugate(v, 'present', 'nosotros')).toBe('pensamos')
    expect(conjugate(v, 'present', 'vosotros')).toBe('pensáis')
  })

  it('applies o:ue to volver/poder', () => {
    expect(conjugate(verb('volver'), 'present', 'yo')).toBe('vuelvo')
    expect(conjugate(verb('poder'), 'present', 'nosotros')).toBe('podemos')
  })

  it('does not stem-change -ar/-er verbs in the preterite', () => {
    expect(conjugate(verb('pensar'), 'preterite', 'el')).toBe('pensó')
    expect(conjugate(verb('volver'), 'preterite', 'ellos')).toBe('volvieron')
  })

  it('reduces the vowel for -ir stem-changers in the 3rd-person preterite only', () => {
    expect(conjugate(verb('pedir'), 'preterite', 'el')).toBe('pidió')
    expect(conjugate(verb('pedir'), 'preterite', 'ellos')).toBe('pidieron')
    expect(conjugate(verb('pedir'), 'preterite', 'yo')).toBe('pedí')
    expect(conjugate(verb('dormir'), 'preterite', 'el')).toBe('durmió')
    expect(conjugate(verb('sentir'), 'preterite', 'ellos')).toBe('sintieron')
  })

  it('applies the irregular yo override on top of the stem change (dormir)', () => {
    expect(conjugate(verb('dormir'), 'present', 'yo')).toBe('duermo')
  })
})

describe('fully irregular verbs via the lookup table', () => {
  it('conjugates ser completely from the override table', () => {
    const v = verb('ser')
    expect(conjugate(v, 'present', 'yo')).toBe('soy')
    expect(conjugate(v, 'preterite', 'nosotros')).toBe('fuimos')
  })

  it('conjugates tener with a partial override plus regular endings', () => {
    const v = verb('tener')
    expect(conjugate(v, 'present', 'yo')).toBe('tengo')
    // tú/él/etc still get the regular e:ie stem-change applied programmatically
    expect(conjugate(v, 'present', 'tu')).toBe('tienes')
    expect(conjugate(v, 'preterite', 'yo')).toBe('tuve')
  })

  it('conjugates every verb in the data set without throwing', () => {
    for (const v of VERBS) {
      for (const tense of ['present', 'preterite'] as const) {
        for (const pronoun of ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'] as const) {
          expect(typeof conjugate(v, tense, pronoun)).toBe('string')
        }
      }
    }
  })
})
