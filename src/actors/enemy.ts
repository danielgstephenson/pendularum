import { Vec2 } from 'planck'
import { Fighter } from './fighter'
import { Game } from '../game'
import { Bot } from '../pilots/bot'
import { Counter } from './counter'

export class Enemy extends Fighter {
  counter: Counter
  bot: Bot

  constructor (game: Game, position: Vec2) {
    super(game, position)
    this.team = 2
    this.bot = new Bot(this)
    this.counter = new Counter(this)
  }

  respawn (): void {
    this.bot.respawn()
  }
}
