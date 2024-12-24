import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { GuardArea } from '../features/guardArea'
import { Player } from './player'
import { dirFromTo, getAngleDiff, vecToAngle, whichMin } from '../math'
import { Blade } from '../features/blade'

export class Guard extends Fighter {
  spawnPoint: Vec2
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
    if (this.dead && this.guardArea.players.size === 0) {
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
    const dirFromPlayer = Vec2.mul(-1, dirToPlayer)
    const targetDist = 0.7 * Blade.reach
    this.move = distToPlayer > targetDist ? dirToPlayer : dirFromPlayer
  }

  planSwing (): void {
    const player = this.getNearestPlayer()
    if (player == null) return
    const distToPlayer = Vec2.distance(this.position, player.position)
    const dirToPlayer = dirFromTo(this.position, player.position)
    const angleToPlayer = vecToAngle(dirToPlayer)
    const angleDiff = getAngleDiff(angleToPlayer, this.angle)
    if (distToPlayer < 20 * Blade.reach) {
      this.swing = Math.sign(angleDiff)
      return
    }
    const targetSpin = 2 * angleDiff
    this.swing = Math.sign(targetSpin - this.spin)
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
