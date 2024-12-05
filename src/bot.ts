import { Vec2 } from 'planck'
import { Fighter } from './actors/fighter'

export class Bot {
  fighter: Fighter
  spawnPoint: Vec2

  constructor (fighter: Fighter) {
    this.fighter = fighter
    this.spawnPoint = fighter.body.getPosition().clone()
    this.fighter.bot = this
  }

  respawn (): void {
    this.fighter.body.setPosition(this.spawnPoint)
    this.fighter.weapon.body.setPosition(this.spawnPoint)
    this.fighter.body.setLinearVelocity(Vec2(0, 0))
    this.fighter.weapon.body.setLinearVelocity(Vec2(0, 0))
    this.fighter.dead = false
  }
}
