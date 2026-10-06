export type HeroId =
  | 'iron-man'
  | 'captain-america'
  | 'spider-man'
  | 'hulk'
  | 'thor'
  | 'black-panther'
  | 'wolverine'
  | 'deadpool'

declare module 'claude-code' {
  interface PluginState {
    'marvel-8bit': { turn: number; pinned: HeroId | null }
  }
}
