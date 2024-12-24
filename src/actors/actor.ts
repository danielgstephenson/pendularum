import { BodyDef, Body, Fixture } from 'planck'
import { Game } from '../game'

export class Actor {
  static count = 0
  game: Game
  body: Body
  id: string
  label = 'actor'
  removed = false

  constructor (game: Game, bodyDef: BodyDef) {
    Actor.count += 1
    this.id = String(Actor.count)
    this.game = game
    this.body = this.game.world.createBody(bodyDef)
    this.body.setUserData(this)
    this.game.actors.set(this.id, this)
  }

  getFixtures (): Fixture[] {
    const fixtures = []
    for (let fixture = this.body.getFixtureList(); fixture != null; fixture = fixture.getNext()) {
      fixtures.push(fixture)
    }
    return fixtures
  }

  preStep (): void {
  }

  postStep (): void {
    if (this.removed) {
      this.game.world.destroyBody(this.body)
    }
  }

  remove (): void {
    this.game.actors.delete(this.id)
    this.removed = true
  }
}
