import { SavePoint } from '../actors/savePoint'
import { Torso } from '../features/torso'
import { range } from '../math'
import { FighterSummary } from '../summaries/fighterSummary'
import { LayoutSummary } from '../summaries/layoutSummary'
import { Camera } from './camera'
import { Checker } from './checker'
import { Client } from './client'

export class Renderer {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  camera = new Camera()
  checker = new Checker()
  client: Client
  fighters: FighterSummary[] = []
  id: string
  layout?: LayoutSummary

  color1 = 'blue'
  color2 = 'rgb(0,120,0)'

  constructor (client: Client) {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.id = ''
    this.client = client
    this.draw()
  }

  draw (): void {
    window.requestAnimationFrame(() => this.draw())
    if (this.layout == null) return
    this.setupCanvas()
    this.moveCamera()
    this.drawBoundary()
    this.drawGaps()
    this.drawSavePoints()
    this.fighters.forEach(fighter => {
      this.drawTorso(fighter)
    })
  }

  drawBoundary (): void {
    if (this.layout == null) return
    this.context.fillStyle = this.layout.backgroundColor
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.resetContext()
    this.context.imageSmoothingEnabled = false
    this.context.fillStyle = this.checker.pattern
    this.context.beginPath()
    this.layout.boundary.forEach((vertex, i) => {
      if (i === 0) this.context.moveTo(vertex.x, vertex.y)
      else this.context.lineTo(vertex.x, vertex.y)
    })
    this.context.fill()
  }

  drawGaps (): void {
    if (this.layout == null) return
    this.resetContext()
    this.context.fillStyle = this.layout.backgroundColor
    this.layout.gaps.forEach(gap => {
      this.context.beginPath()
      gap.forEach((vertex, i) => {
        if (i === 0) this.context.moveTo(vertex.x, vertex.y)
        else this.context.lineTo(vertex.x, vertex.y)
      })
      this.context.fill()
    })
  }

  drawSavePoints (): void {
    if (this.layout == null) return
    this.resetContext()
    const stoneCount = 11
    const stoneRadius = 0.25 * SavePoint.radius
    this.layout.savePoints.forEach(position => {
      if (this.layout == null) return
      this.context.fillStyle = this.layout.woodColor
      this.context.beginPath()
      this.context.arc(
        position.x, position.y,
        SavePoint.radius - stoneRadius,
        0, 2 * Math.PI
      )
      this.context.fill()
      for (const i of range(1, stoneCount)) {
        if (this.layout == null) return
        this.context.fillStyle = this.layout.backgroundColor
        const angle = 2 * Math.PI * i / stoneCount
        const x = position.x + (SavePoint.radius - stoneRadius) * Math.cos(angle)
        const y = position.y + (SavePoint.radius - stoneRadius) * Math.sin(angle)
        this.context.beginPath()
        this.context.arc(x, y, stoneRadius, 0, 2 * Math.PI)
        this.context.fill()
      }
    })
  }

  drawTorso (fighter: FighterSummary): void {
    this.resetContext()
    this.context.fillStyle = fighter.team === 1 ? this.color1 : this.color2
    this.context.beginPath()
    this.context.arc(
      fighter.position.x,
      fighter.position.y,
      Torso.radius, 0, 2 * Math.PI
    )
    this.context.fill()
  }

  moveCamera (): void {
    this.fighters.forEach(fighter => {
      if (fighter.id === this.id) {
        this.camera.position = fighter.position
      }
    })
  }

  setupCanvas (): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  resetContext (): void {
    this.context.resetTransform()
    this.context.translate(0.5 * this.canvas.width, 0.5 * this.canvas.height)
    const vmin = Math.min(this.canvas.width, this.canvas.height)
    this.context.scale(vmin, -vmin)
    this.context.scale(this.camera.scale, this.camera.scale)
    this.context.translate(-this.camera.position.x, -this.camera.position.y)
    this.context.globalAlpha = 1
  }
}
