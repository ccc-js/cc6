export function steps(from, to, step = 1) {
  var a = []
  for (var t = from; t <= to; t += step) {
    a.push(t)
  }
  return a
}

export  function curveData(f, from = -10, to = 10, step = 0.1) {
  var x = steps(from, to, step)
  var y = x.map(f)
  console.log('curveData:{x,y}=', x, y)
  return {type: 'curve', x: x, y: y}
}