import { Vec2 } from 'planck'
import { Fighter } from './actors/fighter'
import { Game } from './game'
import { PlayerSummary } from './summaries/playerSummary'
import { rotate } from './math'

export class Player {
  game: Game
  fighter: Fighter
  id: string
  savePoint: Vec2

  constructor (game: Game) {
    this.game = game
    this.savePoint = this.game.startPoint
    this.fighter = new Fighter(this.game)
    this.fighter.player = this
    this.id = this.fighter.id
    this.game.players.set(this.id, this)
    this.respawn()
  }

  respawn (): void {
    if (this.game.startPoint != null) {
      const campPoint = this.savePoint
      const angle = Math.random() * 2 * Math.PI
      const offset = rotate(Vec2(0, 2), angle)
      const startPoint = Vec2.add(campPoint, offset)
      this.fighter.body.setPosition(startPoint)
      this.fighter.weapon.body.setPosition(startPoint)
    }
  }

  summarize (): PlayerSummary {
    return new PlayerSummary(this)
  }

  remove (): void {
    this.fighter.remove()
    this.game.players.delete(this.id)
  }
}
