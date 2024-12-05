import { Vec2 } from 'planck'
import { Fighter } from '../actors/fighter'

export class FighterSummary {
  position: Vec2
  bladePosition: Vec2
  id: string
  team: number

  constructor (fighter: Fighter) {
    this.position = fighter.body.getPosition()
    this.bladePosition = fighter.weapon.body.getPosition()
    this.id = fighter.id
    this.team = fighter.team
  }
}
