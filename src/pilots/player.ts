import { Vec2 } from 'planck'
import { Game } from '../game'
import { PlayerSummary } from '../summaries/playerSummary'
import { rotate } from '../math'
import { Ally } from '../actors/ally'

export class Player {
  game: Game
  ally: Ally
  id: string
  spawnPoint: Vec2

  constructor (game: Game) {
    this.game = game
    this.spawnPoint = this.game.startPoint
    this.ally = new Ally(this)
    this.id = this.ally.id
    this.game.players.set(this.id, this)
    this.respawn()
  }

  respawn (): void {
    console.log('respawn player')
    const angle = Math.random() * 2 * Math.PI
    const offset = rotate(Vec2(0, 2), angle)
    const startPoint = Vec2.add(this.spawnPoint, offset)
    this.ally.body.setPosition(startPoint)
    this.ally.weapon.body.setPosition(startPoint)
    this.ally.body.setLinearVelocity(Vec2(0, 0))
    this.ally.weapon.body.setLinearVelocity(Vec2(0, 0))
    this.ally.dead = false
  }

  summarize (): PlayerSummary {
    return new PlayerSummary(this)
  }

  remove (): void {
    this.ally.remove()
    this.game.players.delete(this.id)
  }
}
