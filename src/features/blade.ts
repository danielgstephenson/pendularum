import { Circle, Vec2 } from 'planck'
import { Feature } from './feature'
import { Weapon } from '../actors/weapon'

export class Blade extends Feature {
  static radius = 0.3
  weapon: Weapon
  alive = true

  constructor (weapon: Weapon) {
    super(weapon, {
      shape: new Circle(Vec2(0, 0), Blade.radius),
      density: 1,
      friction: 0,
      restitution: 0
    })
    this.weapon = weapon
    this.label = 'blade'
  }
}
