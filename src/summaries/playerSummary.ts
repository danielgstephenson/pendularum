import { Player } from '../player'
import { GameSummary } from './gameSummary'

export class PlayerSummary {
  game: GameSummary
  id: string

  constructor (player: Player) {
    this.game = player.game.summary
    this.id = player.fighter.id
  }
}
