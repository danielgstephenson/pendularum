import { Server } from './server'
import { Vec2, World } from 'planck'
import { Actor } from './actors/actor'
import { Stage } from './actors/stage'
import { Player } from './player'
import { Fighter } from './actors/fighter'
import { GameSummary } from './summaries/gameSummary'
import { Runner } from './runner'
import { InputSummary } from './summaries/inputSummary'

export class Game {
  world: World
  stage: Stage
  server: Server
  runner: Runner
  actors = new Map<string, Actor>()
  fighters = new Map<string, Fighter>()
  players = new Map<string, Player>()
  summary: GameSummary

  constructor (server: Server) {
    this.server = server
    this.world = new World()
    this.stage = new Stage(this)
    this.summary = new GameSummary(this)
    this.runner = new Runner(this)
    this.setupIo()
  }

  setupIo (): void {
    this.server.io.on('connection', socket => {
      console.log('connect:', socket.id)
      socket.emit('connected')
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
