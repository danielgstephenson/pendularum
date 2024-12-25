import { Polygon, Vec2 } from 'planck'
import { Feature } from './feature'
import { Fighter } from '../actors/fighter'

export class Blade extends Feature {
  static start = 1.2
  static width = 0.3
  static narrow = 8
  static reach = 9
  static vertices = [
    Vec2(Blade.start, -Blade.width),
    Vec2(Blade.narrow, -Blade.width),
    Vec2(Blade.reach, 0),
    Vec2(Blade.narrow, Blade.width),
    Vec2(Blade.start, Blade.width)
  ]

  fighter: Fighter

  constructor (fighter: Fighter) {
    super(fighter, {
      shape: new Polygon(Blade.vertices),
      friction: 0,
      restitution: 0
    })
    this.fighter = fighter
    this.label = 'blade'
  }
}
