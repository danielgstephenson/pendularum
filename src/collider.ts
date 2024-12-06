import { Contact } from 'planck'
import { Game } from './game'
import { Feature } from './features/feature'
import { Fighter } from './actors/fighter'
import { Star } from './actors/star'
import { Weapon } from './actors/weapon'
import { Counter } from './actors/counter'
import { Ally } from './actors/ally'

export class Collider {
  game: Game

  constructor (game: Game) {
    this.game = game
    this.game.world.on('pre-solve', contact => this.preSolve(contact))
    this.game.world.on('begin-contact', contact => this.beginContact(contact))
    this.game.world.on('end-contact', contact => this.endContact(contact))
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
      if (actorA instanceof Ally && actorB instanceof Star) {
        actorA.player.spawnPoint = actorB.position
      }
      if (actorA instanceof Ally && actorB instanceof Counter) {
        actorB.playerCount += 1
        console.log('playerCount', actorB.playerCount)
      }
    })
  }

  endContact (contact: Contact): void {
    const a = contact.getFixtureA().getUserData() as Feature
    const b = contact.getFixtureB().getUserData() as Feature
    const pairs = [[a, b], [b, a]]
    pairs.forEach(pair => {
      const featureA = pair[0]
      const featureB = pair[1]
      const actorA = featureA.actor
      const actorB = featureB.actor
      if (actorA instanceof Ally && actorB instanceof Counter) {
        actorB.playerCount -= 1
        console.log('playerCount', actorB.playerCount)
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
      if (actorA instanceof Fighter && actorA.dead) {
        contact.setEnabled(false)
        return
      }
      if (actorB instanceof Fighter && actorB.dead) {
        contact.setEnabled(false)
        return
      }
      if (actorA instanceof Weapon && actorA.fighter.dead) {
        contact.setEnabled(false)
        return
      }
      if (actorB instanceof Weapon && actorB.fighter.dead) {
        contact.setEnabled(false)
        return
      }
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
