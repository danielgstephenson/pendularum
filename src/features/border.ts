import { Chain, Vec2 } from 'planck'
import { Cavern } from '../actors/cavern'
import { Feature } from './feature'

export class Border extends Feature {
  cavern: Cavern

  constructor (cavern: Cavern, vertices: Vec2[]) {
    super(cavern, {
      shape: new Chain(vertices, true),
      density: 1,
      friction: 0,
      restitution: 0
    })
    this.cavern = cavern
    this.label = 'border'
  }
}
