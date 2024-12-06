import { Vec2 } from 'planck'
import { Player } from '../pilots/player'
import { GameSummary } from './gameSummary'

export class PlayerSummary {
  game: GameSummary
  id: string
  savePoint: Vec2

  constructor (player: Player) {
    this.game = player.game.summary
    this.id = player.ally.id
    this.savePoint = player.spawnPoint
  }
}
