import { curveData } from './js6.mjs'

export function curve(id, label, f, from, to, step) {
  let {x, y} = curveData(f, from, to, step)
  let g = {bindto: id, data: { 
    x: 'x', 
    columns: [ 
      ['x'].concat(x), 
      [label].concat(y)
  ]}}
  console.log('g=', g)
  return c3.generate(g)
}