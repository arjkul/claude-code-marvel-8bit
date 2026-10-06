import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { HeroId } from '../types'
import { HEROES, SIZE, findHero, toCells, toCycleSvg, toSvg } from './sprites'

const turn = atom({ plugin: 'marvel-8bit', key: 'turn' } as const, 0)
const pinned = atom({ plugin: 'marvel-8bit', key: 'pinned' } as const, null)

const STORE_KEY = 'pinned'
const ROSTER = HEROES.map(hero => hero.name).join(', ')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'hero',
      description: 'Pin an 8-bit Marvel hero as the working mark, or shuffle',
    })

    const stored = await $.store.get(STORE_KEY)
    const hero = HEROES.find(one => one.id === stored)
    if (hero) {
      await update($, pinned, () => hero.id)
    }

    return next(e)
  })

  // Each turn opens on the next hero; a pinned hero ignores the count.
  on('turn.start', async ($, e, next) => {
    await update($, turn, n => n + 1)

    return next(e)
  })

  on('command.run', { command: 'hero' }, async ($, e) => {
    const args = e.args.trim()

    if (args === '') {
      const id = await read($, pinned)
      const now = HEROES.find(one => one.id === id)

      return {
        text: `${now ? `Pinned: ${now.name}.` : 'Shuffling through the heroes.'} Use /hero <name> or /hero shuffle. Heroes: ${ROSTER}.`,
      }
    }

    if (args.toLowerCase() === 'shuffle') {
      await update($, pinned, () => null)
      await $.store.delete(STORE_KEY)

      return { text: 'Shuffling through the heroes.' }
    }

    const hero = findHero(args)
    if (!hero) {
      return { text: `No hero matches "${args}". Heroes: ${ROSTER}.` }
    }

    const id: HeroId = hero.id
    await update($, pinned, () => id)
    await $.store.set(STORE_KEY, id)

    return { text: `Pinned: ${hero.name}.` }
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const id = await read($, pinned)
    const first = (await read($, turn)) % HEROES.length
    const pin = HEROES.find(one => one.id === id)

    if (e.surface === 'terminal') {
      const { Box, Raster, Text } = $.ui.resolve(e)
      const bytes = new Uint8Array(toCells(pin ?? HEROES[first]!).buffer)
      const cells = btoa(String.fromCharCode(...bytes))
      const label = `${e.props.message ?? e.props.word}${e.props.suffix}`

      return (
        <Box flexDirection="row" alignItems="flex-end">
          <Raster key="hero" columns={SIZE} rows={SIZE / 2} cells={cells} />
          <Text> {label}</Text>
        </Box>
      )
    }

    if (e.surface === 'desktop') {
      const { Box, Svg } = $.ui.resolve(e)

      // The mark alone, the same tree through the whole turn: the desktop
      // goes back to its own mark once the row's tree changes under it.
      return (
        <Box flexDirection="row" alignItems="center">
          <Svg
            source={pin ? toSvg(pin) : toCycleSvg(first)}
            alt={pin ? pin.name : 'Marvel heroes'}
            width={24}
            height={24}
          />
        </Box>
      )
    }

    return next(e)
  })

  // On the desktop a running tool call's row stands where the spinner was,
  // under a mark of its own: the hero takes that too, until the call ends.
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    if (e.surface !== 'desktop' || !e.props.isRunning) {
      return next(e)
    }

    const id = await read($, pinned)
    const first = (await read($, turn)) % HEROES.length
    const pin = HEROES.find(one => one.id === id)
    const { input, tool } = e.props
    const said =
      typeof input === 'object' && input !== null && 'description' in input
        ? input.description
        : undefined
    const { Box, Svg, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" alignItems="center">
        <Svg
          source={pin ? toSvg(pin) : toCycleSvg(first)}
          alt={pin ? pin.name : 'Marvel heroes'}
          width={24}
          height={24}
        />
        <Text dimColor> {typeof said === 'string' ? said : tool}</Text>
      </Box>
    )
  })
}
