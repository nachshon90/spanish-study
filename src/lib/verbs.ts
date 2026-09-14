import type { Verb } from './types'

/**
 * Verb data: each entry only supplies the *facts* about a verb (its ending,
 * any stem-change pattern, and — for truly irregular verbs — a sparse table
 * of the forms that can't be derived by rule). No conjugated question/answer
 * pairs live here; every quiz answer is computed at runtime by
 * `src/lib/conjugate.ts`.
 */
export const VERBS: Verb[] = [
  // --- Fully regular -ar/-er/-ir verbs -------------------------------------
  { infinitive: 'hablar', translation: 'to speak', ending: 'ar' },
  { infinitive: 'caminar', translation: 'to walk', ending: 'ar' },
  { infinitive: 'trabajar', translation: 'to work', ending: 'ar' },
  { infinitive: 'estudiar', translation: 'to study', ending: 'ar' },
  { infinitive: 'comprar', translation: 'to buy', ending: 'ar' },
  { infinitive: 'mirar', translation: 'to look at / watch', ending: 'ar' },
  { infinitive: 'llamar', translation: 'to call', ending: 'ar' },
  { infinitive: 'comer', translation: 'to eat', ending: 'er' },
  { infinitive: 'beber', translation: 'to drink', ending: 'er' },
  { infinitive: 'aprender', translation: 'to learn', ending: 'er' },
  { infinitive: 'correr', translation: 'to run', ending: 'er' },
  { infinitive: 'vender', translation: 'to sell', ending: 'er' },
  { infinitive: 'vivir', translation: 'to live', ending: 'ir' },
  { infinitive: 'escribir', translation: 'to write', ending: 'ir' },
  { infinitive: 'abrir', translation: 'to open', ending: 'ir' },
  { infinitive: 'decidir', translation: 'to decide', ending: 'ir' },
  { infinitive: 'compartir', translation: 'to share', ending: 'ir' },

  // --- Orthographic-spelling-change verbs (still "regular" by rule) -------
  { infinitive: 'buscar', translation: 'to look for', ending: 'ar' },
  { infinitive: 'tocar', translation: 'to touch / play (an instrument)', ending: 'ar' },
  { infinitive: 'sacar', translation: 'to take out', ending: 'ar' },
  { infinitive: 'llegar', translation: 'to arrive', ending: 'ar' },
  { infinitive: 'jugar', translation: 'to play', ending: 'ar', stemChange: 'u:ue' },
  { infinitive: 'pagar', translation: 'to pay', ending: 'ar' },
  { infinitive: 'empezar', translation: 'to begin', ending: 'ar', stemChange: 'e:ie' },
  { infinitive: 'almorzar', translation: 'to eat lunch', ending: 'ar', stemChange: 'o:ue' },
  { infinitive: 'leer', translation: 'to read', ending: 'er' },
  { infinitive: 'creer', translation: 'to believe', ending: 'er' },

  // --- Stem-changing (boot) verbs ------------------------------------------
  { infinitive: 'pensar', translation: 'to think', ending: 'ar', stemChange: 'e:ie' },
  { infinitive: 'cerrar', translation: 'to close', ending: 'ar', stemChange: 'e:ie' },
  { infinitive: 'perder', translation: 'to lose', ending: 'er', stemChange: 'e:ie' },
  { infinitive: 'entender', translation: 'to understand', ending: 'er', stemChange: 'e:ie' },
  { infinitive: 'querer', translation: 'to want / love', ending: 'er', stemChange: 'e:ie' },
  { infinitive: 'volver', translation: 'to return', ending: 'er', stemChange: 'o:ue' },
  { infinitive: 'poder', translation: 'to be able to / can', ending: 'er', stemChange: 'o:ue' },
  { infinitive: 'contar', translation: 'to count / tell', ending: 'ar', stemChange: 'o:ue' },
  { infinitive: 'encontrar', translation: 'to find', ending: 'ar', stemChange: 'o:ue' },
  { infinitive: 'recordar', translation: 'to remember', ending: 'ar', stemChange: 'o:ue' },
  {
    infinitive: 'dormir',
    translation: 'to sleep',
    ending: 'ir',
    stemChange: 'o:ue',
    irregular: { present: { yo: 'duermo' } },
  },
  { infinitive: 'pedir', translation: 'to ask for', ending: 'ir', stemChange: 'e:i' },
  { infinitive: 'servir', translation: 'to serve', ending: 'ir', stemChange: 'e:i' },
  { infinitive: 'repetir', translation: 'to repeat', ending: 'ir', stemChange: 'e:i' },
  { infinitive: 'sentir', translation: 'to feel', ending: 'ir', stemChange: 'e:ie' },
  { infinitive: 'preferir', translation: 'to prefer', ending: 'ir', stemChange: 'e:ie' },

  // --- Fully irregular verbs (sparse override table) -----------------------
  {
    infinitive: 'ser',
    translation: 'to be',
    ending: 'er',
    irregular: {
      present: { yo: 'soy', tu: 'eres', el: 'es', nosotros: 'somos', vosotros: 'sois', ellos: 'son' },
      preterite: { yo: 'fui', tu: 'fuiste', el: 'fue', nosotros: 'fuimos', vosotros: 'fuisteis', ellos: 'fueron' },
    },
  },
  {
    infinitive: 'estar',
    translation: 'to be (state/location)',
    ending: 'ar',
    irregular: {
      present: { yo: 'estoy', tu: 'estás', el: 'está', nosotros: 'estamos', vosotros: 'estáis', ellos: 'están' },
      preterite: { yo: 'estuve', tu: 'estuviste', el: 'estuvo', nosotros: 'estuvimos', vosotros: 'estuvisteis', ellos: 'estuvieron' },
    },
  },
  {
    infinitive: 'ir',
    translation: 'to go',
    ending: 'ir',
    irregular: {
      present: { yo: 'voy', tu: 'vas', el: 'va', nosotros: 'vamos', vosotros: 'vais', ellos: 'van' },
      preterite: { yo: 'fui', tu: 'fuiste', el: 'fue', nosotros: 'fuimos', vosotros: 'fuisteis', ellos: 'fueron' },
    },
  },
  {
    infinitive: 'tener',
    translation: 'to have',
    ending: 'er',
    stemChange: 'e:ie',
    irregular: {
      present: { yo: 'tengo' },
      preterite: { yo: 'tuve', tu: 'tuviste', el: 'tuvo', nosotros: 'tuvimos', vosotros: 'tuvisteis', ellos: 'tuvieron' },
    },
  },
  {
    infinitive: 'hacer',
    translation: 'to do / make',
    ending: 'er',
    irregular: {
      present: { yo: 'hago' },
      preterite: { yo: 'hice', tu: 'hiciste', el: 'hizo', nosotros: 'hicimos', vosotros: 'hicisteis', ellos: 'hicieron' },
    },
  },
  {
    infinitive: 'decir',
    translation: 'to say / tell',
    ending: 'ir',
    stemChange: 'e:i',
    irregular: {
      present: { yo: 'digo' },
      preterite: { yo: 'dije', tu: 'dijiste', el: 'dijo', nosotros: 'dijimos', vosotros: 'dijisteis', ellos: 'dijeron' },
    },
  },
  {
    infinitive: 'venir',
    translation: 'to come',
    ending: 'ir',
    stemChange: 'e:ie',
    irregular: {
      present: { yo: 'vengo' },
      preterite: { yo: 'vine', tu: 'viniste', el: 'vino', nosotros: 'vinimos', vosotros: 'vinisteis', ellos: 'vinieron' },
    },
  },
  {
    infinitive: 'poner',
    translation: 'to put',
    ending: 'er',
    irregular: {
      present: { yo: 'pongo' },
      preterite: { yo: 'puse', tu: 'pusiste', el: 'puso', nosotros: 'pusimos', vosotros: 'pusisteis', ellos: 'pusieron' },
    },
  },
  {
    infinitive: 'saber',
    translation: 'to know (facts)',
    ending: 'er',
    irregular: {
      present: { yo: 'sé' },
      preterite: { yo: 'supe', tu: 'supiste', el: 'supo', nosotros: 'supimos', vosotros: 'supisteis', ellos: 'supieron' },
    },
  },
  {
    infinitive: 'dar',
    translation: 'to give',
    ending: 'ar',
    irregular: {
      present: { yo: 'doy' },
      preterite: { yo: 'di', tu: 'diste', el: 'dio', nosotros: 'dimos', vosotros: 'disteis', ellos: 'dieron' },
    },
  },
  {
    infinitive: 'ver',
    translation: 'to see',
    ending: 'er',
    irregular: {
      present: { yo: 'veo' },
      preterite: { yo: 'vi', tu: 'viste', el: 'vio', nosotros: 'vimos', vosotros: 'visteis', ellos: 'vieron' },
    },
  },
  {
    infinitive: 'oír',
    translation: 'to hear',
    ending: 'ir',
    irregular: {
      present: { yo: 'oigo', tu: 'oyes', el: 'oye', nosotros: 'oímos', vosotros: 'oís', ellos: 'oyen' },
      preterite: { el: 'oyó', ellos: 'oyeron' },
    },
  },
]
