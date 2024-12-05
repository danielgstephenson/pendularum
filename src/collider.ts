import { Contact } from 'planck'
import { Game } from './game'
import { Feature } from './features/feature'
import { Fighter } from './actors/fighter'
import { Star } from './actors/star'
import { Weapon } from './actors/weapon'

export class Collider {
  game: Game

  constructor (game: Game) {
    this.game = game
    this.game.world.on('begin-contact', contact => this.beginContact(contact))
    this.game.world.on('pre-solve', contact => this.preSolve(contact))
  }

  beginContact (contact: Contact): void {
    const a = contact.getFixtureA().getUserData() as Feature
    const b = contact.getFixtureB().getUserData() as Feature
    const pairs = [[a, b], [b, a]]
    pairs.forEach(pair => {
      const featureA = pair[0]
      const featureB = pair[1]
      const actorA = featureA.actor
      const actorB = featureB.actor
      if (actorA instanceof Fighter && actorB instanceof Star) {
        if (actorA.player == null) return
        actorA.player.spawnPoint = actorB.position
      }
    })
  }

  preSolve (contact: Contact): void {
    const a = contact.getFixtureA().getUserData() as Feature
    const b = contact.getFixtureB().getUserData() as Feature
    const pairs = [[a, b], [b, a]]
    pairs.forEach(pair => {
      const featureA = pair[0]
      const featureB = pair[1]
      const actorA = featureA.actor
      const actorB = featureB.actor
      if (actorA instanceof Fighter && actorB instanceof Weapon) {
        contact.setEnabled(false)
        const fighter = actorA
        const weapon = actorB
        if (fighter.team !== weapon.fighter.team) {
          fighter.die()
        }
      }
    })
  }
}
