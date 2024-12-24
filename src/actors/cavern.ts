import { Game } from '../game'
import { Actor } from './actor'
import { Boundary } from '../features/boundary'
import { GuardArea } from '../features/guardArea'

export class Cavern extends Actor {
  outerBoundary: Boundary
  innerBoundaries: Boundary[] = []
  guardAreas: GuardArea[] = []

  constructor (game: Game) {
    super(game, {
      type: 'static'
    })
    this.outerBoundary = new Boundary(this, this.game.layout.boundary)
    this.game.layout.gaps.forEach(vertices => {
      const innerBoundary = new Boundary(this, vertices)
      this.innerBoundaries.push(innerBoundary)
    })
    this.game.layout.guardAreas.forEach(vertices => {
      const guardArea = new GuardArea(this, vertices)
      this.guardAreas.push(guardArea)
    })
  }
}
