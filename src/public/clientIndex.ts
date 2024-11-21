import { Client } from './client'
// import svgson from 'svgson'
// import svgPathParser from 'svg-path-parser'

// const layoutElement = document.getElementById('layoutElement')
// if (!(layoutElement instanceof HTMLObjectElement)) {
//   throw new Error('layoutElement is not an HTMLObjectElement')
// }
// console.log('layoutElement', layoutElement)
// layoutElement.addEventListener('load', () => {
//   if (layoutElement.contentDocument == null) {
//     throw new Error('layoutElement.contentDocument == null')
//   }
//   console.log('layoutElement.contentDocument', layoutElement.contentDocument)
//   const documentElement = layoutElement.contentDocument.documentElement
//   const svg = svgson.parseSync(documentElement.outerHTML)
//   const path = svg.children[0].children[0].attributes.d
//   console.log('path', path)
//   const commands = svgPathParser.parseSVG(path)
//   svgPathParser.makeAbsolute(commands)
//   console.log('commands', commands)
//   void new Client()
// })

void new Client()
