import { Circle, Vec2 } from 'planck'
import { Actor } from './actor'
import { Feature } from '../features/feature'
import { Fighter } from './fighter'

export class Counter extends Actor {
  static radius = 30
  feature: Feature
  playerCount = 0

  constructor (fighter: Fighter) {
    super(fighter.game, { type: 'static' })
    this.feature = new Feature(this, {
      shape: new Circle(Vec2(0, 0), Counter.radius),
      isSensor: true
    })
    this.feature.label = 'counter'
    this.body.setPosition(fighter.body.getPosition())
  }
}
