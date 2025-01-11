import { Vec2 } from 'planck'
import { Game } from '../game'
import { Actor } from './actor'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { Weapon } from './weapon'
import { angleToDir, dirFromTo, normalize, rotate, vecToAngle } from '../math'
import { Halo } from '../features/halo'

export class Fighter extends Actor {
  reach = 4
  movePower = 2 // 10
  maxSpeed = 2
  moveDir = Vec2(0, 0)
  spawnPoint = Vec2(0, 0)
  spawnOffset = 0
  dead = false
  team = 1
  torso: Torso
  halo: Halo
  weapon: Weapon
  angle = 0
  spin = 0

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
    this.halo = new Halo(this)
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
    this.halo.wallPoints = []
    this.applyMove()
  }

  applyMove (): void {
    this.moveDir = normalize(this.moveDir)
    if (this.moveDir.length() === 0) {
      if (this.velocity.length() < 0.1) {
        this.velocity = Vec2.zero()
        this.body.setLinearVelocity(this.velocity)
        return
      }
      const reverse = normalize(Vec2.mul(this.velocity, -5))
      const force = Vec2.mul(this.movePower, reverse)
      this.body.applyForce(force, this.body.getPosition())
      return
    }
    const force = Vec2.mul(this.movePower, this.moveDir)
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
    const angle = Math.random() * 2 * Math.PI
    const weaponOffset = Vec2.mul(this.weapon.stringLength, angleToDir(angle))
    const weaponStartPoint = Vec2.add(startPoint, weaponOffset)
    this.weapon.body.setPosition(weaponStartPoint)
    this.weapon.body.setLinearVelocity(Vec2(0, 0))
    this.dead = false
  }

  updateConfiguration (): void {
    super.updateConfiguration()
    const toWeaponDir = dirFromTo(this.position, this.weapon.position)
    this.angle = vecToAngle(toWeaponDir)
    const tangent = rotate(toWeaponDir, 0.5 * Math.PI)
    const tangentSpeed = Vec2.dot(this.weapon.velocity, tangent)
    this.spin = tangentSpeed / this.weapon.stringLength
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
