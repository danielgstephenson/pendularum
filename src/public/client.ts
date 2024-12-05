import io from 'socket.io-client'
import { Renderer } from './renderer'
import { PlayerSummary } from '../summaries/playerSummary'
import { Input } from './input'
import { LayoutSummary } from '../summaries/layoutSummary'

export class Client {
  socket = io()
  renderer: Renderer
  input: Input

  constructor () {
    this.renderer = new Renderer(this)
    this.input = new Input(this)
    this.socket.on('connected', (layout: LayoutSummary) => {
      console.log('connected')
      this.renderer.layout = layout
      setInterval(() => this.updateServer(), 1000 / 60)
    })
    this.socket.on('summary', (playerSummary: PlayerSummary) => {
      this.renderer.fighters = playerSummary.game.fighters
      this.renderer.id = playerSummary.id
      this.renderer.savePoint = playerSummary.savePoint
    })
  }

  updateServer (): void {
    const inputSummary = this.input.summarize()
    this.socket.emit('input', inputSummary)
  }
}
