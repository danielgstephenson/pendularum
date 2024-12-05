import { DistanceJoint, RopeJoint, Vec2 } from 'planck'
import { Actor } from './actor'
import { Fighter } from './fighter'
import { Blade } from '../features/blade'
import { clampVec } from '../math'

export class Weapon extends Actor {
  fighter: Fighter
  blade: Blade
  maxSpeed = 8
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)

  constructor (fighter: Fighter) {
    super(fighter.game, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0,
      fixedRotation: true
    })
    this.fighter = fighter
    this.label = 'weapon'
    this.blade = new Blade(this)
    this.body.setMassData({
      mass: 0.0000001,
      center: Vec2(0, 0),
      I: 0.25
    })
    this.body.setPosition(fighter.body.getPosition())
    const distanceJoint = new DistanceJoint({
      bodyA: this.fighter.body,
      bodyB: this.body,
      localAnchorA: Vec2(0, 0),
      localAnchorB: Vec2(0, 0),
      frequencyHz: 0.25,
      collideConnected: false
    })
    this.game.world.createJoint(distanceJoint)
    const ropeJoint = new RopeJoint({
      bodyA: this.fighter.body,
      bodyB: this.body,
      localAnchorA: Vec2(0, 0),
      localAnchorB: Vec2(0, 0),
      maxLength: 4,
      collideConnected: false
    })
    this.game.world.createJoint(ropeJoint)
  }

  updateConfiguration (): void {
    this.position = this.body.getPosition()
    this.velocity = clampVec(this.body.getLinearVelocity(), this.maxSpeed)
    this.body.setLinearVelocity(this.velocity)
  }

  postStep (): void {
    super.postStep()
    this.updateConfiguration()
  }
}
