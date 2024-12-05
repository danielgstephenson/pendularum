import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { Bot } from '../bot'

export class Enemy extends Fighter {
  constructor (game: Game, position: Vec2) {
    super(game, position)
    this.team = 2
    this.bot = new Bot(this)
  }
}
