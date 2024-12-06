import { Fighter } from './fighter'
import { Player } from '../pilots/player'

export class Ally extends Fighter {
  player: Player

  constructor (player: Player) {
    super(player.game, player.spawnPoint)
    this.player = player
    this.team = 1
  }

  respawn (): void {
    this.player.respawn()
  }
}
