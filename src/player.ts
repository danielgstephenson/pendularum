import { Fighter } from './actors/fighter'
import { Game } from './game'
import { PlayerSummary } from './summaries/playerSummary'

export class Player {
  game: Game
  fighter: Fighter
  id: string

  constructor (game: Game) {
    this.game = game
    this.fighter = new Fighter(this.game)
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
