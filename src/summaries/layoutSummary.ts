import { Vec2 } from 'planck'
import { Layout } from '../layout'

export class LayoutSummary {
  boundary: Vec2[]
  savePoints: Vec2[]
  gaps: Vec2[][]
  backgroundColor: string
  woodColor: string

  constructor (layout: Layout) {
    this.boundary = layout.boundary
    this.gaps = layout.gaps
    this.backgroundColor = layout.backgroundColor
    this.woodColor = layout.woodColor
    this.savePoints = layout.savePoints
  }
}
