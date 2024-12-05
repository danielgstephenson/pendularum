import { Vec2 } from 'planck'
import { Layout } from '../layout'

export class LayoutSummary {
  boundary: Vec2[]
  savePoints: Vec2[]
  gaps: Vec2[][]

  constructor (layout: Layout) {
    this.boundary = layout.boundary
    this.gaps = layout.gaps
    this.savePoints = layout.savePoints
  }
}
