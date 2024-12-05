import { Server } from './server'
import { Vec2, World } from 'planck'
import { Actor } from './actors/actor'
import { Cavern } from './actors/cavern'
import { Player } from './player'
import { Fighter } from './actors/fighter'
import { GameSummary } from './summaries/gameSummary'
import { Runner } from './runner'
import { InputSummary } from './summaries/inputSummary'
import { Layout } from './layout'
import { Star } from './actors/star'
import { Collider } from './collider'
import { Enemy } from './actors/enemy'

export class Game {
  world: World
  layout: Layout
  cavern: Cavern
  server: Server
  runner: Runner
  collider: Collider
  actors = new Map<string, Actor>()
  fighters = new Map<string, Fighter>()
  players = new Map<string, Player>()
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
    this.setupEnemies()
    this.setupIo()
  }

  setupIo (): void {
    this.server.io.on('connection', socket => {
      console.log('connect:', socket.id)
      socket.emit('connected', this.layout.summary)
      const player = new Player(this)
      socket.on('input', (input: InputSummary) => {
        const move = input.move ?? Vec2(0, 0)
        player.fighter.move.x = move.x ?? 0
        player.fighter.move.y = move.y ?? 0
        const playerSummary = player.summarize()
        socket.emit('summary', playerSummary)
      })
      socket.on('disconnect', () => {
        console.log('disconnect:', socket.id)
        player.remove()
      })
    })
  }

  setupSavePoints (): void {
    this.layout.savePoints.forEach((position, i) => {
      void new Star(this, position)
      if (i === 0) this.startPoint = position
    })
  }

  setupEnemies (): void {
    this.layout.enemyPoints.forEach((position, i) => {
      void new Enemy(this, position)
    })
  }

  summarize (): GameSummary {
    return new GameSummary(this)
  }
}
