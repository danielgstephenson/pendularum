import { Game } from '../game'
import { Actor } from './actor'
import { Border } from '../features/border'
import { Vec2 } from 'planck'

export class Cavern extends Actor {
  constructor (game: Game) {
    super(game, {
      type: 'static'
    })
    this.addBorder(this.game.layout.boundary)
    this.game.layout.gaps.forEach(gap => {
      this.addBorder(gap)
    })
  }

  addBorder (vertices: Vec2[]): Border {
    return new Border(this, vertices)
  }
}
