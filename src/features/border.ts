import { Chain, Vec2 } from 'planck'
import { Stage } from '../actors/stage'
import { Feature } from './feature'

export class Border extends Feature {
  environment: Stage

  static vertices = [
    Vec2(-5, -8),
    Vec2(+5, -5),
    Vec2(+5, +5),
    Vec2(-5, +5)
  ]

  constructor (environment: Stage) {
    super(environment, {
      shape: new Chain(Border.vertices, true),
      density: 1,
      friction: 0,
      restitution: 0
    })
    this.environment = environment
    this.label = 'border'
  }
}
