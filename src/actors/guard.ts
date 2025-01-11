import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { GuardArea } from '../features/guardArea'
import { Player } from './player'
import { clampVec, dirFromTo, getAngleDiff, project, randomDir, range, rotate, twoPi, vecToAngle, whichMax, whichMin } from '../math'
import { Torso } from '../features/torso'

export class Guard extends Fighter {
  guardArea: GuardArea
  safeDistance: number
  closeDistance: number
  randomDir = randomDir()

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
    this.weapon.body.setLinearVelocity(randomDir())
    this.guardArea = guardAreas[0]
    this.safeDistance = 3 * this.reach
    this.closeDistance = 0.5 * this.reach
    console.log('guard', this.game.guards.size)
    this.respawn()
  }

  respawn (): void {
    super.respawn()
    this.body.setPosition(this.spawnPoint)
    this.randomDir = randomDir()
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
    this.moveDir = this.getMove()
  }

  getMove (): Vec2 {
    if (this.dead) return Vec2(0, 0)
    const player = this.getTargetPlayer()
    if (player == null) return this.getHomeMove()
    const distToPlayer = Vec2.distance(this.position, player.position)
    if (distToPlayer > 50) return this.getHomeMove()
    if (distToPlayer > this.safeDistance) return this.getChaseMove(player)
    return this.getFightMove(player)
  }

  getHomeMove (): Vec2 {
    const distToHome = Vec2.distance(this.position, this.spawnPoint)
    const dirToHome = dirFromTo(this.position, this.spawnPoint)
    if (distToHome > 5) return this.avoidWalls(dirToHome)
    if (this.spinIsSlow()) return this.getSwingMove()
    return Vec2(0, 0)
  }

  getChaseMove (player: Player): Vec2 {
    if (this.spinIsSlow()) return this.getSwingMove()
    return this.getRushMove(this.position, player.position, this.velocity, player.velocity, 1.2)
  }

  getFightMove (player: Player): Vec2 {
    const fromPlayer = dirFromTo(player.position, this.position)
    if (this.halo.wallPoints.length > 0) {
      return this.avoidWalls(fromPlayer)
    }
    const rushLevels = [2, 1, 0, -1, -2]
    let minAdvantage = -1
    const firstSafeRush = rushLevels.find(guardRush => {
      const advantages = rushLevels.map(playerRush => {
        return this.getAdvantage(player, guardRush, playerRush)
      })
      minAdvantage = Math.min(...advantages)
      return minAdvantage >= 0.5
    })
    const rushLevel = firstSafeRush ?? Math.min(...rushLevels)
    const playerTargetAngle = vecToAngle(dirFromTo(player.position, this.position))
    const guardTargetAngle = vecToAngle(dirFromTo(this.position, player.position))
    const playerSwingTime = this.getSwingTime(player.angle, playerTargetAngle, player.spin)
    const guardSwingTime = this.getSwingTime(this.angle, guardTargetAngle, this.spin)
    console.log(playerSwingTime.toFixed(2), guardSwingTime.toFixed(2), rushLevel, minAdvantage.toFixed(2))
    return this.getRushMove(this.position, player.position, this.velocity, player.velocity, rushLevel)
  }

  avoidWalls (targetDir: Vec2): Vec2 {
    if (this.halo.wallPoints.length === 0) return targetDir
    const distances = this.halo.wallPoints.map(wallPoint => {
      return Vec2.distance(this.position, wallPoint)
    })
    const nearWallPoint = this.halo.wallPoints[whichMin(distances)]
    const fromWallDir = dirFromTo(nearWallPoint, this.position)
    if (Vec2.dot(fromWallDir, targetDir) >= 0) return targetDir
    const options = [rotate(fromWallDir, 0.5 * Math.PI), rotate(fromWallDir, -0.5 * Math.PI)]
    const optionDots = options.map(option => Vec2.dot(option, targetDir))
    const sideDir = options[whichMax(optionDots)]
    return sideDir
  }

  getAdvantage (player: Fighter, guardRush: number, playerRush: number): number {
    let advantage = 1
    const maxTime = 5
    const dt = 0.02
    const stepCount = Math.ceil(maxTime / dt)
    const reachRange = this.reach - Torso.radius
    let time = 0
    const playerPosition = player.position.clone()
    const guardPosition = this.position.clone()
    let playerVelocity = player.velocity.clone()
    let guardVelocity = this.velocity.clone()
    range(0, stepCount).some(() => {
      const distance = Vec2.distance(guardPosition, playerPosition)
      if (distance < reachRange) {
        const playerAngle = player.angle + time * player.spin
        const guardAngle = this.angle + time * this.spin
        const playerTargetAngle = vecToAngle(dirFromTo(playerPosition, guardPosition))
        const guardTargetAngle = vecToAngle(dirFromTo(guardPosition, playerPosition))
        const playerSwingTime = this.getSwingTime(playerAngle, playerTargetAngle, player.spin)
        const guardSwingTime = this.getSwingTime(guardAngle, guardTargetAngle, this.spin)
        advantage = playerSwingTime - guardSwingTime
        return true
      }
      const playerMove = this.getRushMove(playerPosition, guardPosition, playerVelocity, guardVelocity, playerRush)
      const guardMove = this.getRushMove(guardPosition, playerPosition, guardVelocity, playerVelocity, guardRush)
      playerVelocity.x += playerMove.x * dt
      playerVelocity.y += playerMove.y * dt
      guardVelocity.x += guardMove.x * dt
      guardVelocity.y += guardMove.y * dt
      playerVelocity = clampVec(playerVelocity, player.maxSpeed)
      guardVelocity = clampVec(guardVelocity, this.maxSpeed)
      playerPosition.x += playerVelocity.x * dt
      playerPosition.y += playerVelocity.y * dt
      guardPosition.x += guardVelocity.x * dt
      guardPosition.y += guardVelocity.y * dt
      time += dt
      return false
    })
    return advantage
  }

  spinIsSlow (): boolean {
    return Math.abs(this.spin) < 1.5
  }

  getSwingTime (angle: number, targetAngle: number, spin: number): number {
    const angleDifference = getAngleDiff(targetAngle, angle)
    const smallAngleDistance = Math.abs(angleDifference)
    const largeAngleDistance = twoPi - smallAngleDistance
    const angleDistance = spin * angleDifference > 0 ? smallAngleDistance : largeAngleDistance
    const hitAngleDistange = Math.max(0, angleDistance - Math.PI / 8)
    return hitAngleDistange / Math.abs(spin)
  }

  getRushMove (myPosition: Vec2, otherPosition: Vec2, myVelocity: Vec2, otherVelocity: Vec2, rush: number): Vec2 {
    const selfToOther = dirFromTo(myPosition, otherPosition)
    const targetVelocity = Vec2.combine(1, otherVelocity, rush * this.maxSpeed, selfToOther)
    return dirFromTo(myVelocity, targetVelocity)
  }

  getSwingMove (): Vec2 {
    const distance = Vec2.distance(this.weapon.position, this.position)
    if (distance === 0) return randomDir()
    const toWeaponDir = dirFromTo(this.position, this.weapon.position)
    const sideDir = rotate(toWeaponDir, 0.5 * Math.PI)
    const spinVec = Vec2.mul(-1, project(this.weapon.velocity, sideDir))
    const swingMove = spinVec.length() === 0 ? this.randomDir : spinVec
    return this.avoidWalls(swingMove)
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
