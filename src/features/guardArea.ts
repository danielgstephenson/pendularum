import { Polygon, PolygonShape, Vec2 } from 'planck'
import { Cavern } from '../actors/cavern'
import { Feature } from './feature'
import { Player } from '../actors/player'

export class GuardArea extends Feature {
  cavern: Cavern
  polygon: PolygonShape
  players = new Map<string, Player>()

  constructor (cavern: Cavern, vertices: Vec2[]) {
    const polygon = new Polygon(vertices)
    super(cavern, {
      shape: polygon,
      isSensor: true
    })
    this.polygon = polygon
    this.cavern = cavern
    this.label = 'guardArea'
  }

  preStep (): void {
    this.players.forEach(player => {
      if (player.dead) this.players.delete(player.id)
    })
  }
}
