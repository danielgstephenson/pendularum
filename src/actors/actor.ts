import { BodyDef, Body, Fixture, Vec2 } from 'planck'
import { Game } from '../game'
import { clampVec } from '../math'

export class Actor {
  static count = 0
  game: Game
  body: Body
  id: string
  label = 'actor'
  removed = false
  maxSpeed = Infinity
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)

  constructor (game: Game, bodyDef: BodyDef) {
    Actor.count += 1
    this.id = String(Actor.count)
    this.game = game
    this.body = this.game.world.createBody(bodyDef)
    this.body.setUserData(this)
    this.game.actors.set(this.id, this)
    this.updateConfiguration()
  }

  getFixtures (): Fixture[] {
    const fixtures = []
    for (let fixture = this.body.getFixtureList(); fixture != null; fixture = fixture.getNext()) {
      fixtures.push(fixture)
    }
    return fixtures
  }

  preStep (): void {}

  postStep (): void {
    this.updateConfiguration()
    if (this.removed) {
      this.game.world.destroyBody(this.body)
    }
  }

  remove (): void {
    this.game.actors.delete(this.id)
    this.removed = true
  }

  updateConfiguration (): void {
    this.position = this.body.getPosition()
    this.velocity = clampVec(this.body.getLinearVelocity(), this.maxSpeed)
    this.body.setLinearVelocity(this.velocity)
  }
}
