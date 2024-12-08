import { Fighter } from './fighter'
import { Game } from '../game'
import { Vec2 } from 'planck'
import { rotate } from '../math'
import { PlayerSummary } from '../summaries/playerSummary'
import { InputSummary } from '../summaries/inputSummary'

export class Player extends Fighter {
  spawnPoint: Vec2

  constructor (game: Game) {
    super(game, game.startPoint)
    this.game = game
    this.spawnPoint = this.game.startPoint
    this.team = 1
    this.respawn()
  }

  respawn (): void {
    const angle = Math.random() * 2 * Math.PI
    const offset = rotate(Vec2(0, 2), angle)
    const startPoint = Vec2.add(this.spawnPoint, offset)
    this.body.setPosition(startPoint)
    this.weapon.body.setPosition(startPoint)
    this.body.setLinearVelocity(Vec2(0, 0))
    this.weapon.body.setLinearVelocity(Vec2(0, 0))
    this.dead = false
  }

  handleInput (input: InputSummary): void {
    const move = input.move ?? Vec2(0, 0)
    this.move.x = move.x ?? 0
    this.move.y = move.y ?? 0
  }

  getPlayerSummary (): PlayerSummary {
    return new PlayerSummary(this)
  }
}
