import path from 'path'
import fs from 'fs-extra'
import { INode, parseSync as parseSvg } from 'svgson'
import { parseSVG as parseSvgPath, makeAbsolute } from 'svg-path-parser'
import { Vec2 } from 'planck'
import { LayoutSummary } from './summaries/layoutSummary'

export class Layout {
  svg: INode
  boundary: Vec2[]
  gaps: Vec2[][]
  guardAreas: Vec2[][]
  starPoints: Vec2[] = []
  guardPoints: Vec2[] = []
  summary: LayoutSummary

  constructor () {
    const dirname = path.dirname(__filename)
    const filePath = path.join(dirname, '../layout.svg')
    const fileExists = fs.existsSync(filePath)
    if (!fileExists) {
      throw new Error('../layout.svg does not exist')
    }
    const svgString = fs.readFileSync(filePath, 'utf-8')
    this.svg = parseSvg(svgString)
    this.boundary = this.getBorder()
    this.gaps = this.getGaps()
    this.guardAreas = this.getGuardAreas()
    this.starPoints = this.getStarPoints()
    this.guardPoints = this.getGuardPoints()
    this.summary = new LayoutSummary(this)
  }

  getStarPoints (): Vec2[] {
    const starLayer = this.svg.children[6]
    const starPoints = starLayer.children.map(child => {
      const x = Number(child.attributes.cx)
      const y = Number(child.attributes.cy)
      return Vec2(x, -y)
    })
    return starPoints
  }

  getGuardPoints (): Vec2[] {
    const guardPointLayer = this.svg.children[5]
    const guardPoints = guardPointLayer.children.map(guardCircle => {
      const x = Number(guardCircle.attributes.cx)
      const y = Number(guardCircle.attributes.cy)
      return Vec2(x, -y)
    })
    guardPointLayer.children.forEach(guardCircle => {
      if (guardCircle.children.length === 0) return
      if (guardCircle.children[0].children.length === 0) return
      console.log('Description:')
      const rawString = guardCircle.children[0].children[0].value
      const jsonString = rawString.replaceAll('&quot;', '"')
      console.log(rawString)
      console.log(jsonString)
      console.log(JSON.parse(jsonString))
    })
    return guardPoints
  }

  getGuardAreas (): Vec2[][] {
    const guardAreaLayer = this.svg.children[4]
    const guardAreas = guardAreaLayer.children.map(gapSvg => {
      const guardAreaPath = gapSvg.attributes.d
      return this.pathToPoints(guardAreaPath)
    })
    return guardAreas
  }

  getGaps (): Vec2[][] {
    const gapLayer = this.svg.children[3]
    const gaps = gapLayer.children.map(gapSvg => {
      const gapPath = gapSvg.attributes.d
      return this.pathToPoints(gapPath)
    })
    return gaps
  }

  getBorder (): Vec2[] {
    const borderPath = this.svg.children[2].children[0].attributes.d
    return this.pathToPoints(borderPath)
  }

  getBackroundColor (): string {
    return this.svg.children[0].attributes.pagecolor
  }

  pathToPoints (svgPath: string): Vec2[] {
    const actions = parseSvgPath(svgPath)
    const absoluteActions = makeAbsolute(actions)
    const pointActions = absoluteActions.filter(action => action.command !== 'closepath')
    const points = pointActions.map(action => Vec2(action.x, -action.y))
    return points
  }
}
