import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { GuardArea } from '../features/guardArea'
import { Player } from './player'
import { dirFromTo, getAngleDiff, normalize, project, randomDir, rotate, twoPi, vecToAngle, whichMin } from '../math'
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
    if (this.dead) return Vec2(0, 0)
    const player = this.getTargetPlayer()
    if (player == null) return this.getHomeMove()
    const distToPlayer = Vec2.distance(this.position, player.position)
    if (distToPlayer > 50) {
      return this.spinIsSlow() ? this.getSwingMove() : this.getHomeMove()
    }
    if (distToPlayer > 1.1 * this.reach) {
      return this.spinIsSlow() ? this.getSwingMove() : this.getChaseMove(player, this.reach)
    }
    return this.getFightMove(player)
  }

  getFightMove (player: Player): Vec2 {
    const distance = Vec2.distance(this.position, player.position)
    if (distance < 0.9 * this.reach) return dirFromTo(player.position, this.position)
    if (this.spinIsSlow()) return dirFromTo(player.position, this.position)
    const reachTime = this.getReachTime(this, player)
    const swingTimes = this.getSwingTimes(this, player)
    const playerSwingTimes = this.getSwingTimes(player, this)
    const intercept = reachTime + 0.1 < swingTimes[0] && swingTimes[0] + 0.1 < playerSwingTimes[0]
    const counter = playerSwingTimes[0] + 0.1 < reachTime && swingTimes[1] + 0.1 < playerSwingTimes[1]
    if (intercept || counter) return this.getChaseMove(player, 0.9 * this.reach)
    return this.getChaseMove(player, 1.2 * this.reach)
  }

  getChaseMove (player: Player, targetDistance: number): Vec2 {
    const dirFromPlayer = dirFromTo(player.position, this.position)
    const targetPosition = Vec2.combine(1, player.position, targetDistance, dirFromPlayer)
    const dirToTarget = dirFromTo(this.position, targetPosition)
    const targetVelocity = Vec2.combine(0.5, player.velocity, this.maxSpeed, dirToTarget)
    return dirFromTo(this.velocity, targetVelocity)
  }

  getSwingTimes (fighter: Fighter, other: Fighter): number[] {
    const fighterOtherDir = dirFromTo(fighter.position, other.position)
    const fighterToBladeDist = Vec2.distance(fighter.weapon.position, fighter.position)
    const fighterToBladeDir = dirFromTo(fighter.position, fighter.weapon.position)
    const tangent = rotate(fighterToBladeDir, 0.5 * Math.PI)
    const spin = Vec2.dot(fighter.weapon.velocity, tangent) / fighterToBladeDist
    const bladeAngle = vecToAngle(fighterToBladeDir)
    const targetAngle = vecToAngle(fighterOtherDir)
    const angleDiff = getAngleDiff(targetAngle, bladeAngle)
    if (spin === 0) return [Infinity, Infinity]
    const absAngleDiff = Math.abs(angleDiff)
    const absSpin = Math.abs(spin)
    if (absAngleDiff < 0.02 * Math.PI) return [0, twoPi / absSpin]
    if (spin * angleDiff > 0) return [absAngleDiff / absSpin, absAngleDiff + twoPi / absSpin]
    const bigAbsAngleDiff = 2 * Math.PI - absAngleDiff
    return [bigAbsAngleDiff / absSpin, bigAbsAngleDiff + twoPi / absSpin]
  }

  getReachTime (fighter: Fighter, other: Fighter): number {
    const distance = Vec2.distance(fighter.position, other.position)
    if (distance <= fighter.reach) return 0
    const x = other.position.x - fighter.position.x
    const y = other.position.y - fighter.position.y
    const dx = other.velocity.x - fighter.velocity.x
    const dy = other.velocity.y - fighter.velocity.y
    const dDistance = (x * dx + y * dy) / distance
    if (dDistance >= 0) return 2
    return (fighter.reach - distance) / dDistance
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

  getSwingMove (): Vec2 {
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
    if (this.spinIsSlow()) return this.getSwingMove()
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
