import path from 'path'
import fs from 'fs-extra'
import { parseSync as parseSvg } from 'svgson'
import { parseSVG as parseSvgPath, makeAbsolute } from 'svg-path-parser'
import { Vec2 } from 'planck'

export class Layout {
  points: Vec2[]
  backgroundColor: string

  constructor () {
    const dirname = path.dirname(__filename)
    const filePath = path.join(dirname, '../layout.svg')
    const fileExists = fs.existsSync(filePath)
    if (!fileExists) {
      throw new Error('../layout.svg does not exist')
    }
    const svgString = fs.readFileSync(filePath, 'utf-8')
    // console.log('svgString', svgString)
    const svg = parseSvg(svgString)
    // console.log('svg', svg)
    this.backgroundColor = svg.children[0].attributes.pagecolor
    console.log('backgroundColor', this.backgroundColor)
    const svgPath = svg.children[2].children[0].attributes.d
    console.log('path', svgPath)
    this.points = this.pathToPoints(svgPath)
    console.log('points', this.points)
  }

  pathToPoints (svgPath: string): Vec2[] {
    const actions = parseSvgPath(svgPath)
    const absoluteActions = makeAbsolute(actions)
    const pointActions = absoluteActions.filter(action => action.command !== 'closepath')
    const points = pointActions.map(action => Vec2(action.x, action.y))
    return points
  }
}
