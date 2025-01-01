import { Vec2 } from 'planck'
import { Game } from '../game'
import { Actor } from './actor'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { Weapon } from './weapon'
import { normalize, rotate } from '../math'
import { Blade } from '../features/blade'

export class Fighter extends Actor {
  movePower = 12
  maxSpeed = 3
  move = Vec2(0, 0)
  spawnPoint = Vec2(0, 0)
  spawnOffset = 0
  dead = false
  team = 1
  reach: number
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
    this.updateConfiguration()
    this.game.fighters.set(this.id, this)
    this.torso = new Torso(this)
    this.weapon = new Weapon(this)
    this.reach = this.weapon.stringLength + Blade.radius + Torso.radius
    this.body.setMassData({
      mass: 1,
      center: Vec2(0, 0),
      I: 1
    })
  }

  die (): void {
    this.dead = true
  }

  preStep (): void {
    super.preStep()
    this.move = normalize(this.move)
    const stopVector = normalize(Vec2.mul(this.velocity, -1))
    const moveVector = this.move.length() > 0 ? this.move : stopVector
    const force = Vec2.mul(moveVector, this.movePower)
    this.body.applyForce(force, this.body.getPosition())
  }

  postStep (): void {
    super.postStep()
    if (this.removed) {
      this.game.fighters.delete(this.id)
    }
  }

  respawn (): void {
    const spawnAngle = Math.random() * 2 * Math.PI
    const offset = rotate(Vec2(0, this.spawnOffset), spawnAngle)
    const startPoint = Vec2.add(this.spawnPoint, offset)
    this.body.setPosition(startPoint)
    this.body.setLinearVelocity(Vec2(0, 0))
    this.weapon.body.setPosition(startPoint)
    this.weapon.body.setLinearVelocity(Vec2(0, 0))
    this.dead = false
  }

  summarize (): FighterSummary {
    return new FighterSummary(this)
  }

  remove (): void {
    super.remove()
    this.dead = true
    this.weapon.remove()
    this.game.fighters.delete(this.id)
  }
}
