import { Polygon, Vec2 } from 'planck'
import { Feature } from './feature'
import { Fighter } from '../actors/fighter'

export class Blade extends Feature {
  static hy = 0.3
  static start = 1.2
  static narrow = 8
  static reach = 9
  static vertices = [
    Vec2(Blade.start, -Blade.hy),
    Vec2(Blade.narrow, -Blade.hy),
    Vec2(Blade.reach, 0),
    Vec2(Blade.narrow, Blade.hy),
    Vec2(Blade.start, Blade.hy)
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
