import { DistanceJoint, Fixture, RopeJoint, Vec2 } from 'planck'
import { Actor } from './actor'
import { Fighter } from './fighter'
import { Blade } from '../features/blade'
import { clampVec } from '../math'
import { Feature } from '../features/feature'
import { Torso } from '../features/torso'

export class Weapon extends Actor {
  fighter: Fighter
  blade: Blade
  maxSpeed = 20
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
      maxLength: 3,
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
    this.attack()
  }

  attack (): void {
    const callback = (fixture: Fixture, point: Vec2, normal: Vec2, fraction: number): number => {
      const hitFeature = fixture.getUserData() as Feature
      if (hitFeature instanceof Torso && hitFeature.fighter.team !== this.fighter.team) {
        hitFeature.fighter.die()
      }
      return 1
    }
    this.game.world.rayCast(this.position, this.fighter.position, callback)
  }
}
