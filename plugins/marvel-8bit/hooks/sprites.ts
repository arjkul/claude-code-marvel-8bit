import type { HeroId } from '../types'

export const SIZE = 12

export type Hero = {
  id: HeroId
  name: string
  // One letter per pixel, SIZE rows of SIZE; '.' is transparent, 'W' the eyes.
  rows: readonly string[]
  palette: Readonly<Record<string, number>>
}

const WHITE = 0xffffff
const BLACK = 0x15151c
const SKIN = 0xf2c193

export const HEROES: readonly Hero[] = [
  {
    id: 'iron-man',
    name: 'Iron Man',
    palette: { R: 0xb3171e, Y: 0xf2c230, W: 0x9fe8ff, K: BLACK },
    rows: [
      '...RRRRRR...',
      '..RRRRRRRR..',
      '.RRRYYYYRRR.',
      '.RRYYYYYYRR.',
      '.RYYYYYYYYR.',
      '.RYWWYYWWYR.',
      '.RYYYYYYYYR.',
      '.RRYYYYYYRR.',
      '.RRYYKKYYRR.',
      '..RYYYYYYR..',
      '..RRYYYYRR..',
      '...RRRRRR...',
    ],
  },
  {
    id: 'captain-america',
    name: 'Captain America',
    palette: { B: 0x1f4fa8, A: WHITE, W: WHITE, S: SKIN, K: BLACK },
    rows: [
      '...BBBBBB...',
      '..BBBBBBBB..',
      '.BBBBAABBBB.',
      '.BBBABBABBB.',
      'ABBBAAAABBBA',
      '.BBBABBABBB.',
      '.BWWBBBBWWB.',
      '.BSSSSSSSSB.',
      '.BSSSSSSSSB.',
      '..SSSKKSSS..',
      '..SSSSSSSS..',
      '...SSSSSS...',
    ],
  },
  {
    id: 'spider-man',
    name: 'Spider-Man',
    palette: { R: 0xd81f26, K: BLACK, W: WHITE },
    rows: [
      '...RRRRRR...',
      '..RRRRRRRR..',
      '.RRRRRRRRRR.',
      '.RKKKRRKKKR.',
      '.RKWWKKWWKR.',
      '.RRKWKKWKRR.',
      '.RRRKRRKRRR.',
      '.RRRRRRRRRR.',
      '..RRRRRRRR..',
      '..RRRRRRRR..',
      '...RRRRRR...',
      '....RRRR....',
    ],
  },
  {
    id: 'hulk',
    name: 'Hulk',
    palette: { G: 0x5cb83a, D: 0x1f4d1a, W: WHITE, K: BLACK },
    rows: [
      '..DDDDDDDD..',
      '.DDDDDDDDDD.',
      '.DDGGGGGGDD.',
      '.DGGGGGGGGD.',
      '.GDDDGGDDDG.',
      '.GGWKGGKWGG.',
      '.GGGGGGGGGG.',
      '.GGGGDDGGGG.',
      '.GGKKKKKKGG.',
      '.GGGGGGGGGG.',
      '..GGGGGGGG..',
      '...GGGGGG...',
    ],
  },
  {
    id: 'thor',
    name: 'Thor',
    palette: { H: 0xaab4c4, A: WHITE, Y: 0xf0cf5a, S: SKIN, W: 0x3f8fe0, K: BLACK },
    rows: [
      'A..HHHHHH..A',
      'AA.HHHHHH.AA',
      '.AHHHHHHHHA.',
      '..HHHHHHHH..',
      '.YHSSSSSSHY.',
      '.YSSSSSSSSY.',
      '.YSWSSSSWSY.',
      '.YSSSSSSSSY.',
      '.YSYYYYYYSY.',
      '.YYYYKKYYYY.',
      '..YYYYYYYY..',
      '...YYYYYY...',
    ],
  },
  {
    id: 'black-panther',
    name: 'Black Panther',
    palette: { P: 0x3a3a52, L: 0xb9c0d4, V: 0x8f5cf0, W: WHITE },
    rows: [
      '.PP......PP.',
      '.PPP....PPP.',
      '.PPPPPPPPPP.',
      '.PPPPPPPPPP.',
      '.PPPPPPPPPP.',
      '.PWWPPPPWWP.',
      '.PPWPPPPWPP.',
      '.PPPPLLPPPP.',
      '.PLPPPPPPLP.',
      '..PLLPPLLP..',
      '..PPVVVVPP..',
      '...PPPPPP...',
    ],
  },
  {
    id: 'wolverine',
    name: 'Wolverine',
    palette: { Y: 0xf5d21f, K: BLACK, W: WHITE, S: SKIN },
    rows: [
      'K..........K',
      'KK........KK',
      'KKY......YKK',
      'KKYYYYYYYYKK',
      '.KKYYYYYYKK.',
      '.YKKKYYKKKY.',
      '.YKWWYYWWKY.',
      '.YYKKYYKKYY.',
      '.YYSSSSSSYY.',
      '..YSSKKSSY..',
      '..YSSSSSSY..',
      '...SSSSSS...',
    ],
  },
  {
    id: 'deadpool',
    name: 'Deadpool',
    palette: { R: 0x9c1218, K: BLACK, W: WHITE },
    rows: [
      '...RRRRRR...',
      '..RRRRRRRR..',
      '.RRRRRRRRRR.',
      '.RKKRRRRKKR.',
      '.RKKKRRKKKR.',
      '.RKWKRRKWKR.',
      '.RKWKRRKWKR.',
      '.RKKKRRKKKR.',
      '.RRKKRRKKRR.',
      '..RRRRRRRR..',
      '..RRRRRRRR..',
      '...RRRRRR...',
    ],
  },
]

const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

// One <rect> per horizontal run of a colour; the eyes sit in a group that
// blinks, so the mark still reads as working.
export function toSvg(hero: Hero): string {
  const body: string[] = []
  const eyes: string[] = []

  hero.rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const letter = row[x]!
      let end = x + 1
      while (end < row.length && row[end] === letter) {
        end += 1
      }
      const color = hero.palette[letter]
      if (color !== undefined) {
        const rect = `<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${hex(color)}"/>`
        ;(letter === 'W' ? eyes : body).push(rect)
      }
      x = end
    }
  })

  const blink =
    '<animate attributeName="opacity" values="1;0;1" keyTimes="0;0.86;0.94" calcMode="discrete" dur="1.6s" repeatCount="indefinite"/>'

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">` +
    body.join('') +
    `<g>${blink}${eyes.join('')}</g>` +
    '</svg>'
  )
}

export const CYCLE_SECONDS = 20

// Every hero in one document, each shown for its slice of the cycle from
// `start` on: the drawing shuffles by itself, so its tree never changes. The
// first is visible without the animation, where a surface draws it still.
export function toCycleSvg(start: number): string {
  const count = HEROES.length
  const groups = HEROES.map((_, i) => {
    const hero = HEROES[(start + i) % count]!
    const svg = toSvg(hero)
    const rects = svg.slice(svg.indexOf('>') + 1, -'</svg>'.length)
    const [from, to] = [i / count, (i + 1) / count]
    const frames =
      i === 0
        ? `values="1;0" keyTimes="0;${to}"`
        : to === 1
          ? `values="0;1" keyTimes="0;${from}"`
          : `values="0;1;0" keyTimes="0;${from};${to}"`

    return (
      `<g opacity="${i === 0 ? 1 : 0}">` +
      `<animate attributeName="opacity" ${frames} calcMode="discrete" dur="${CYCLE_SECONDS}s" repeatCount="indefinite"/>` +
      `${rects}</g>`
    )
  })

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">` +
    groups.join('') +
    '</svg>'
  )
}

const DEFAULT = 0x01000000
const UPPER_HALF = 0x2580
const LOWER_HALF = 0x2584
const SPACE = 0x20

// Two pixel rows per terminal row through half blocks: SIZE columns by
// SIZE / 2 rows of [codePoint, foreground, background], as RasterProps packs.
export function toCells(hero: Hero): Uint32Array {
  const words = new Uint32Array(SIZE * (SIZE / 2) * 3)
  let at = 0

  for (let y = 0; y < SIZE; y += 2) {
    for (let x = 0; x < SIZE; x += 1) {
      const top = hero.palette[hero.rows[y]![x]!]
      const bottom = hero.palette[hero.rows[y + 1]![x]!]

      if (top !== undefined) {
        words.set([UPPER_HALF, top, bottom ?? DEFAULT], at)
      } else if (bottom !== undefined) {
        words.set([LOWER_HALF, bottom, DEFAULT], at)
      } else {
        words.set([SPACE, DEFAULT, DEFAULT], at)
      }
      at += 3
    }
  }

  return words
}

const fold = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '')

// `thor`, `Iron Man`, `spider`, `cap`: the first hero whose name starts with
// or holds what was typed.
export function findHero(query: string): Hero | undefined {
  const wanted = fold(query)
  if (wanted === '') {
    return undefined
  }

  return (
    HEROES.find(hero => fold(hero.name).startsWith(wanted)) ??
    HEROES.find(hero => fold(hero.name).includes(wanted))
  )
}
