import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { GuardArea } from '../features/guardArea'
import { Player } from './player'
import { dirFromTo, getAngleDiff, normalize, project, randomDir, reject, rotate, vecToAngle, whichMin } from '../math'
import { Weapon } from './weapon'
import { Blade } from '../features/blade'
export class Guard extends Fighter {
  guardArea: GuardArea

  constructor (game: Game, position: Vec2) {
    super(game, position)
    this.game.guards.set(this.id, this)
    this.spawnPoint = position
    this.team = 2
    const guardAreas = this.game.cavern.guardAreas.filter(guardArea => {
      const worldTransform = guardArea.actor.body.getTransform()
      return guardArea.polygon.testPoint(worldTransform, this.spawnPoint)
    })
    if (guardAreas.length === 0) throw new Error(`No guardArea at (${this.spawnPoint.x},${this.spawnPoint.y})`)
    this.guardArea = guardAreas[0]
    this.respawn()
  }

  respawn (): void {
    super.respawn()
    this.body.setPosition(this.spawnPoint)
  }

  preStep (): void {
    super.preStep()
  }

  postStep (): void {
    super.postStep()
    const player = this.getNearestPlayer()
    if (player == null) return
    const playerDistance = Vec2.distance(this.spawnPoint, player.position)
    if (this.dead && this.guardArea.players.size === 0 && playerDistance > 10) {
      this.respawn()
    }
    this.move = this.getMove()
  }

  getMove (): Vec2 {
    const player = this.getTargetPlayer()
    if (player == null) return this.getHomeMove()
    const distToPlayer = Vec2.distance(this.position, player.position)
    if (distToPlayer > 50) {
      return this.spinIsSlow() ? this.getSpinMove() : this.getHomeMove()
    }
    if (distToPlayer > 10) {
      return this.spinIsSlow() ? this.getSpinMove() : this.getChaseMove(player)
    }
    return this.getFightMove(player)
  }

  getChaseMove (player: Player): Vec2 {
    const dirToPlayer = dirFromTo(this.position, player.position)
    const targetVelocity = Vec2.combine(1, player.velocity, this.maxSpeed, dirToPlayer)
    return dirFromTo(this.velocity, targetVelocity)
  }

  getFightMove (player: Player): Vec2 {
    const reachTime = this.getReachTime(this, player)
    const swingTime = this.getSwingTime(this, player)
    const playerSwingTime = this.getSwingTime(player, this)
    const playerIntercept = reachTime <= playerSwingTime && playerSwingTime <= swingTime
    const playerCounter = swingTime <= reachTime && swingTime <= playerSwingTime
    const danger = playerIntercept || playerCounter
    const targetDistance = danger ? 6 : 4
    const fromPlayerDir = dirFromTo(player.position, this.position)
    const targetPosition = Vec2.combine(1, player.position, targetDistance, fromPlayerDir)
    const dirToTarget = dirFromTo(this.position, targetPosition)
    const targetVelocity = Vec2.combine(1, player.velocity, this.maxSpeed, dirToTarget)
    return dirFromTo(this.velocity, targetVelocity)
  }

  getReachTime (fighter: Fighter, target: Fighter): number {
    const reach = fighter.weapon.stringLength + Blade.radius
    const distance = Vec2.distance(fighter.position, target.position)
    if (distance < reach) return 0
    const x = target.position.x - fighter.position.x
    const y = target.position.y - fighter.position.y
    const dx = target.velocity.x - fighter.velocity.x
    const dy = target.velocity.y - fighter.velocity.y
    const a = dx * dx + dy * dy
    const b = 2 * (dx * x + dy * y)
    const c = x * x + y * y - reach * reach
    if (b * b < 4 * a * c) return Infinity
    if (a === 0) return Infinity
    const time1 = (-b - Math.sqrt(4 * a * c)) / 2 * a
    if (time1 > 0) return time1
    const time2 = (-b + Math.sqrt(4 * a * c)) / 2 * a
    if (time2 > 0) return time2
    return Infinity
  }

  getSwingTime (fighter: Fighter, target: Fighter): number {
    const fighterTargetDir = dirFromTo(fighter.position, target.position)
    const fighterToBlade = Vec2.sub(fighter.weapon.position, fighter.position)
    const swingVelocity = reject(fighter.weapon.velocity, fighterToBlade)
    const spin = swingVelocity.length() / fighterToBlade.length()
    const bladeAngle = vecToAngle(fighterToBlade)
    const targetAngle = vecToAngle(fighterTargetDir)
    const angleError = getAngleDiff(targetAngle, bladeAngle)
    if (angleError < 0.1 * Math.PI) return 0
    if (spin === 0) return Infinity
    return angleError / spin
  }

  spinIsSlow (): boolean {
    const distance = Vec2.distance(this.weapon.position, this.position)
    const direction = dirFromTo(this.position, this.weapon.position)
    const side = rotate(direction, 0.5 * Math.PI)
    const spinVec = project(this.weapon.velocity, side)
    if (distance < 0.8 * this.weapon.stringLength) return true
    if (spinVec.length() < 0.8 * this.weapon.maxSpeed) return true
    return false
  }

  getSpinMove (): Vec2 {
    const distance = Vec2.distance(this.weapon.position, this.position)
    if (distance === 0) return randomDir()
    const weaponDir = dirFromTo(this.position, this.weapon.position)
    const sideDir = rotate(weaponDir, 0.5 * Math.PI)
    const spinVec = normalize(project(this.weapon.velocity, sideDir))
    if (spinVec.length() === 0) {
      return randomDir()
    }
    return Vec2.combine(-1, spinVec, -0.1, weaponDir)
  }

  getHomeMove (): Vec2 {
    const distToHome = Vec2.distance(this.position, this.spawnPoint)
    const dirToHome = dirFromTo(this.position, this.spawnPoint)
    if (distToHome > 4) return dirToHome
    if (this.spinIsSlow()) return this.getSpinMove()
    return Vec2(0, 0)
  }

  getTargetPlayer (): Player | null {
    const players = [...this.guardArea.players.values()]
    const livingPlayers = players.filter(player => !player.dead)
    if (livingPlayers.length === 0) return null
    const distances = livingPlayers.map(player => {
      return Vec2.distance(player.position, this.position)
    })
    return livingPlayers[whichMin(distances)]
  }

  getNearestPlayer (): Player | null {
    const players = [...this.game.players.values()]
    const livingPlayers = players.filter(player => !player.dead)
    if (livingPlayers.length === 0) return null
    const distances = livingPlayers.map(player => {
      return Vec2.distance(player.position, this.position)
    })
    return livingPlayers[whichMin(distances)]
  }

  remove (): void {
    super.remove()
    this.dead = true
    this.game.guards.delete(this.id)
  }
}
