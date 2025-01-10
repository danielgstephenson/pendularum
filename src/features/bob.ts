import { Circle, Vec2 } from 'planck'
import { Feature } from './feature'
import { Fighter } from '../actors/fighter'
import { Weapon } from '../actors/weapon'

export class Bob extends Feature {
  static radius = 0.3
  weapon: Weapon
  fighter: Fighter
  alive = true

  constructor (weapon: Weapon) {
    super(weapon, {
      shape: new Circle(Vec2(0, 0), Bob.radius),
      density: 1,
      friction: 0,
      restitution: 0
    })
    this.weapon = weapon
    this.fighter = this.weapon.fighter
    this.label = 'bob'
  }
}
