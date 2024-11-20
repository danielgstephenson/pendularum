import { Game } from '../game'
import { Actor } from './actor'
import { Border } from '../features/border'

export class Stage extends Actor {
  border: Border

  constructor (game: Game) {
    super(game, {
      type: 'static'
    })
    this.border = new Border(this)
  }
}
