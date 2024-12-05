import { Vec2 } from 'planck'
import { Game } from '../game'
import { Actor } from './actor'
import { clampVec, normalize } from '../math'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { Player } from '../player'
import { Weapon } from './weapon'
import { Bot } from '../bot'

export class Fighter extends Actor {
  movePower = 2
  maxSpeed = 4
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)
  move = Vec2(0, 0)
  dead = false
  team = 1
  torso: Torso
  weapon: Weapon
  player?: Player
  bot?: Bot

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
    this.body.setMassData({
      mass: 1,
      center: Vec2(0, 0),
      I: 0.25
    })
    this.game.fighters.set(this.id, this)
    this.torso = new Torso(this)
    this.weapon = new Weapon(this)
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
      if (this.player != null) this.player.respawn()
      if (this.bot != null) this.bot.respawn()
    }
    this.updateConfiguration()
  }

  summarize (): FighterSummary {
    return new FighterSummary(this)
  }
}
