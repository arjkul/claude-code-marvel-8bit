import { expect, mock, test } from 'claude-code/testing'

import { HEROES, SIZE, findHero, toCells, toCycleSvg, toSvg } from './sprites'

const SPINNER = {
  plugin: 'marvel-8bit',
  component: 'Spinner',
  props: { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' },
} as const

const hero = (args: string) => ({
  command: 'hero',
  args,
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 80 },
} as const)

test('every sprite is a full grid of known colours', () => {
  for (const hero of HEROES) {
    expect(hero.rows).toHaveLength(SIZE)
    for (const row of hero.rows) {
      expect(row).toHaveLength(SIZE)
      for (const letter of row) {
        expect(letter === '.' || hero.palette[letter] !== undefined).toBe(true)
      }
    }
    expect(toSvg(hero)).toContain('<rect')
    expect(toCells(hero)).toHaveLength(SIZE * (SIZE / 2) * 3)
  }
})

test('a hero is found by a loose name', () => {
  expect(findHero('thor')?.id).toBe('thor')
  expect(findHero('Iron Man')?.id).toBe('iron-man')
  expect(findHero('spider')?.id).toBe('spider-man')
  expect(findHero('panther')?.id).toBe('black-panther')
  expect(findHero('batman')).toBeUndefined()
})

test('the spinner draws a hero on the terminal and the desktop', async ($, on) => {
  mock.store(on)

  const terminal = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  expect(await terminal.find({ type: 'Raster' })).toBeDefined()
  expect(await terminal.find({ type: 'Text', text: 'Sauteing…' })).toBeDefined()
  await terminal.unmount()

  const desktop = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect((await desktop.find({ type: 'Svg' }))?.props.alt).toBe('Marvel heroes')
  await desktop.unmount()
})

test('/hero pins a hero and shuffle lets go of it', async ($, on) => {
  mock.store(on)

  const pin = await $.command.run(hero('thor'))
  expect(pin.text).toContain('Thor')

  const pinned = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect((await pinned.find({ type: 'Svg' }))?.props.alt).toBe('Thor')
  await pinned.unmount()

  const miss = await $.command.run(hero('batman'))
  expect(miss.text).toContain('No hero matches')

  await $.command.run(hero('shuffle'))
  const shuffled = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect((await shuffled.find({ type: 'Svg' }))?.props.alt).toBe('Marvel heroes')
  await shuffled.unmount()
})

test('the shuffling mark holds every hero and keeps one tree through a turn', async ($, on) => {
  mock.store(on)
  on('turn.start', (_, e) => ({ turnId: e.turnId }))

  const cycle = toCycleSvg(3)
  expect(cycle.match(/<g opacity=/g)).toHaveLength(HEROES.length)
  expect(cycle.match(/<g opacity="1">/g)).toHaveLength(1)

  const source = async (word: string) => {
    const ui = await $.ui.mount({
      ...SPINNER,
      surface: 'desktop',
      props: { ...SPINNER.props, word },
    })
    const found = await ui.find({ type: 'Svg' })
    expect(await ui.find({ type: 'Text' })).toBeUndefined()
    await ui.unmount()

    return found?.props.source
  }

  await $.turn.start({ text: 'hi', turnId: 't1' })
  expect(await source('Working')).toBe(toCycleSvg(1))
  expect(await source('Running a command')).toBe(toCycleSvg(1))
})

test('a running tool row carries the hero on the desktop and is left alone once done', async ($, on) => {
  mock.store(on)
  on('ui.render', { component: 'ToolUse' }, () => ({ type: 'Box', props: {}, children: [] }) as never)

  const row = (isRunning: boolean) =>
    ({
      plugin: 'marvel-8bit',
      surface: 'desktop',
      component: 'ToolUse',
      props: {
        tool_use_id: 't1',
        tool: 'Bash',
        input: { command: 'sleep 20', description: 'Waiting 20 seconds' },
        isRunning,
        isErrored: false,
        isInterrupted: false,
      },
    }) as const

  const running = await $.ui.mount(row(true))
  expect((await running.find({ type: 'Svg' }))?.props.alt).toBe('Marvel heroes')
  expect(await running.find({ type: 'Text', text: 'Waiting 20 seconds' })).toBeDefined()
  await running.unmount()

  const done = await $.ui.mount(row(false))
  expect(await done.find({ type: 'Svg' })).toBeUndefined()
  await done.unmount()
})
