import { DistanceJoint, Fixture, RopeJoint, Vec2 } from 'planck'
import { Actor } from './actor'
import { Fighter } from './fighter'
import { Blade } from '../features/blade'
import { Feature } from '../features/feature'
import { Torso } from '../features/torso'

export class Weapon extends Actor {
  stringLength = 4
  maxSpeed = 8
  fighter: Fighter
  blade: Blade

  constructor (fighter: Fighter) {
    super(fighter.game, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0,
      fixedRotation: true
    })
    this.fighter = fighter
    this.label = 'blade'
    this.body.setPosition(fighter.position)
    this.blade = new Blade(this)
    this.body.setMassData({
      mass: 0.0000000001,
      center: Vec2(0, 0),
      I: 1
    })
    const distanceJoint = new DistanceJoint({
      bodyA: this.fighter.body,
      bodyB: this.body,
      localAnchorA: Vec2(0, 0),
      localAnchorB: Vec2(0, 0),
      frequencyHz: 0.2,
      dampingRatio: 0,
      collideConnected: false
    })
    this.game.world.createJoint(distanceJoint)
    const ropeJoint = new RopeJoint({
      bodyA: this.fighter.body,
      bodyB: this.body,
      localAnchorA: Vec2(0, 0),
      localAnchorB: Vec2(0, 0),
      maxLength: this.stringLength,
      collideConnected: false
    })
    this.game.world.createJoint(ropeJoint)
  }

  preStep (): void {
    super.preStep()
    if (this.fighter.dead) return
    const ray0 = this.position
    const ray1 = this.fighter.position
    this.game.world.rayCast(ray0, ray1, (fixture: Fixture) => {
      const feature = fixture.getUserData() as Feature
      if (!(feature instanceof Torso)) return 1
      if (feature.fighter.dead) return 1
      if (feature.fighter.team !== this.fighter.team) {
        feature.fighter.die()
      }
      return 1
    })
  }
}
