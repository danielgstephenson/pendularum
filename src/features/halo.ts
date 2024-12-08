import { Circle, Contact, Vec2 } from 'planck'
import { Feature } from './feature'
import { Fighter } from '../actors/fighter'
import { Border } from './border'
import { dirToFrom, whichMin } from '../math'
import { Player } from '../actors/player'
import { Torso } from './torso'
import { Weapon } from '../actors/weapon'
import { Blade } from './blade'
import { Guard } from '../actors/guard'

export class Halo extends Feature {
  static radius = 25
  fighter: Fighter
  alive = true
  wallPoints: Vec2[] = []
  wallDistance: number = Infinity
  wallAway: Vec2 = Vec2(0, 0)
  guards: Guard[] = []
  guardDistance: number = Infinity
  nearGuard?: Guard
  players: Player[] = []
  playerDistance: number = Infinity
  nearPlayer?: Player
  playerWeapons: Weapon[] = []
  playerWeaponDistance: number = Infinity
  nearPlayerWeapon?: Weapon

  constructor (fighter: Fighter) {
    super(fighter, {
      shape: new Circle(Vec2(0, 0), Halo.radius),
      density: 0.0000001,
      friction: 0,
      restitution: 0
    })
    this.fighter = fighter
    this.label = 'halo'
  }

  onCollide (contact: Contact): void {
    const featureA = contact.getFixtureA().getUserData() as Feature
    const featureB = contact.getFixtureB().getUserData() as Feature
    const otherFeature = featureA === this ? featureB : featureA
    const worldManifold = contact.getWorldManifold(null)
    if (worldManifold == null) return
    if (worldManifold.points.length === 0) return
    const point = worldManifold.points[0]
    if (otherFeature instanceof Border) {
      this.wallPoints.push(Vec2(point.x, point.y))
    }
    if (otherFeature instanceof Torso && otherFeature.actor instanceof Guard) {
      this.guards.push(otherFeature.actor)
    }
    if (otherFeature instanceof Torso && otherFeature.actor instanceof Player) {
      this.players.push(otherFeature.actor)
    }
    if (otherFeature instanceof Blade && otherFeature.weapon.fighter instanceof Player) {
      this.playerWeapons.push(otherFeature.weapon)
    }
  }

  preStep (): void {
    this.wallPoints = []
    this.guards = []
    this.players = []
    this.playerWeapons = []
  }

  postStep (): void {
    const position = this.fighter.body.getPosition()
    if (this.wallPoints.length > 0) {
      const distances = this.wallPoints.map(point => Vec2.distance(position, point))
      this.wallDistance = Math.min(...distances)
      const nearPoint = this.wallPoints[whichMin(distances)]
      this.wallAway = dirToFrom(position, nearPoint)
    }
    if (this.guards.length > 0) {
      const points = this.guards.map(player => player.body.getPosition())
      const distances = points.map(point => Vec2.distance(position, point))
      this.guardDistance = Math.min(...distances)
      this.nearGuard = this.guards[whichMin(distances)]
    }
    if (this.players.length > 0) {
      const points = this.players.map(player => player.body.getPosition())
      const distances = points.map(point => Vec2.distance(position, point))
      this.playerDistance = Math.min(...distances)
      this.nearPlayer = this.players[whichMin(distances)]
    }
    if (this.playerWeapons.length > 0) {
      const points = this.playerWeapons.map(player => player.body.getPosition())
      const distances = points.map(point => Vec2.distance(position, point))
      this.playerWeaponDistance = Math.min(...distances)
      this.nearPlayerWeapon = this.playerWeapons[whichMin(distances)]
    }
  }
}
