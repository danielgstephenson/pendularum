import { Circle, Vec2 } from 'planck'
import { Feature } from './feature'
import { BallChain } from '../actors/ballChain'

export class Ball extends Feature {
  static radius = 0.15
  weapon: BallChain
  alive = true

  constructor (weapon: BallChain) {
    super(weapon, {
      shape: new Circle(Vec2(0, 0), Ball.radius),
      density: 1,
      friction: 0,
      restitution: 0
    })
    this.weapon = weapon
    this.label = 'blade'
  }
}
