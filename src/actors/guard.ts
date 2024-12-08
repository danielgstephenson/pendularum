import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { Counter } from './counter'
import { dirToFrom } from '../math'
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
    this.body.setPosition(this.spawnPoint)
    this.weapon.body.setPosition(this.spawnPoint)
    this.body.setLinearVelocity(Vec2(0, 0))
    this.weapon.body.setLinearVelocity(Vec2(0, 0))
    if (this.counter.playerCount === 0) {
      this.dead = false
    }
  }

  preStep (): void {
    super.preStep()
    this.halo.preStep()
  }

  postStep (): void {
    super.postStep()
    this.halo.postStep()
    this.move = this.halo.wallAway
    if (this.halo.guardDistance < 3) {
      if (this.halo.nearGuard == null) return
      const point = this.halo.nearGuard.body.getPosition()
      this.move = dirToFrom(this.body.getPosition(), point)
    } else if (this.halo.playerDistance < 20 && this.halo.wallDistance > 4) {
      if (this.halo.nearPlayer == null) return
      const point = this.halo.nearPlayer.body.getPosition()
      this.move = dirToFrom(point, this.body.getPosition())
    }
  }
}
