import { Vec2 } from 'planck'
import { Input } from '../public/input'
import { normalize } from '../math'

export class InputSummary {
  move: Vec2
  swing = 0

  constructor (input: Input) {
    let x = 0
    let y = 0
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp') || input.isKeyDown('KeyI')) y += 1
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown') || input.isKeyDown('KeyK')) y -= 1
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyJ')) x -= 1
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight') || input.isKeyDown('KeyL')) x += 1
    this.move = normalize(Vec2(x, y))
  }
}
