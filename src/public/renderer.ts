import { Border } from '../features/border'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { Camera } from './camera'
import { Client } from './client'

export class Renderer {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  camera = new Camera()
  client: Client
  fighters: FighterSummary[] = []
  id: string

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
    this.setupCanvas()
    this.moveCamera()
    this.drawStage()
    this.fighters.forEach(fighter => {
      this.drawTorso(fighter)
    })
  }

  drawStage (): void {
    this.context.fillStyle = 'hsl(37 10 10)'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.resetContext()
    this.context.fillStyle = 'black'
    this.context.beginPath()
    Border.vertices.forEach((vertex, i) => {
      if (i === 0) this.context.moveTo(vertex.x, vertex.y)
      else this.context.lineTo(vertex.x, vertex.y)
    })
    this.context.fill()
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
