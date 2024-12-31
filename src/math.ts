import { Vec2 } from 'planck'

export function range (a: number, b: number): number[] {
  return [...Array(b - a + 1).keys()].map(i => a + i)
}

export function normalize (vector: Vec2): Vec2 {
  const normalized = vector.clone()
  normalized.normalize()
  return normalized
}

export function dirToFrom (to: Vec2, from: Vec2): Vec2 {
  return normalize(Vec2.sub(to, from))
}

export function dirFromTo (from: Vec2, to: Vec2): Vec2 {
  return normalize(Vec2.sub(to, from))
}

export function vecToAngle (vector: Vec2): number {
  return Math.atan2(vector.y, vector.x)
}

export function angleToDir (angle: number): Vec2 {
  return Vec2(Math.cos(angle), Math.sin(angle))
}

export function getAngleDiff (toAngle: number, fromAngle: number): number {
  const v = { x: Math.cos(fromAngle), y: Math.sin(fromAngle) }
  const w = { x: Math.cos(toAngle), y: Math.sin(toAngle) }
  return Math.atan2(w.y * v.x - w.x * v.y, w.x * v.x + w.y * v.y)
}

export function rotate (vector: Vec2, angle: number): Vec2 {
  const x = vector.x * Math.cos(angle) - vector.y * Math.sin(angle)
  const y = vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
  return Vec2(x, y)
}

export function randomDir (): Vec2 {
  return rotate(Vec2(1, 0), 2 * Math.PI * Math.random())
}

export function clamp (a: number, b: number, x: number): number {
  return Math.max(a, Math.min(x, b))
}

export function clampVec (vector: Vec2, maxLength: number): Vec2 {
  const length = vector.length()
  if (length < maxLength) return vector
  const direction = normalize(vector)
  return Vec2.mul(direction, maxLength)
}

export function whichMax (array: number[]): number {
  let indexMax = 0
  let valueMax = array[0]
  array.forEach((value, index) => {
    if (value > valueMax) {
      indexMax = index
      valueMax = value
    }
  })
  return indexMax
}

export function whichMin (array: number[]): number {
  const negArray = array.map(x => -x)
  return whichMax(negArray)
}

export function choose<type> (array: type[]): type {
  return array[Math.floor(Math.random() * array.length)]
}

export function project (a: Vec2, b: Vec2): Vec2 {
  const ab = Vec2.dot(a, b)
  const bb = Vec2.dot(b, b)
  if (ab === 0 || bb === 0) return Vec2(0, 0)
  return Vec2.mul(ab / bb, b)
}

export function reject (a: Vec2, b: Vec2): Vec2 {
  return Vec2.sub(a, project(a, b))
}

export const twoPi = 2 * Math.PI
