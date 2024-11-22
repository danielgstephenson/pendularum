import { Vec2 } from 'planck'
import { Fighter } from './actors/fighter'
import { Game } from './game'
import { PlayerSummary } from './summaries/playerSummary'

export class Player {
  game: Game
  fighter: Fighter
  id: string
  campPoints: Vec2[]

  constructor (game: Game) {
    this.game = game
    this.fighter = new Fighter(this.game)
    this.campPoints = this.game.layout.camps
    if (this.campPoints.length > 0) {
      this.fighter.body.setPosition(this.campPoints[0])
    }
    this.id = this.fighter.id
    this.game.players.set(this.id, this)
  }

  summarize (): PlayerSummary {
    return new PlayerSummary(this)
  }

  remove (): void {
    this.fighter.remove()
    this.game.players.delete(this.id)
  }
}
