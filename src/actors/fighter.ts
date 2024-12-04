import { Vec2 } from 'planck'
import { Game } from '../game'
import { Actor } from './actor'
import { clamp, clampVec, normalize } from '../math'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { Player } from '../player'

export class Fighter extends Actor {
  movePower = 4
  swingPower = 0.015
  maxSpeed = 4
  maxSpin = 0.8
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)
  move = Vec2(0, 0)
  angle = 0
  spin = 0
  team = 1
  torso: Torso
  player?: Player

  constructor (game: Game) {
    super(game, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0
    })
    this.label = 'fighter'
    this.torso = new Torso(this)
    this.body.setMassData({
      mass: 1,
      center: Vec2(0, 0),
      I: 0.25
    })
    this.game.fighters.set(this.id, this)
  }

  updateConfiguration (): void {
    this.position = this.body.getPosition()
    this.velocity = clampVec(this.body.getLinearVelocity(), this.maxSpeed)
    this.body.setLinearVelocity(this.velocity)
    this.angle = this.body.getAngle()
    this.spin = clamp(-this.maxSpin, this.maxSpin, this.body.getAngularVelocity())
    this.body.setAngularVelocity(this.spin)
  }

  preStep (): void {
    super.preStep()
    const moveVector = this.move.length() > 0 ? this.move : Vec2.mul(this.velocity, -1)
    const force = Vec2.mul(normalize(moveVector), this.movePower)
    this.body.applyForce(force, this.body.getPosition())
  }

  postStep (): void {
    super.postStep()
    if (this.removed) {
      this.game.fighters.delete(this.id)
      return
    }
    this.updateConfiguration()
  }

  summarize (): FighterSummary {
    return new FighterSummary(this)
  }
}
