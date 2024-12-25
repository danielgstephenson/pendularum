import { Fighter } from './fighter'
import { Game } from '../game'
import { Vec2 } from 'planck'
import { PlayerSummary } from '../summaries/playerSummary'
import { InputSummary } from '../summaries/inputSummary'

export class Player extends Fighter {
  spawnOffset = 2

  constructor (game: Game) {
    super(game, game.startPoint)
    this.game = game
    this.game.players.set(this.id, this)
    this.spawnPoint = this.game.startPoint
    this.team = 1
    this.respawn()
  }

  handleInput (input: InputSummary): void {
    const move = input.move ?? Vec2(0, 0)
    this.move.x = move.x ?? 0
    this.move.y = move.y ?? 0
  }

  getPlayerSummary (): PlayerSummary {
    return new PlayerSummary(this)
  }

  postStep (): void {
    super.postStep()
    if (this.dead) {
      this.respawn()
    }
  }

  remove (): void {
    super.remove()
    this.dead = true
    this.game.players.delete(this.id)
  }
}
