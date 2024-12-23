import { Vec2 } from 'planck'
import { Torso } from '../features/torso'
import { range } from '../math'
import { FighterSummary } from '../summaries/fighterSummary'
import { LayoutSummary } from '../summaries/layoutSummary'
import { Camera } from './camera'
import { Checker } from './checker'
import { Client } from './client'
import { Blade } from '../features/blade'

export class Renderer {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  camera = new Camera()
  checker = new Checker()
  client: Client
  fighters: FighterSummary[] = []
  id: string
  layout?: LayoutSummary
  starVertices: Vec2[]
  savePoint = Vec2(0, 0)

  backgroundColor = '#242424'
  torsoColor1 = 'rgb(0,000,255)'
  bladeColor1 = 'rgb(0,190,255)'
  torsoColor2 = 'rgb(0,120,000)'
  bladeColor2 = 'rgb(0,255,000)'

  constructor (client: Client) {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.id = ''
    this.client = client
    this.starVertices = this.getStarVertices()
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
      this.drawString(fighter)
    })
    this.fighters.forEach(fighter => {
      this.drawTorso(fighter)
    })
    this.fighters.forEach(fighter => {
      this.drawBlade(fighter)
    })
  }

  drawBoundary (): void {
    if (this.layout == null) return
    this.context.fillStyle = this.backgroundColor
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
    this.context.fillStyle = this.backgroundColor
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
    this.layout.savePoints.forEach(position => {
      if (this.layout == null) return
      const yellow = 'hsl(51 100 40)'
      const darkYellow = 'hsl(51 100 7)'
      const distance = Vec2.distance(this.savePoint, position)
      this.context.fillStyle = distance < 1 ? yellow : darkYellow
      this.context.beginPath()
      this.starVertices.forEach((vertex, i) => {
        const point = Vec2.add(position, vertex)
        if (i === 0) this.context.moveTo(point.x, point.y)
        else this.context.lineTo(point.x, point.y)
      })
      this.context.closePath()
      this.context.fill()
    })
  }

  drawTorso (fighter: FighterSummary): void {
    if (fighter.dead) return
    this.resetContext()
    this.context.fillStyle = fighter.team === 1 ? this.torsoColor1 : this.torsoColor2
    this.context.beginPath()
    this.context.arc(
      fighter.position.x,
      fighter.position.y,
      Torso.radius, 0, 2 * Math.PI
    )
    this.context.fill()
  }

  drawBlade (fighter: FighterSummary): void {
    if (fighter.dead) return
    this.resetContext()
    this.context.fillStyle = 'hsl(0 0 75)'
    this.context.translate(fighter.position.x, fighter.position.y)
    this.context.rotate(fighter.angle)
    this.context.beginPath()
    Blade.vertices.forEach((vertex, i) => {
      if (i === 0) this.context.moveTo(vertex.x, vertex.y)
      else this.context.lineTo(vertex.x, vertex.y)
    })
    this.context.fill()
  }

  drawString (fighter: FighterSummary): void {
    if (fighter.dead) return
    this.resetContext()
    this.context.strokeStyle = fighter.team === 1 ? this.bladeColor1 : this.bladeColor2
    this.context.lineWidth = 0.1
    // this.context.beginPath()
    // this.context.moveTo(fighter.position.x, fighter.position.y)
    // // this.context.lineTo(fighter.bladePosition.x, fighter.bladePosition.y)
    // this.context.stroke()
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
    const vmax = Math.max(this.canvas.width, this.canvas.height)
    this.context.scale(vmax, -vmax)
    this.context.scale(this.camera.scale, this.camera.scale)
    this.context.translate(-this.camera.position.x, -this.camera.position.y)
    this.context.globalAlpha = 1
  }

  getStarVertices (): Vec2[] {
    const radius = 0.5
    const vertices: Vec2[] = []
    range(0, 4).forEach(i => {
      const angle = (0.25 + i / 5) * 2 * Math.PI
      const point = Vec2(radius * Math.cos(angle), radius * Math.sin(angle))
      vertices.push(point)
      const insetRadius = 0.55 * radius
      const angle2 = angle + 1 / 10 * 2 * Math.PI
      const point2 = Vec2(insetRadius * Math.cos(angle2), insetRadius * Math.sin(angle2))
      vertices.push(point2)
    })
    return vertices
  }
}
