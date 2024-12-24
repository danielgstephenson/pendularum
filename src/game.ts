import { Server } from './server'
import { Vec2, World } from 'planck'
import { Actor } from './actors/actor'
import { Cavern } from './actors/cavern'
import { Fighter } from './actors/fighter'
import { GameSummary } from './summaries/gameSummary'
import { Runner } from './runner'
import { InputSummary } from './summaries/inputSummary'
import { Layout } from './layout'
import { Star } from './actors/star'
import { Collider } from './collider'
import { Guard } from './actors/guard'
import { Player } from './actors/player'

export class Game {
  world: World
  layout: Layout
  cavern: Cavern
  server: Server
  runner: Runner
  collider: Collider
  actors = new Map<string, Actor>()
  fighters = new Map<string, Fighter>()
  stars = new Map<string, Star>()
  summary: GameSummary
  startPoint = Vec2(0, 0)

  constructor (server: Server) {
    this.server = server
    this.layout = new Layout()
    this.world = new World()
    this.cavern = new Cavern(this)
    this.summary = new GameSummary(this)
    this.runner = new Runner(this)
    this.collider = new Collider(this)
    this.setupSavePoints()
    this.setupGuards()
    this.setupIo()
  }

  setupIo (): void {
    this.server.io.on('connection', socket => {
      console.log('connect:', socket.id)
      socket.emit('connected', this.layout.summary)
      const player = new Player(this)
      socket.on('input', (input: InputSummary) => {
        player.handleInput(input)
        socket.emit('summary', player.getPlayerSummary())
      })
      socket.on('disconnect', () => {
        console.log('disconnect:', socket.id)
        player.remove()
      })
    })
  }

  setupSavePoints (): void {
    this.layout.starPoints.forEach((position, i) => {
      void new Star(this, position)
      if (i === 0) this.startPoint = position
    })
  }

  setupGuards (): void {
    this.layout.guardPoints.forEach((position, i) => {
      void new Guard(this, position)
    })
  }

  summarize (): GameSummary {
    return new GameSummary(this)
  }
}
