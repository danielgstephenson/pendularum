import { Vec2 } from 'planck'
import { Game } from '../game'
import { Actor } from './actor'
import { clampVec, normalize } from '../math'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { Weapon } from './weapon'

export class Fighter extends Actor {
  movePower = 4
  maxSpeed = 4
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)
  move = Vec2(0, 0)
  dead = false
  team = 1
  torso: Torso
  weapon: Weapon

  constructor (game: Game, position: Vec2) {
    super(game, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0,
      fixedRotation: true
    })
    this.label = 'fighter'
    this.body.setPosition(position)
    this.game.fighters.set(this.id, this)
    this.torso = new Torso(this)
    this.weapon = new Weapon(this)
    this.body.setMassData({
      mass: 1,
      center: Vec2(0, 0),
      I: 0.25
    })
  }

  die (): void {
    this.dead = true
  }

  updateConfiguration (): void {
    this.position = this.body.getPosition()
    this.velocity = clampVec(this.body.getLinearVelocity(), this.maxSpeed)
    this.body.setLinearVelocity(this.velocity)
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
