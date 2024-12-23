import { Vec2 } from 'planck'
import { Input } from '../public/input'
import { normalize } from '../math'

export class InputSummary {
  move: Vec2
  swing = 0

  constructor (input: Input) {
    let x = 0
    let y = 0
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) y += 1
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) y -= 1
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) x -= 1
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) x += 1
    this.move = normalize(Vec2(x, y))
    let swing = 0
    if (input.isKeyDown('KeyJ')) swing += 1
    if (input.isKeyDown('KeyK')) swing -= 1
    this.swing = Math.sign(swing)
  }
}
