import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { Counter } from './counter'
import { dirFromTo } from '../math'
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
    this.body.setLinearVelocity(Vec2(0, 0))
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
    if (this.halo.starDistance < 10) {
      if (this.halo.nearStar == null) return
      const point = this.halo.nearStar.body.getPosition()
      this.move = dirFromTo(point, this.position)
    } else if (this.halo.guardDistance < 4) {
      if (this.halo.nearGuard == null) return
      const point = this.halo.nearGuard.body.getPosition()
      this.move = dirFromTo(point, this.position)
    } else if (this.halo.wallDistance > 4) {
      // const weaponToGuard = dirFromTo(this.ballChain.position, this.position)
      // const perp = reject(this.ballChain.velocity, weaponToGuard)
      // if (this.halo.playerDistance < 40 && perp.length() > 0.8 * this.ballChain.maxSpeed) {
      //   if (this.halo.nearPlayer == null) return
      //   const point = this.halo.nearPlayer.position
      //   this.move = dirFromTo(this.position, point)
      // } else {
      //   if (perp.length() === 0) {
      //     this.move = randomDir()
      //   } else {
      //     this.move = Vec2.combine(0.3, weaponToGuard, -0.7, perp)
      //   }
      // }
    } else {
      this.move = this.halo.wallAway
    }
  }
}
