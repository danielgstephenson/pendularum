import io from 'socket.io-client'
import { Renderer } from './renderer'
import { PlayerSummary } from '../summaries/playerSummary'
import { Input } from './input'

export class Client {
  socket = io()
  renderer: Renderer
  input: Input

  constructor () {
    this.renderer = new Renderer(this)
    this.input = new Input(this)
    this.socket.on('connected', () => {
      console.log('connected')
      setInterval(() => this.updateServer(), 1000 / 60)
    })
    this.socket.on('summary', (playerSummary: PlayerSummary) => {
      this.renderer.fighters = playerSummary.game.fighters
      this.renderer.id = playerSummary.id
    })
  }

  updateServer (): void {
    const inputSummary = this.input.summarize()
    this.socket.emit('input', inputSummary)
  }
}
