import { Game } from '../game'
import { FighterSummary } from './fighterSummary'

export class GameSummary {
  fighters: FighterSummary[]

  constructor (game: Game) {
    const fighters = [...game.fighters.values()]
    this.fighters = fighters.map(fighter => fighter.summarize())
  }
}
