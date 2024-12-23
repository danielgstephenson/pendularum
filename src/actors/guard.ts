import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { Counter } from './counter'
import { Halo } from '../features/halo'

export class Guard extends Fighter {
  counter: Counter
  spawnPoint: Vec2
  halo: Halo

  constructor (game: Game, position: Vec2) {
    super(game, position)
    this.spawnPoint = position
    this.team = 2
    this.counter = new Counter(this)
    this.halo = new Halo(this)
  }

  respawn (): void {
    super.respawn()
    this.body.setPosition(this.spawnPoint)
    this.body.setLinearVelocity(Vec2(0, 0))
  }

  preStep (): void {
    super.preStep()
    this.halo.preStep()
  }

  postStep (): void {
    super.postStep()
    this.halo.postStep()
    if (this.dead && this.counter.playerCount === 0) {
      this.respawn()
    }
  }
}
