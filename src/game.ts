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

export class Game {
  world: World
  layout: Layout
  cavern: Cavern
  server: Server
  runner: Runner
  actors = new Map<string, Actor>()
  fighters = new Map<string, Fighter>()
  players = new Map<string, Player>()
  summary: GameSummary

  constructor (server: Server) {
    this.server = server
    this.layout = new Layout()
    this.world = new World()
    this.cavern = new Cavern(this)
    this.summary = new GameSummary(this)
    this.runner = new Runner(this)
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

  summarize (): GameSummary {
    return new GameSummary(this)
  }
}
