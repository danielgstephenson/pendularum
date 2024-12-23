import { Vec2 } from 'planck'
import { Game } from '../game'
import { Actor } from './actor'
import { clamp, clampVec, normalize } from '../math'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { Blade } from '../features/blade'

export class Fighter extends Actor {
  static reach = 3
  movePower = 3
  swingPower = 0.2 * Math.PI
  maxSpeed = 2
  maxSpin = 0.5 * Math.PI
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)
  spin = 0
  move = Vec2(0, 0)
  swing = 0
  dead = false
  team = 1
  torso: Torso
  blade: Blade

  constructor (game: Game, position: Vec2) {
    super(game, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0,
      fixedRotation: false
    })
    this.label = 'fighter'
    this.body.setPosition(position)
    this.game.fighters.set(this.id, this)
    this.torso = new Torso(this)
    this.blade = new Blade(this)
    this.body.setMassData({
      mass: 1,
      center: Vec2(0, 0),
      I: 1
    })
  }

  die (): void {
    this.dead = true
    console.log('die', this.team)
  }

  updateConfiguration (): void {
    this.position = this.body.getPosition()
    this.velocity = clampVec(this.body.getLinearVelocity(), this.maxSpeed)
    this.body.setLinearVelocity(this.velocity)
    this.spin = clamp(-this.maxSpin, this.maxSpin, this.body.getAngularVelocity())
    this.body.setAngularVelocity(this.spin)
  }

  preStep (): void {
    super.preStep()
    const moveVector = this.move.length() > 0 ? this.move : Vec2.mul(this.velocity, -1)
    const force = Vec2.mul(normalize(moveVector), this.movePower)
    this.body.applyForce(force, this.body.getPosition())
    this.swing = Math.sign(this.swing)
    this.body.applyTorque(this.swing * this.swingPower)
  }

  postStep (): void {
    super.postStep()
    if (this.removed) {
      this.game.fighters.delete(this.id)
      return
    }
    if (this.dead) {
      this.respawn()
    }
    this.updateConfiguration()
  }

  respawn (): void {}

  summarize (): FighterSummary {
    return new FighterSummary(this)
  }
}
