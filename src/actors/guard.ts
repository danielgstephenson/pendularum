import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { GuardArea } from '../features/guardArea'

export class Guard extends Fighter {
  spawnPoint: Vec2
  guardArea: GuardArea

  constructor (game: Game, position: Vec2) {
    super(game, position)
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
    this.body.setLinearVelocity(Vec2(0, 0))
  }

  preStep (): void {
    super.preStep()
  }

  postStep (): void {
    super.postStep()
    if (this.dead && this.guardArea.players.size === 0) {
      this.respawn()
    }
  }
}
