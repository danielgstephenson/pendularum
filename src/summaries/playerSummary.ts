import { Vec2 } from 'planck'
import { GameSummary } from './gameSummary'
import { Player } from '../actors/player'

export class PlayerSummary {
  game: GameSummary
  id: string
  spawnPoint: Vec2

  constructor (player: Player) {
    this.game = player.game.summary
    this.id = player.id
    this.spawnPoint = player.spawnPoint
  }
}
