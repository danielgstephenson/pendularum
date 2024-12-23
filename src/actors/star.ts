import { Circle, Vec2 } from 'planck'
import { Feature } from '../features/feature'
import { Game } from '../game'
import { Actor } from './actor'

export class Star extends Actor {
  static radius = 7
  feature: Feature
  position: Vec2

  constructor (game: Game, position: Vec2) {
    super(game, { type: 'static' })
    this.label = 'savePoint'
    this.feature = new Feature(this, {
      shape: new Circle(Vec2(0, 0), Star.radius)
    })
    this.feature.label = 'savePoint'
    this.body.setPosition(position)
    this.position = position
    this.game.stars.set(this.id, this)
  }
}
