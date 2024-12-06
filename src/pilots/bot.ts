import { Vec2 } from 'planck'
import { Enemy } from '../actors/enemy'

export class Bot {
  enemy: Enemy
  spawnPoint: Vec2

  constructor (enemy: Enemy) {
    this.enemy = enemy
    this.spawnPoint = this.enemy.body.getPosition().clone()
  }

  respawn (): void {
    this.enemy.body.setPosition(this.spawnPoint)
    this.enemy.weapon.body.setPosition(this.spawnPoint)
    this.enemy.body.setLinearVelocity(Vec2(0, 0))
    this.enemy.weapon.body.setLinearVelocity(Vec2(0, 0))
    if (this.enemy.counter.playerCount === 0) {
      this.enemy.dead = false
    }
  }
}
