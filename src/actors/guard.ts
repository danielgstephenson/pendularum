import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { GuardArea } from '../features/guardArea'
import { Player } from './player'
import { clamp, dirFromTo, getAngleDiff, normalize, project, rotate, vecToAngle, whichMin } from '../math'
import { Blade } from '../features/blade'
import { Torso } from '../features/torso'

export class Guard extends Fighter {
  spawnPoint: Vec2
  guardArea: GuardArea
  pullBack = 0.0 * Math.PI
  swingDistance = Blade.reach + Torso.radius + 1

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
    this.pullBack = Math.sign(Math.random() - 0.5) * this.pullBack
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
    this.planSwing()
    this.planMove()
  }

  planMove (): void {
    const player = this.getTargetPlayer()
    if (player == null) {
      const distToHome = Vec2.distance(this.position, this.spawnPoint)
      const dirToHome = dirFromTo(this.position, this.spawnPoint)
      this.move = distToHome > 1 ? dirToHome : Vec2(0, 0)
      return
    }
    const distToPlayer = Vec2.distance(this.position, player.position)
    const dirToPlayer = dirFromTo(this.position, player.position)
    const dirFromPlayerBlade = dirFromTo(player.bladePosition, this.position)
    const sideDir = rotate(dirToPlayer, 0.5 * Math.PI)
    const circleDir = normalize(project(dirFromPlayerBlade, sideDir))
    const circleWeight = clamp(0, 1, (2 + Blade.reach - distToPlayer) / 5)
    const moveDir = Vec2.combine(circleWeight, circleDir, 1 - circleWeight, dirToPlayer)
    this.move = moveDir
  }

  planSwing (): void {
    const player = this.getNearestPlayer()
    if (player == null) return
    const distToPlayer = Vec2.distance(this.position, player.position)
    const dirToPlayer = dirFromTo(this.position, player.position)
    const angleToPlayer = vecToAngle(dirToPlayer)
    const playerBladePosition = Vec2.combine(0.1, player.position, 0.9, player.bladePosition)
    const blockAngle = vecToAngle(dirFromTo(this.position, playerBladePosition))
    // const blockAngle = angleToPlayer + 0.2 * Math.PI * Math.sign(player.spin)
    const attackSwing = this.getHardSwing(angleToPlayer)
    const blockSwing = this.getSoftSwing(blockAngle)
    this.swing = distToPlayer < this.swingDistance ? attackSwing : blockSwing
  }

  getSoftSwing (targetAngle: number): number {
    const angleDiff = getAngleDiff(targetAngle, this.angle)
    const targetSpin = 10 * angleDiff
    return Math.sign(targetSpin - this.spin)
  }

  getHardSwing (targetAngle: number): number {
    const angleDiff = getAngleDiff(targetAngle, this.angle)
    return Math.sign(angleDiff)
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
