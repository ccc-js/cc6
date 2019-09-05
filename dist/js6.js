(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./src/ai6')
},{"./src/ai6":4}],2:[function(require,module,exports){
var uu6 = require('../../uu6')

class GeneticAlgorithm {
  constructor() {
    this.population = []    // 族群
    this.mutationRate = 0.1 // 突變率
  }

  run(size, maxGen) { // 遺傳演算法主程式
    this.population = this.newPopulation(size); // 產生初始族群
    for (let t = 0; t < maxGen; t++) { // 最多產生 maxGen 代
      console.log("============ generation", t, "===============")
      this.population = this.reproduction(this.population); // 產生下一代
      this.dump(); // 印出目前族群
    }
  }
  
  newPopulation(size) {
    var newPop=[];
    for (var i=0; i<size; i++) {
      var chromosome = this.randomChromosome(); // 隨機產生新染色體
      newPop[i] = { chromosome:chromosome, 
                 fitness:this.calcFitness(chromosome) };
    }
    newPop.sort(GeneticAlgorithm.fitnessCompare); // 對整個族群進行排序
    return newPop;
  }
  
  static fitnessCompare(c1,c2) { return c1.fitness - c2.fitness }
  
  // 輪盤選擇法: 隨機選擇一個個體 -- 落點在 i*i ~ (i+1)*(i+1) 之間都算是 i
  selection() {
    var n = this.population.length;
    var shoot  = uu6.randomInt(0, n*n/2);
    var select = Math.floor(Math.sqrt(shoot*2));
    return this.population[select];
  }
  
  // 產生下一代
  reproduction() {
    var newPop = []
    for (var i = 0; i < this.population.length; i++) {
      var parent1 = this.selection(); // 選取父親
      var parent2 = this.selection(); // 選取母親
      var chromosome = this.crossover(parent1, parent2); // 父母交配，產生小孩
      var prob = uu6.random(0,1);
      if (prob < this.mutationRate) // 有很小的機率
        chromosome = this.mutate(chromosome); // 小孩會突變
      newPop[i] = { chromosome:chromosome, fitness:this.calcFitness(chromosome) }; // 將小孩放進下一代族群裡
    }
    newPop.sort(GeneticAlgorithm.fitnessCompare); // 對新一代根據適應性（分數）進行排序
    return newPop;
  }
  
  dump() { // 印出一整代成員
    for (var i=0; i<this.population.length; i++) {
      console.log(i, this.population[i]);
    }
  }
}

module.exports = GeneticAlgorithm

},{"../../uu6":61}],3:[function(require,module,exports){
class Solution { // 解答的物件模版 (類別)
  constructor(v) {
    this.v = v                // 參數 v 為解答的資料結構
  }

  // 以下兩個函數至少需要覆蓋掉一個，否則會無窮遞迴
  height() { // 爬山演算法的高度函數
    return -1*this.energy()               // 高度 = -1 * 能量
  }

  energy() { // 尋找最低點的能量函數
    return -1*this.height()               // 能量 = -1 * 高度
  }
}

Solution.prototype.step = 0.01          // 每一小步預設走的距離

module.exports = Solution   // 將解答類別匯出。
},{}],4:[function(require,module,exports){
const ai6 = module.exports = {
  gd: require('./gradientDescendent'),
  hillClimbing: require('./hillClimbing'),
  simulatedAnnealing: require('./simulatedAnnealing'),
  GeneticAlgorithm: require('./GeneticAlgorithm'),
  Solution: require('./Solution'),
}

ai6.gradientDescendent = ai6.gd


},{"./GeneticAlgorithm":2,"./Solution":3,"./gradientDescendent":5,"./hillClimbing":6,"./simulatedAnnealing":7}],5:[function(require,module,exports){
const ma6 = require('../../ma6')
const uu6 = require('../../uu6')
const {V} = ma6

// 使用梯度下降法尋找函數最低點
const gradientDescendent = function (f, p0, args={}) {
  let args2 = uu6.defaults(args, {step:0.01, stepLen:0.01, gap:0.0001, debug:true})
  let {step, stepLen, gap, debug} = args2
  let p = p0
  let e0 = Number.POSITIVE_INFINITY
  while (true) {
    let e = f(p)
    if (debug) console.log('p=', p.toString(), 'f(p)=', e) // .toString()
    if (e > e0 - gap) break
    let g = ma6.grad(f, p) // 計算梯度 gp
    if (debug) console.log('  g=', g.toString()) // .toString()
    p = V.add(p, V.mul(g, -1*stepLen))
    e0 = e
  }
  return p // 傳回最低點！
}

module.exports = gradientDescendent

},{"../../ma6":11,"../../uu6":61}],6:[function(require,module,exports){
function hillClimbing(s, maxGens=1000000, maxFails=1000, debug=true) { // 爬山演算法的主體函數
  if (debug) console.log("start: %s", s); // 印出初始解
  var fails = 0;          // 失敗次數設為 0
  // 當代數 gen<maxGen，且連續失敗次數 fails < maxFails 時，就持續嘗試尋找更好的解。
  for (var gens=0; gens<maxGens && fails < maxFails; gens++) {
    var snew = s.neighbor();           // 取得鄰近的解
    var sheight = s.height();          // sheight=目前解的高度
    var nheight = snew.height();       // nheight=鄰近解的高度
    // console.log("%d: %s", gens, snew);  //   印出新的解
    if (nheight > sheight) {
      if (debug) console.log("%d: %s", gens, snew);  //   印出新的解
      s = snew;                        //   就移動過去
      fails = 0;                       //   移動成功，將連續失敗次數歸零
    } else if (nheight < sheight) {          // 如果鄰近解比目前解更好
      fails++;                         //   將連續失敗次數加一
    }
  }
  if (debug) console.log("solution: %s", s);      // 印出最後找到的那個解
  return s;                            //   然後傳回。
}

module.exports = hillClimbing          // 將爬山演算法的類別匯出。
},{}],7:[function(require,module,exports){
function prob(e, enew, T) { // 模擬退火法的機率函數
  if (enew < e) 
    return 1;
  else
    return Math.exp((e-enew)/T);              
}

function simulatedAnnealing(s, maxGens) { // 模擬退火法的主要函數
  var sbest = s;                              // sbest:到目前為止的最佳解
  var ebest = s.energy();                     // ebest:到目前為止的最低能量
  var T     = 100;                            // 從 100 度開始降溫
  for (var gens=0; gens<maxGens; gens++) {    // 迴圈，最多作 maxGens 這麼多代。
    var snew = s.neighbor();                  // 取得鄰居解
    var e    = s.energy();                    // e    : 目前解的能量
    var enew = snew.energy();                 // enew : 鄰居解的能量
    T  = T * 0.999;                           // 每次降低一些溫度
    if (prob(e, enew, T) > Math.random()) { // 根據溫度與能量差擲骰子，若通過
      s = snew;                               // 則移動到新的鄰居解
      console.log("%d T=%s %s", gens, T.toFixed(3), s.toString()); // 印出觀察
    }
    if (enew < ebest) {                       // 如果新解的能量比最佳解好，則更新最佳解。
      sbest = snew;
      ebest = enew;
    }
  }
  console.log("solution: %s", sbest.toString()); // 印出最佳解
  return sbest;                                  // 傳回最佳解
}

module.exports = simulatedAnnealing;             // 將模擬退火演算法匯出。
},{}],8:[function(require,module,exports){
module.exports = {
  // MapVector: require('../ma6/src/MapVector'),
}

},{}],9:[function(require,module,exports){
js6 = require('./index')

},{"./index":10}],10:[function(require,module,exports){
module.exports = {
  ai6: require('./ai6'),
  ml6: require('./ml6'),
  ds6: require('./ds6'),
  ma6: require('./ma6'),
  nn6: require('./nn6'),
  se6: require('./se6'),
  sp6: require('./sp6'),
  uu6: require('./uu6'),
}

},{"./ai6":1,"./ds6":8,"./ma6":11,"./ml6":33,"./nn6":43,"./se6":52,"./sp6":55,"./uu6":61}],11:[function(require,module,exports){
module.exports = require('./src/ma6')

},{"./src/ma6":19}],12:[function(require,module,exports){
const uu6 = require('../../../js6/uu6')
const RA = require('./ratio')
const C = require('./complex')
const V = require('./vector')
const ND = require('./ndarray')
const M = require('./matrix')
const T = require('./tensor')
const R = require('./R')
const F = require('./function')
const O = module.exports = {}

class OO {
  constructor(v) {
    let o = obj(v)
    this.v = o.v
    this.type = o.type 
  }
}

let oo = O.oo = function (v) {
  if (v instanceof OO) return v
  return new OO(v)
}

V.toTensor = T.ndarray2tensor

let all = function (o, keys) {
  let len = keys.length
  for (let i=0; i<len; i++) {
    let key = keys[i]
    if (o[key] == null) return false
  }
  return true
}

let parse = function (s) {
  let r = null
  if ((r = RA.ratio(s)) != null) return {type:'ratio', v:r}
  if ((r = C.complex(s)) != null) return {type:'complex', v:r}
  return {type:'string', v:s}
}

let obj = function (o) {
  if (o.type != null) return o
  if (o instanceof OO) return o
  let t = typeof o, r = null
  if (t === 'string') return parse(o)
  if (t !== 'object') return {type:t, v:o}
  if (Array.isArray(o)) {
    return (Array.isArray(o[0])) ? {type:'ndarray', v:o} : {type:'vector', v:o}
    // return {type:'tensor', v:T.new({r:o, shape:[o.length]})}
  }
  if (all(o, ['a', 'b'])) return {type:'ratio', v:o}
  if (all(o, ['r', 'shape'])) return {type:'tensor', v:T.new(o)}
  if (all(o, ['r', 'i'])) return {type:'complex', v:o}
  return {type:'unknown', v:o}
}

function op2(x, y, op) {
  let {v:xv, type:xt} = obj(x), {v:yv, type:yt} = obj(y)
  if (xt === 'ratio' && yt === 'ratio') return RA[op](xv,yv) // 兩者均為 ratio, 用 ratio 去運算
  if (xt === 'ratio') xv = RA.number(xv) // ratio 轉換為 number
  if (yt === 'ratio') yv = RA.number(yv) // ratio 轉換為 number
  if (xt==='complex' && yt==='complex') return C[op](xv,yv) // 兩者均為複數，用 complex 去運算
  let xnv = (xt ==='number' || xt==='vector'), ynv = (yt === 'number' || yt === 'vector')
  if (xnv && ynv) return V[op](xv,yv) // 兩者均為 (number or vector)，用 V.op(x,y) 去運算
  if (xt==='ndarray' && yt==='ndarray') return ND[op](xv,yv) // 兩者均為 ndarray，用 ND.op(x,y) 去運算
  if (xt==='tensor' || yt==='tensor') return T[op](xv,yv) // 至少有一個為 tensor, 呼叫 T.op(x,y) 去運算
  throw Error('Error: op2: xt='+xt+' yt='+yt+' not handled !')
}

let call = function (o, method, ...args) {
  let len = args.length
  let vargs = new Array(len)
  let oargs = new Array(len)
  for (let i=0; i<len; i++) {
    let ao = obj(args[i])
    oargs[i] = ao
    vargs[i] = ao.v
  }
  var r = null
  if (['add', 'sub', 'mul', 'div', 'pow'].indexOf(method) >= 0) {
    r = op2(oargs[0], oargs[1], method)
  } else {
    r = o[method](...args)
  }
  if (r == null) return
  let ro = oo(r)
  return ro
}

let ooMix = function (...args) {
  for (let source of args) {
    Object.getOwnPropertyNames(source).forEach(function(property) {
      let s = source[property]
      let t = (typeof s === 'function') ? function () { return oo(s(...arguments)) } : oo(s)
      O[property] = t
      if (typeof s === 'function') { // ex: call(C, 'add', this.v, y)
        OO.prototype[property] = function () { return call(source, property, this.v, ...arguments) }
      }
    })
  }
}

ooMix(C, RA, M, V, ND, T, R, F,
  // pure function
  require('./entropy'),
  require('./optimize'),
  require('./calculus'),
  require('./ode'),
  // pure member
  require('./constant')
)

let OOp = OO.prototype

OOp.reshape = function (shape) {
  var {type, v} = this
  switch (type) {
    case 'vector': this.v=V.toTensor(v); this.type = 'tensor'; break
  }
  this.v.shape = shape
  return this
}

OOp.toString = function (digits=4) {
  var {type, v} = this
  switch (type) {
    case 'number': return v.toFixed(digits)
    case 'ratio': return RA.str(v)
    case 'complex': return C.str(v)
    case 'tensor': return T.str(v)
    default: throw Error('str: type='+type+' not found!')
  }
}
},{"../../../js6/uu6":61,"./R":13,"./calculus":14,"./complex":15,"./constant":16,"./entropy":17,"./function":18,"./matrix":20,"./ndarray":21,"./ode":22,"./optimize":23,"./ratio":26,"./tensor":30,"./vector":32}],13:[function(require,module,exports){
const P = require('./probability')
const R = module.exports = {}

R.rdist = function (name) {
  return eval(`
    let f=function (arg) { 
      let {n} = arg, v = new Array(n)
      for (let i=0; i<n; i++) v[i] = P.${name}.sample(arg)
      return v
    }; f
  `)
}

// Uniform Distribution
R.dunif = (arg) => P.uniform.pdf(arg)
R.punif = (arg) => P.uniform.cdf(arg)
R.qunif = (arg) => P.uniform.inv(arg)
R.runif = R.rdist('uniform')
// R.runif = (arg) => R.repeats(arg, (arg)=>P.uniform.sample(arg))

// Exponential Distribution
R.dexp = (arg) => P.exp.pdf(arg)
R.pexp = (arg) => P.exp.cdf(arg)
R.qexp = (arg) => P.exp.inv(arg)
R.rexp = (arg) => R.repeats(arg, (arg)=>P.exp.sample(arg))

// Normal Distribution
R.dnorm = (arg) => P.normal.pdf(arg)
R.pnorm = (arg) => P.normal.cdf(arg)
R.qnorm = (arg) => P.normal.inv(arg)
R.rnorm = R.rdist('norm')
// R.rnorm = (arg) => R.repeats(arg, (arg)=>P.normal.sample(arg))

// Beta Distribution
R.dbeta = (arg) => P.beta.pdf(arg)
R.pbeta = (arg) => P.beta.cdf(arg)
R.qbeta = (arg) => P.beta.inv(arg)
R.rbeta = R.rdist('beta')
// R.rbeta = (arg) => R.repeats(arg, (arg)=>P.beta.sample(arg))

// F Distribution
R.df = (arg) => P.f.pdf(arg)
R.pf = (arg) => P.f.cdf(arg)
R.qf = (arg) => P.f.inv(arg)
R.rf = R.rdist('f')
// R.rf = (arg) => R.repeats(arg, (arg)=>P.f.sample(arg))

// Cauchy Distribution
R.dcauchy = (arg) => P.cauchy.pdf(arg)
R.pcauchy = (arg) => P.cauchy.cdf(arg)
R.qcauchy = (arg) => P.cauchy.inv(arg)
R.rcauchy = R.rdist('cauchy')
// R.rcauchy = (arg) => R.repeats(arg, (arg)=>P.cauchy.sample(arg))

// ChiSquare Distribution
R.dchisq = (arg) => P.chiSquare.pdf(arg)
R.pchisq = (arg) => P.chiSquare.cdf(arg)
R.qchisq = (arg) => P.chiSquare.inv(arg)
R.rchisq = R.rdist('chisq')
// R.rchisq = (arg) => R.repeats(arg, (arg)=>P.chiSquare.sample(arg))

// Gamma Distribution
R.dgamma = (arg) => P.gamma.pdf(arg)
R.pgamma = (arg) => P.gamma.cdf(arg)
R.qgamma = (arg) => P.gamma.inv(arg)
R.rgamma = R.rdist('gamma')
// R.rgamma = (arg) => R.repeats(arg, (arg)=>P.gamma.sample(arg))

// InvGamma Distribution
R.dinvgamma = (arg) => P.invGamma.pdf(arg)
R.pinvgamma = (arg) => P.invGamma.cdf(arg)
R.qinvgamma = (arg) => P.invGamma.inv(arg)
R.rinvgamma = R.rdist('invgamma')
// R.rinvgamma = (arg) => R.repeats(arg, (arg)=>P.invGamma.sample(arg))

// T Distribution
R.dt = (arg) => P.t.pdf(arg)
R.pt = (arg) => P.t.cdf(arg)
R.qt = (arg) => P.t.inv(arg)
R.rt = R.rdist('t')
// R.rt = (arg) => R.repeats(arg, (arg)=>P.t.sample(arg))

// Weibull Distribution
R.dweibull = (arg) => P.weibull.pdf(arg)
R.pweibull = (arg) => P.weibull.cdf(arg)
R.qweibull = (arg) => P.weibull.inv(arg)
R.rweibull = R.rdist('weibull')
// R.rweibull = (arg) => R.repeats(arg, (arg)=>P.weibull.sample(arg))

/*
// const T = require('./tensor')
const uu6 = require('../../uu6')
const {oo} = require('./oo')
R.repeats = function (arg, f) {
  let n = arg.n, v = new Array(n)
  for (let i=0; i<n; i++) {
    v[i] = f(arg)
  }
  return v // oo(v)
}
*/
},{"./probability":25}],14:[function(require,module,exports){
const F = module.exports = {}
const V = require('./vector')
const M = require('./matrix')
const uu6 = require('../../uu6')

// =========== Calculus =================
F.h = 0.01

// n 次微分 : 參考 https://en.wikipedia.org/wiki/Finite_difference
F.diffn = function (f, n, x=null, h=F.h) {
  uu6.member(n >= 0)
  if (n === 0) return f(x)
  h = h/2 // 讓 1, 2, .... n 次微分的最大距離都一樣
  var x1 = (x==null) ? null : x+h
  var x_1 = (x==null) ? null : x-h
  return (F.diffn(f,n-1,x1) - F.diffn(f,n-1,x_1))/(2*h)
}

F.diff = function (f, x, h=F.h) { return F.diffn(f, 1, x, h) }

// n 階偏導數
F.pdiffn = function (f, i, n, v, h=F.h) {
  if (n === 0) return f(v)
  h = h/2 // 讓 1, 2, .... n 次微分的最大距離都一樣
  let d = function (f, i, n, v) {
    let v1 = null, v_1 = null
    if (v != null) {
      v1 = v.slice(0); v1[i] += h
      v_1= v.slice(0); v_1[i]-= h
    }
    return (F.pdiffn(f,i,n-1,v1) - F.pdiffn(f,i,n-1,v_1))/(2*h)
  }
  return (v == null) ? d : d(f, i, n, v)
}

F.pdiff = function (f, i, x, h=F.h) { return F.pdiffn(f, i, 1, x, h) }

// 梯度 gradient : grad(f,x)=[pdiff(f,x,0), .., pdiff(f,x,n)]
F.grad = function (f, v, h=F.h) {
  let len = (typeof v == 'number') ? v : v.length
  let vt =  (typeof v == 'number') ? null : v
  let g = new Array(len)
  for (let i=0; i<len; i++) {
    g[i] = F.pdiff(f, i, vt) // 對第 i 個變數取偏導數後，放入梯度向量 g 中
  }
  return g
}

// 散度 divergence : div(fv,x) = sum(pdiff(fv[i],v,i))
// 說明： fv=[f1,f2,...,fn] 可微分向量函數
F.divergence = function (fv, v) {
  console.log('div:fv=', fv)
  let len = v.length, d = new Array(len)
  for (var i = 0; i < len; i++) {
    d[i] = F.pdiff(fv[i], i, v)
  }
  return V.sum(d)
}

// F.divergence = F.div

F.is3D = function (fv, v) {
  if (fv.length !== 3 || v.length !== 3) throw Error('curl(fv, v): dimension should be 3')
}

// 旋度 curl : curl(fv, x) = [pf32-pf23,pf13-pf31,pf21-pf12]
F.curl = F.curlance = function (fv, v) {
  F.is3D(fv, v);
  let pf = function (i,j) { return F.pdiff(fv[i],j) }
  return [pf(2,1)(v)-pf(1,2)(v),
          pf(0,2)(v)-pf(2,0)(v),
          pf(1,0)(v)-pf(0,1)(v)]
}

// 拉普拉斯算子 : df2(x) + df2(y) + ....
F.laplaceOperator = function(f, v) {
  let len = v.length, df2=new Array(len)
  for (let i=0; i<len; i++) {
    df2[i] = F.pdiffn(f, i, 2, v)
  }
  return V.sum(df2)
}

F.jocobian = function (fv, v) {
  let len = fv.length
  let J = M.new(len, len)
  for (let i=0; i<len; i++) {
    for (let j=0; j<len; j++) {
      J[i][j] = F.pdiff(fv[i], j, v)
    }
  }
  return J
}

// ============================ 積分 ================================
// 積分 integral calculus
F.i = F.integral = function (f, a, b, h = F.h) {
  var area = 0.0
  for (var x = a; x < b; x = x + h) {
    area = area + f(x) * h
  }
  return area
}

// 線積分： int F●dr = int F(r(t))●r'(t) dt
F.vintegral = function (F, r, a, b, dt) {
  dt = dt || F.h
  var sum = 0
  for (var t = a; t < b; t += dt) {
    sum += V.dot(F(r(t)) * F.diff(r, t, dt))
  }
  return sum
}

// 多重積分 -- multidimensional integral calculus
// f=[f1,f2,....] , a=[a1,a2,...] , b=[b1,b2,....]
F.pintegral = function (f, a, b) {
}

// ============================== 定理 ==============================

// 定理: 梯度的散度 = 拉普拉斯算子
// 注意：這裡用數值微分只取到一階，無法反映《引力場的拉普拉斯應該為 0》 的特性。若用自動微分應該就會是 0。
F.theoremDivGradEqLaplace = function (f, v) {
  let len = v.length
  let divGrad = F.divergence(F.grad(f, len), v)
  let laplace = F.laplaceOperator(f, v)
  console.log('div(grad(f,v))=', divGrad, ' laplace=', laplace)
  uu6.near(divGrad, laplace)
}

// 定理：梯度的旋度 = 零
F.theoremCurlGradZero = function (f, v) {
  let len = v.length
  let r= F.curl(F.grad(f, len), v)
  console.log('curl(grad(f,v))=', r)
  uu6.near(r, V.array(len, 0))
}

// 定理：旋度的散度 = 零
F.theoremDivCurlZero = function (f, v) {
  let len = v.length
  let r = F.div(F.curl(f, len), v)
  console.log('div(curl(f,v))=',r)
  uu6.near(r, V.array(len, 0))
}

// 定理：int j6●dr  = int(sum(Qxi dxi))

// 向量保守場： F=grad(f) ==> int j6●dr = f(B)-f(F)

// 定理： 向量保守場 F, pdiff(Qxi,xj) == pdiff(Qxj,xi)  for any i, j
// ex: F=[x^2y, x^3] 中， grad(F)=[x^2, 3x^2] 兩者不相等，所以不是保守場

// 格林定理：保守場中 《線積分=微分後的區域積分》
// int P h + Q dy = int int pdiff(Q,x) - pdiff(P, y) h dy

// 散度定理：通量 = 散度的區域積分
// 2D : int j6●n ds = int int div F h dy
// 3D : int int j6●n dS = int int int div F dV

// 史托克定理：  F 在曲面 S 上的旋度總和 = F 沿著邊界曲線 C 的線積分
// int int_D curl(F)●n dS = int_C j6●dr



/*
// 微分 differential calculus
F.df = F.diff = function (f, x=null, h = F.h) {
  h = h/2
  let d = function (x) { return (f(x+h) - f(x-h))/(2*h) }
  return (x == null) ? d : d(x)
}

// 二次微分 differential calculus，比連續用兩次一階微分更準確
F.df2 = F.diff2 = function (f, x=null, h = F.h) {
  h = h/2
  let d = function (x) { return ((f(x+h) - 2*f(x) + f(x-h))/h)/h }
  return (x == null) ? d : d(x)
}
*/

/*
// 偏導數 partial differential calculus
// f([x1,x2,...])
F.pdiff = function (f, i, v=null, h = F.h) {
  let d = function (v) {
    let v2 = v.slice(0)
    v2[i] += h
    return (f(v2)-f(v))/h
  }
  return (v==null) ? d : d(v)
}

// 二階偏導數逼近，比連續使用一階準確
F.pdiff2 = function (f, i, v=null, h = F.h) {
  let d = function (v) {
    let v1 = v.slice(0), v_1 = v.slice(0)
    v1[i] += h; v_1[i] -= h
    return ((f(v1)-2*f(v)+f(v_1))/h)/h
  }
  return (d==null) ? d : d(v)
}
*/


/*
// ===================== 函數陣列的版本 =============================

// 函數版偏微分
F.fpdiff = function (f, i, h = F.h) {
  return function pdiff(v) {
    return F.pdiff(f, v, i)
  }
}

// 函數版偏微分
F.fgrad = function (f, len) {
  let gf = new Array(len)
  for (let i=0; i<len; i++) {
    gf[i] = F.fpdiff(f, i)
  }
  return gf
}

F.fJocobian = function (fv) {
  let len = v.length
  let J = M.new(len, len)
  for (let i=0; i<len; i++) {
    for (let j=0; j<len; j++) {
      J[i][j] = F.fpdiff(fv[i], v, j)
    }
  }
  return J
}
*/

},{"../../uu6":61,"./matrix":20,"./vector":32}],15:[function(require,module,exports){
const C = module.exports = {}

C.complex = function(s) {
  let m = s.match(/^([^\+]*)(\+(.*))?$/)
  let r = parseFloat(m[1])
  let i = typeof m[3]==='undefined' ? 1 : parseFloat(m[3])
  return {r, i}
}

C.polarToComplex = function (p) {
  return {r: p.radius*Math.cos(p.theta), i: p.radius*Math.sin(p.theta)}
}

C.complexToPolar = function (a) {
  let {r, i}=a
  let d=Math.sqrt(r*r+i*i)
  let theta = Math.acos(r/d)
  return {radius:d, theta:theta}
}

C.conj = function (a) { return {r:a.r, i:-a.i} }
C.neg = function (a) { return {r:-a.r, i:-a.i} }
C.add = function (a,b) { return {r:a.r+b.r, i:a.i+b.i} }
C.sub = function (a,b) { return {r:a.r-b.r, i:a.i-b.i} }
C.mul = function (a,b) { return {r:a.r*b.r-a.i*b.i, i:a.r*b.i+a.i*b.r} }
C.div = function (a,b) { return C.mul(a, C.pow(b, -1)) }
C.pow = function (a,k) { // https://math.stackexchange.com/questions/476968/complex-power-of-a-complex-number
  let p = C.complexToPolar(a)
  return C.polarToComplex({radius:Math.pow(p.radius, k), theta:k*p.theta })
}
C.sqrt = function (a) {
  return C.pow(a, 1/2)
}
C.str = function (a, digits=4) {
  let r = a.r.toFixed(digits)
  let i = a.i.toFixed(digits)
  let op = (a.i < 0)?'':'+'
  return r + op + i + 'i'
}
C.toFixed = function (c) {
  c.r = parseFloat(c.r.toFixed(digits))
  c.i = parseFloat(c.i.toFixed(digits))
  return C.complex(c.toString())
}

C.complexArray = function (s) {
  let c = s.split(','), len = c.length
  let rt = new Array(len), it = new Array(len)
  for (let i=0; i<len; i++) {
    let ci = C.complex(c[i])
    rt[i] = ci.r; it[i] = ci.i
  }
  return {r: rt, i:it }
}

/*
class Complex {
  constructor(a) {
    let t = typeof a
    if (t === 'string') { a = C.complex(a); t = typeof a }
    if (t === 'object') { this.r = a.r; this.i = a.i; return }
    // console.log('Complex:a=%j', a)
    throw Error('Complex.constructor error: a='+a.toString())
  }
  conj() { return new Complex(C.conj(this)) }
  neg() { return new Complex(C.neg(this)) }
  add(b) { return new Complex(C.add(this, b)) }
  sub(b) { return new Complex(C.sub(this, b)) }
  mul(b) { return new Complex(C.mul(this, b)) }
	div(b) { return new Complex(C.div(this, b)) }
  clone() { return new Complex(this) }
  toString() { return C.str(this) }
  toPolar() { return C.complexToPolar(this) }
  pow(k) { return new Complex(C.pow(this, k)) }
  sqrt() { return new Complex(C.sqrt(this)) }
  toFixed(digits=4) { return C.toFixed(this) }
}

Object.assign(C, { Complex })
*/
// C.complex = function (s) { return C.parseComplex(s) }
},{}],16:[function(require,module,exports){
module.exports = {
  Pi: Math.PI,
  E: Math.E,
  // Epsilon: 0.000001
  Epsilon: 2.220446049250313e-16,
}
},{}],17:[function(require,module,exports){
const M = module.exports = {}
const V = require('./vector')

M.logp = function(n) {
  let a = V.steps(1, n, 1)
  let la = V.log(a)
	return V.sum(la)
}

// 傳回多項分布的 log 值！ log( (n!)/(x1!x2!...xk!) p1^x1 p2^x2 ... pk^xk )
// = [log(n)+...+log(1)]-[log(x1)...]+....+x1*log(p1)+...+xk*log(pk)
M.xplog = function(x, p) {
  var n = V.sum(x)
  var r = M.logp(n)
  let len = x.length
  for (let i=0; i<len; i++) r -= M.logp(x[i]);
  return r + V.dot(x, V.log(p))
}

},{"./vector":32}],18:[function(require,module,exports){
const F = module.exports = {}

F.neg = function (fx) {
  return function (...arg) { return -1 * fx(...arg) }
}

F.inv = function (fx) {
  return function (...arg) { return 1 / fx(...arg) }
}

F.add = function (fx, fy) {
  return function(...arg) { return fx(...arg)+fy(...arg) }
}

F.sub = function (fx, fy) {
  return function(...arg) { return fx(...arg)-fy(...arg) }
}

F.mul = function (fx, fy) {
  return function(...arg) { return fx(...arg)*fy(...arg) }
}

F.div = function (fx, fy) {
  return function(...arg) { return fx(...arg)/fy(...arg) }
}

F.compose = function (fx, fy) {
  return function(...arg) { return fx(fy(...arg)) }
}

F.call = function (f, ...arg) { return f(...arg) }

// f=(x,y)=>x*y+x*x;
// f0=fa(f); f0([x,y]);
F.fa = function (f) {
  return function (x) { return f.apply(null, x) }
}

// relation
F.eq = function (a, b) {
  return (typeof a === typeof b) && a.toString() === b.toString()
}

F.neq = function (a, b) { return !F.eq(a, b) }
F.leq = function (a, b) { return a <= b }
F.geq = function (a, b) { return a >= b }
F.lt = function (a, b) { return a < b }
F.gt = function (a, b) { return a > b }
F.near = function (a, b) { return Math.abs(a - b) < 0.0001 }

// =========== Integer ====================
F.isPrime = function (n) {
  for (var i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false
  }
  return n % 1 === 0
}

F.gcd = function (a, b) {
  if (!b) return a
  return F.gcd(b, a % b)
}

F.lcm = function (a, b) {
  return (a * b) / F.gcd(a, b)
}

F.factorial = function (n) {
  let r = 1
  for (let i=2; i<=n; i++) {
    r *= i
  }
  return r
}

},{}],19:[function(require,module,exports){
const uu6 = require('../../uu6')

const ma6 = module.exports = {
  R: require('./R'),
  P: require('./probability'),
  V: require('./vector'),
  T: require('./tensor'),
  M: require('./matrix'),
  S: require('./stat'),
  F: require('./function'),
  C: require('./constant'),
  // OO: require('./oo'),
  O: require('./O'),
  RA: require('./ratio')
  // D: require('./calculus'),
  // AD: require('../../nn6/src/autoDiff'),
  // argmax: require('./argmax'),
}

// ma6.oo = ma6.OO.oo
ma6.oo = ma6.O.oo

uu6.mixin(ma6, ma6.R, ma6.V, ma6.T, ma6.M, ma6.S, ma6.F, ma6.C, 
  require('./calculus'),
  // require('./point'),
  require('./complex'),
  require('./calculus'),
  require('./space'),
  require('./entropy'),
  require('./transform'),
  require('./optimize'),
  require('./series'),
  require('./ratio'),
  require('./ode'),
  Math,
)


},{"../../uu6":61,"./O":12,"./R":13,"./calculus":14,"./complex":15,"./constant":16,"./entropy":17,"./function":18,"./matrix":20,"./ode":22,"./optimize":23,"./probability":25,"./ratio":26,"./series":27,"./space":28,"./stat":29,"./tensor":30,"./transform":31,"./vector":32}],20:[function(require,module,exports){
const uu6 = require("../../uu6")
const V = require("./vector")
const T = require("./tensor")

const M = module.exports = {}

M.new = function (rows, cols) {
  let r = new Array(rows)
  for (let i=0; i<rows; i++) {
    r[i] = V.array(cols, 0)
  }
  return r
}

M.flatten = function (m) {
  let rows = m.length, cols = m[0].length
  let r = new Array()
  for (let i=0; i<rows; i++) {
    for (let j=0; j<cols; j++)
    r[i*cols+j] = m[i][j]
  }
  return r
}

M.identity = function (n) {
  let v = V.array(n, 1)
  return M.diag(v)
}

M.diag = function (v) {
  let rows = v.length
  let r = M.new(rows, rows)
  for (let i = 0; i < rows; i++) {
    r[i][i] = v[i]
  }
  return r
}

M.tr = M.transpose = function (m) {
  let r = []
  let rows = m.length
  let cols = m[0].length
  for (let j = 0; j < cols; j++) {
    let rj = r[j] = []
    for (let i = 0; i < rows; i++) {
      rj[i] = m[i][j]
    }
  }
  return r
}

M.dot = function (a, b) {
  let arows = a.length
  let bcols = b[0].length
  let r = []
  let bt = M.tr(b)
  for (let i = 0; i < arows; i++) {
    let ri = r[i] = []
    for (let j = 0; j < bcols; j++) {
      ri.push(V.dot(a[i], bt[j]))
    }
  }
  return r
}

M.inv = function (m0) {
  let m = m0.length, n = m0[0].length, abs = Math.abs
  let A = uu6.clone(m0), Ai, Aj
  let I = M.identity(m), Ii, Ij
  let i, j, k, x, i0, v0
  for (j = 0; j < n; ++j) {
    i0 = -1
    v0 = -1
    for (i = j; i !== m; ++i) {
      k = abs(A[i][j])
      if (k > v0) { i0 = i; v0 = k }
    }
    Aj = A[i0]; A[i0] = A[j]; A[j] = Aj
    Ij = I[i0]; I[i0] = I[j]; I[j] = Ij
    x = Aj[j]
    for (k = j; k !== n; ++k) Aj[k] /= x
    for (k = n - 1; k !== -1; --k) Ij[k] /= x
    for (i = m - 1; i !== -1; --i) {
      if (i !== j) {
        Ai = A[i]
        Ii = I[i]
        x = Ai[j]
        for (k = j + 1; k !== n; ++k) Ai[k] -= Aj[k] * x
        for (k = n - 1; k > 0; --k) { Ii[k] -= Ij[k] * x; --k; Ii[k] -= Ij[k] * x }
        if (k === 0) Ii[0] -= Ij[0] * x
      }
    }
  }
  return I
}

M.det = function (x) {
  let abs = Math.abs
  if (x.length !== x[0].length) { throw new Error('numeric: det() only works on square matrices') }
  let n = x.length, ret = 1, i, j, k, A = uu6.clone(x), Aj, Ai, alpha, temp, k1
  for (j = 0; j < n - 1; j++) {
    k = j
    for (i = j + 1; i < n; i++) { if (abs(A[i][j]) > abs(A[k][j])) { k = i } }
    if (k !== j) {
      temp = A[k]; A[k] = A[j]; A[j] = temp
      ret *= -1
    }
    Aj = A[j]
    for (i = j + 1; i < n; i++) {
      Ai = A[i]
      alpha = Ai[j] / Aj[j]
      for (k = j + 1; k < n - 1; k += 2) {
        k1 = k + 1
        Ai[k] -= Aj[k] * alpha
        Ai[k1] -= Aj[k1] * alpha
      }
      if (k !== n) { Ai[k] -= Aj[k] * alpha }
    }
    if (Aj[j] === 0) { return 0 }
    ret *= Aj[j]
  }
  return ret * A[j][j]
}

// AX = b
M.lu = function(A) {
  var abs = Math.abs
  var i, j, k, absAjk, Akk, Ak, Pk, Ai
  var max
  var n = A.length, n1 = n-1
  var P = new Array(n)
  A = uu6.clone(A)

  for (k = 0; k < n; ++k) {
    Pk = k
    Ak = A[k]
    max = abs(Ak[k])
    for (j = k + 1; j < n; ++j) {
      absAjk = abs(A[j][k])
      if (max < absAjk) {
        max = absAjk
        Pk = j
      }
    }
    P[k] = Pk

    if (Pk != k) {
      A[k] = A[Pk]
      A[Pk] = Ak
      Ak = A[k]
    }

    Akk = Ak[k]

    for (i = k + 1; i < n; ++i) {
      A[i][k] /= Akk
    }

    for (i = k + 1; i < n; ++i) {
      Ai = A[i]
      for (j = k + 1; j < n1; ++j) {
        Ai[j] -= Ai[k] * Ak[j]
        ++j
        Ai[j] -= Ai[k] * Ak[j]
      }
      if(j===n1) Ai[j] -= Ai[k] * Ak[j]
    }
  }

  return { LU: A, P:  P }
}

M.luSolve = function (LUP, b) {
  var i, j;
  var LU = LUP.LU;
  var n   = LU.length;
  var x = uu6.clone(b);
  var P   = LUP.P;
  var Pi, LUi, LUii, tmp;

  for (i=n-1;i!==-1;--i) x[i] = b[i];
  for (i = 0; i < n; ++i) {
    Pi = P[i];
    if (P[i] !== i) {
      tmp = x[i];
      x[i] = x[Pi];
      x[Pi] = tmp;
    }

    LUi = LU[i];
    for (j = 0; j < i; ++j) {
      x[i] -= x[j] * LUi[j];
    }
  }

  for (i = n - 1; i >= 0; --i) {
    LUi = LU[i];
    for (j = i + 1; j < n; ++j) {
      x[i] -= x[j] * LUi[j];
    }

    x[i] /= LUi[i];
  }

  return x;
}

M.solve = function (A,b) { return M.luSolve(M.lu(A), b) }
/*
class Matrix extends T.Tensor {
  constructor(v, shape) {
    super(v, shape)
    uu6.be(shape.length == 2)
  }

  rows () { return this.shape[0] }
  cols () { return this.shape[1] }

  rowSum () {
    let rows = this.rows(), cols = this.cols()
    let s = V.array(rows), v = this.v
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        s[i] += v[i*cols+j]
      }
    }
    return new T.Tensor(s)
  }
  
  colSum () {
    let rows = this.rows(), cols = this.cols()
    let s = V.array(cols), v = this.v
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        s[j] += v[i*cols+j]
      }
    }
    return T.Tensor(s)
  }

  transpose() {
    let a = this.ndarray()
    return new Matrix(M.transpose(a))
  }

  dot (b) {
    let ax = this.ndarray(), bx = b.ndarray()
    return new Matrix(M.dot(ax, bx))
  }

  diag () {
    let a = this, av = a.v, [rows, cols] = a.shape
    let r = new Matrix(a.v, a.shape), rv = r.v
    let v = V.array(rows)
    for (let i = 0; i < rows; i++) {
      v[i] = av[i][i]
    }
    return v
  }

  inv () {
    let a = this.ndarray()
    let ia = M.inv(a)
    return new Matrix(ia)
  }

  det() {
    let a = this.ndarray()
    return M.det(a)
  }

  lu() {
    let a = this.ndarray()
    return M.lu(a)
  }

  svd() {
    let a = this.ndarray()
    return svd(a)
  }

  solve(b) {
    let a = this.ndarray()
    return M.solve(a, b)
  }
}
Object.assign(M, {Matrix })
*/

// ============================ SVD =======================================================
const Epsilon = 2.220446049250313e-16

M.svd = function svd(A) {
  var temp;
//Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
var prec= Epsilon; //Math.pow(2,-52) // assumes double prec
var tolerance= 1.e-64/prec;
var itmax= 50;
var c=0;
var i=0;
var j=0;
var k=0;
var l=0;

var u= uu6.clone(A);
var m= u.length;

var n= u[0].length;

if (m < n) throw "Need more rows than columns"

var e = new Array(n);
var q = new Array(n);
for (i=0; i<n; i++) e[i] = q[i] = 0.0;
var v = M.new(n, n); 
//	v.zero();

 function pythag(a,b)
 {
  a = Math.abs(a)
  b = Math.abs(b)
  if (a > b)
    return a*Math.sqrt(1.0+(b*b/a/a))
  else if (b == 0.0) 
    return a
  return b*Math.sqrt(1.0+(a*a/b/b))
}

//Householder's reduction to bidiagonal form

var f= 0.0;
var g= 0.0;
var h= 0.0;
var x= 0.0;
var y= 0.0;
var z= 0.0;
var s= 0.0;

for (i=0; i < n; i++)
{	
  e[i]= g;
  s= 0.0;
  l= i+1;
  for (j=i; j < m; j++) 
    s += (u[j][i]*u[j][i]);
  if (s <= tolerance)
    g= 0.0;
  else
  {	
    f= u[i][i];
    g= Math.sqrt(s);
    if (f >= 0.0) g= -g;
    h= f*g-s
    u[i][i]=f-g;
    for (j=l; j < n; j++)
    {
      s= 0.0
      for (k=i; k < m; k++) 
        s += u[k][i]*u[k][j]
      f= s/h
      for (k=i; k < m; k++) 
        u[k][j]+=f*u[k][i]
    }
  }
  q[i]= g
  s= 0.0
  for (j=l; j < n; j++) 
    s= s + u[i][j]*u[i][j]
  if (s <= tolerance)
    g= 0.0
  else
  {	
    f= u[i][i+1]
    g= Math.sqrt(s)
    if (f >= 0.0) g= -g
    h= f*g - s
    u[i][i+1] = f-g;
    for (j=l; j < n; j++) e[j]= u[i][j]/h
    for (j=l; j < m; j++)
    {	
      s=0.0
      for (k=l; k < n; k++) 
        s += (u[j][k]*u[i][k])
      for (k=l; k < n; k++) 
        u[j][k]+=s*e[k]
    }	
  }
  y= Math.abs(q[i])+Math.abs(e[i])
  if (y>x) 
    x=y
}

// accumulation of right hand gtransformations
for (i=n-1; i != -1; i+= -1)
{	
  if (g != 0.0)
  {
     h= g*u[i][i+1]
    for (j=l; j < n; j++) 
      v[j][i]=u[i][j]/h
    for (j=l; j < n; j++)
    {	
      s=0.0
      for (k=l; k < n; k++) 
        s += u[i][k]*v[k][j]
      for (k=l; k < n; k++) 
        v[k][j]+=(s*v[k][i])
    }	
  }
  for (j=l; j < n; j++)
  {
    v[i][j] = 0;
    v[j][i] = 0;
  }
  v[i][i] = 1;
  g= e[i]
  l= i
}

// accumulation of left hand transformations
for (i=n-1; i != -1; i+= -1)
{	
  l= i+1
  g= q[i]
  for (j=l; j < n; j++) 
    u[i][j] = 0;
  if (g != 0.0)
  {
    h= u[i][i]*g
    for (j=l; j < n; j++)
    {
      s=0.0
      for (k=l; k < m; k++) s += u[k][i]*u[k][j];
      f= s/h
      for (k=i; k < m; k++) u[k][j]+=f*u[k][i];
    }
    for (j=i; j < m; j++) u[j][i] = u[j][i]/g;
  }
  else
    for (j=i; j < m; j++) u[j][i] = 0;
  u[i][i] += 1;
}

// diagonalization of the bidiagonal form
prec= prec*x
for (k=n-1; k != -1; k+= -1)
{
  for (var iteration=0; iteration < itmax; iteration++)
  {	// test f splitting
    var test_convergence = false
    for (l=k; l != -1; l+= -1)
    {	
      if (Math.abs(e[l]) <= prec)
      {	test_convergence= true
        break 
      }
      if (Math.abs(q[l-1]) <= prec)
        break 
    }
    if (!test_convergence)
    {	// cancellation of e[l] if l>0
      c= 0.0
      s= 1.0
      var l1= l-1
      for (i =l; i<k+1; i++)
      {	
        f= s*e[i]
        e[i]= c*e[i]
        if (Math.abs(f) <= prec)
          break
        g= q[i]
        h= pythag(f,g)
        q[i]= h
        c= g/h
        s= -f/h
        for (j=0; j < m; j++)
        {	
          y= u[j][l1]
          z= u[j][i]
          u[j][l1] =  y*c+(z*s)
          u[j][i] = -y*s+(z*c)
        } 
      }	
    }
    // test f convergence
    z= q[k]
    if (l== k)
    {	//convergence
      if (z<0.0)
      {	//q[k] is made non-negative
        q[k]= -z
        for (j=0; j < n; j++)
          v[j][k] = -v[j][k]
      }
      break  //break out of iteration loop and move on to next k value
    }
    if (iteration >= itmax-1)
      throw 'Error: no convergence.'
    // shift from bottom 2x2 minor
    x= q[l]
    y= q[k-1]
    g= e[k-1]
    h= e[k]
    f= ((y-z)*(y+z)+(g-h)*(g+h))/(2.0*h*y)
    g= pythag(f,1.0)
    if (f < 0.0)
      f= ((x-z)*(x+z)+h*(y/(f-g)-h))/x
    else
      f= ((x-z)*(x+z)+h*(y/(f+g)-h))/x
    // next QR transformation
    c= 1.0
    s= 1.0
    for (i=l+1; i< k+1; i++)
    {	
      g= e[i]
      y= q[i]
      h= s*g
      g= c*g
      z= pythag(f,h)
      e[i-1]= z
      c= f/z
      s= h/z
      f= x*c+g*s
      g= -x*s+g*c
      h= y*s
      y= y*c
      for (j=0; j < n; j++)
      {	
        x= v[j][i-1]
        z= v[j][i]
        v[j][i-1] = x*c+z*s
        v[j][i] = -x*s+z*c
      }
      z= pythag(f,h)
      q[i-1]= z
      c= f/z
      s= h/z
      f= c*g+s*y
      x= -s*g+c*y
      for (j=0; j < m; j++)
      {
        y= u[j][i-1]
        z= u[j][i]
        u[j][i-1] = y*c+z*s
        u[j][i] = -y*s+z*c
      }
    }
    e[l]= 0.0
    e[k]= f
    q[k]= x
  } 
}
  
//vt= transpose(v)
//return (u,q,vt)
for (i=0;i<q.length; i++) 
  if (q[i] < prec) q[i] = 0
  
//sort eigenvalues	
for (i=0; i< n; i++)
{	 
//writeln(q)
 for (j=i-1; j >= 0; j--)
 {
  if (q[j] < q[i])
  {
//  writeln(i,'-',j)
   c = q[j]
   q[j] = q[i]
   q[i] = c
   for(k=0;k<u.length;k++) { temp = u[k][i]; u[k][i] = u[k][j]; u[k][j] = temp; }
   for(k=0;k<v.length;k++) { temp = v[k][i]; v[k][i] = v[k][j]; v[k][j] = temp; }
//	   u.swapCols(i,j)
//	   v.swapCols(i,j)
   i = j	   
  }
 }	
}

return {U:u,S:q,V:v}
};


},{"../../uu6":61,"./tensor":30,"./vector":32}],21:[function(require,module,exports){
const T = require('./tensor')
const M = module.exports = {}

M.toTensor = function (o) {
  return T.ndarray2tensor(o)
}

},{"./tensor":30}],22:[function(require,module,exports){
// https://en.wikipedia.org/wiki/Parker%E2%80%93Sochacki_method
// Parker–Sochacki method (2006年發展出來的常微分方程解法)
// http://educ.jmu.edu/~sochacjs/PSM.html

const V = require('./vector')
const {norminf, any, add, sub, mul, and, lt } = V
const O = {}
// 10. Ode solver (Dormand-Prince)
O.Dopri = function Dopri(x,y,f,ymid,iterations,msg,events) {
  this.x = x;
  this.y = y;
  this.f = f;
  this.ymid = ymid;
  this.iterations = iterations;
  this.events = events;
  this.message = msg;
}

O.Dopri.prototype._at = function _at(xi,j) {
  function sqr(x) { return x*x; }
  var sol = this;
  var xs = sol.x;
  var ys = sol.y;
  var k1 = sol.f;
  var ymid = sol.ymid;
  var n = xs.length;
  var x0,x1,xh,y0,y1,yh,xi;
  var floor = Math.floor,h;
  var c = 0.5;
  var /*add = O.add, mul = O.mul,sub = O.sub, */ p,q,w;
  x0 = xs[j];
  x1 = xs[j+1];
  y0 = ys[j];
  y1 = ys[j+1];
  h  = x1-x0;
  xh = x0+c*h;
  yh = ymid[j];
  p = sub(k1[j  ],mul(y0,1/(x0-xh)+2/(x0-x1)));
  q = sub(k1[j+1],mul(y1,1/(x1-xh)+2/(x1-x0)));
  w = [sqr(xi - x1) * (xi - xh) / sqr(x0 - x1) / (x0 - xh),
       sqr(xi - x0) * sqr(xi - x1) / sqr(x0 - xh) / sqr(x1 - xh),
       sqr(xi - x0) * (xi - xh) / sqr(x1 - x0) / (x1 - xh),
       (xi - x0) * sqr(xi - x1) * (xi - xh) / sqr(x0-x1) / (x0 - xh),
       (xi - x1) * sqr(xi - x0) * (xi - xh) / sqr(x0-x1) / (x1 - xh)];
  // console.log('k1=', k1, 'w=', w, 'y0=', y0, 'yh=', yh, 'y1=', y1, 'p=', p, 'q=', q)
  return add(add(add(add(mul(y0,w[0]),
                         mul(yh,w[1])),
                         mul(y1,w[2])),
                         mul( p,w[3])),
                         mul( q,w[4]));
}

O.Dopri.prototype.at = function at(x) {
  var i,j,k,floor = Math.floor;
  if(typeof x !== "number") {
      var n = x.length, ret = Array(n);
      for(i=n-1;i!==-1;--i) {
          ret[i] = this.at(x[i]);
      }
      return ret;
  }
  var x0 = this.x;
  i = 0; j = x0.length-1;
  while(j-i>1) {
      k = floor(0.5*(i+j));
      if(x0[k] <= x) i = k;
      else j = k;
  }
  // console.log('at:x=', x, 'i=', i)
  return this._at(x,i);
}

function dopri(arg) {
  let {x0, x1, y0, f, tol, maxit, event} = arg
  if(typeof tol === "undefined") { tol = 1e-6; }
  if(typeof maxit === "undefined") { maxit = 1000; }
  var xs = [x0], ys = [y0], k1 = [f(x0,y0)], k2,k3,k4,k5,k6,k7, ymid = [];
  var A2 = 1/5;
  var A3 = [3/40,9/40];
  var A4 = [44/45,-56/15,32/9];
  var A5 = [19372/6561,-25360/2187,64448/6561,-212/729];
  var A6 = [9017/3168,-355/33,46732/5247,49/176,-5103/18656];
  var b = [35/384,0,500/1113,125/192,-2187/6784,11/84];
  var bm = [0.5*6025192743/30085553152,
            0,
            0.5*51252292925/65400821598,
            0.5*-2691868925/45128329728,
            0.5*187940372067/1594534317056,
            0.5*-1776094331/19743644256,
            0.5*11237099/235043384];
  var c = [1/5,3/10,4/5,8/9,1,1];
  var e = [-71/57600,0,71/16695,-71/1920,17253/339200,-22/525,1/40];
  var i = 0,er,j;
  var h = (x1-x0)/10;
  var it = 0;
  var /*add = numeric.add, mul = numeric.mul, */ y1,erinf;
  var max = Math.max, min = Math.min, abs = Math.abs, /* norminf = numeric.norminf ,*/ pow = Math.pow;
  // var /*any = numeric.any, lt = numeric.lt, and = numeric.and , sub = numeric.sub */;
  var e0, e1, ev;
  var ret = new O.Dopri(xs,ys,k1,ymid,-1,"");
  if(typeof event === "function") e0 = event(x0,y0);
  while(x0<x1 && it<maxit) {
      ++it;
      if(x0+h>x1) h = x1-x0;
      // console.log('x0=', x0, 'y0=', y0, 'k1=', k1, 'A2=', A2, 'A3=', A3, 'A4=', A4, 'A5=', A5, 'A6=', A6, 'c=', c, 'h=', h)
      /*
      k2 = f(x0+c[0]*h,                add(y0,mul(   A2*h,k1[i])));
      k3 = f(x0+c[1]*h,            add(add(y0,mul(A3[0]*h,k1[i])),mul(A3[1]*h,k2)));
      k4 = f(x0+c[2]*h,        add(add(add(y0,mul(A4[0]*h,k1[i])),mul(A4[1]*h,k2)),mul(A4[2]*h,k3)));
      k5 = f(x0+c[3]*h,    add(add(add(add(y0,mul(A5[0]*h,k1[i])),mul(A5[1]*h,k2)),mul(A5[2]*h,k3)),mul(A5[3]*h,k4)));
      k6 = f(x0+c[4]*h,add(add(add(add(add(y0,mul(A6[0]*h,k1[i])),mul(A6[1]*h,k2)),mul(A6[2]*h,k3)),mul(A6[3]*h,k4)),mul(A6[4]*h,k5)));
      y1 = add(add(add(add(add(y0,mul(k1[i],h*b[0])),mul(k3,h*b[2])),mul(k4,h*b[3])),mul(k5,h*b[4])),mul(k6,h*b[5]));
      k7 = f(x0+h,y1);
      er = add(add(add(add(add(mul(k1[i],h*e[0]),mul(k3,h*e[2])),mul(k4,h*e[3])),mul(k5,h*e[4])),mul(k6,h*e[5])),mul(k7,h*e[6]));
      */
     k2 = f(x0+c[0]*h,                add(y0, mul(A2*h, k1[i])))
     // let tt = addc(y0, mul(A2*h, k1[i]))
     // console.log('k2=', k2, 'tt=', tt, 'i=', i)
     k3 = f(x0+c[1]*h,            add(add(y0, mul(A3[0]*h, k1[i])), mul(A3[1]*h,k2)));
     k4 = f(x0+c[2]*h,        add(add(add(y0, mul(A4[0]*h, k1[i])), mul(A4[1]*h,k2)), mul(A4[2]*h,k3)));
     k5 = f(x0+c[3]*h,    add(add(add(add(y0, mul(A5[0]*h, k1[i])), mul(A5[1]*h,k2)), mul(A5[2]*h,k3)), mul(A5[3]*h,k4)));
     k6 = f(x0+c[4]*h,add(add(add(add(add(y0, mul(A6[0]*h, k1[i])), mul(A6[1]*h,k2)), mul(A6[2]*h,k3)), mul(A6[3]*h,k4)), mul(A6[4]*h,k5)));
     y1 = add(add(add(add(add(y0, mul(k1[i],h*b[0])), mul(k3,h*b[2])), mul(k4,h*b[3])), mul(k5,h*b[4])),mul(k6,h*b[5]));
     k7 = f(x0+h,y1);
     er = add(add(add(add(add(mul(k1[i],h*e[0]),mul(k3,h*e[2])),mul(k4,h*e[3])),mul(k5,h*e[4])),mul(k6,h*e[5])),mul(k7,h*e[6]));
     if(typeof er === "number") erinf = abs(er);
      else erinf = norminf(er);
      if(erinf > tol) { // reject
          h = 0.2*h*pow(tol/erinf,0.25);
          if(x0+h === x0) {
              ret.msg = "Step size became too small";
              break;
          }
          continue;
      }
      ymid[i] = add(add(add(add(add(add(y0,
              mul(k1[i],h*bm[0])),
              mul(k3   ,h*bm[2])),
              mul(k4   ,h*bm[3])),
              mul(k5   ,h*bm[4])),
              mul(k6   ,h*bm[5])),
              mul(k7   ,h*bm[6]));
      ++i;
      xs[i] = x0+h;
      ys[i] = y1;
      k1[i] = k7;
      if(typeof event === "function") {
          var yi,xl = x0,xr = x0+0.5*h,xi;
          e1 = event(xr,ymid[i-1]);
          ev = and(lt(e0,0),lt(0,e1));
          if(!any(ev)) { xl = xr; xr = x0+h; e0 = e1; e1 = event(xr,y1); ev = and(lt(e0,0),lt(0,e1)); }
          if(any(ev)) {
              var xc, yc, en,ei;
              var side=0, sl = 1.0, sr = 1.0;
              while(1) {
                  if(typeof e0 === "number") xi = (sr*e1*xl-sl*e0*xr)/(sr*e1-sl*e0);
                  else {
                      xi = xr;
                      for(j=e0.length-1;j!==-1;--j) {
                          if(e0[j]<0 && e1[j]>0) xi = min(xi,(sr*e1[j]*xl-sl*e0[j]*xr)/(sr*e1[j]-sl*e0[j]));
                      }
                  }
                  if(xi <= xl || xi >= xr) break;
                  yi = ret._at(xi, i-1);
                  ei = event(xi,yi);
                  en = and(lt(e0,0),lt(0,ei));
                  if(any(en)) {
                      xr = xi;
                      e1 = ei;
                      ev = en;
                      sr = 1.0;
                      if(side === -1) sl *= 0.5;
                      else sl = 1.0;
                      side = -1;
                  } else {
                      xl = xi;
                      e0 = ei;
                      sl = 1.0;
                      if(side === 1) sr *= 0.5;
                      else sr = 1.0;
                      side = 1;
                  }
              }
              y1 = ret._at(0.5*(x0+xi),i-1);
              ret.f[i] = f(xi,yi);
              ret.x[i] = xi;
              ret.y[i] = yi;
              ret.ymid[i-1] = y1;
              ret.events = ev;
              ret.iterations = it;
              return ret;
          }
      }
      x0 += h;
      y0 = y1;
      e0 = e1;
      h = min(0.8*h*pow(tol/erinf,0.25),4*h);
  }
  ret.iterations = it;
  return ret;
}

module.exports = { ode:dopri }

},{"./vector":32}],23:[function(require,module,exports){
function argmax(list) {
  let max = Number.NEGATIVE_INFINITY, index = null
  for (let k in list) {
    if (list[k] > max) { index=k; max=list[k] }
  }
  return {max, index}
}

module.exports = {argmax}
},{}],24:[function(require,module,exports){
const F = module.exports = {}

// Log-gamma function
F.gammaln = function gammaln(x) {
  var j = 0;
  var cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];
  var ser = 1.000000000190015;
  var xx, y, tmp;
  tmp = (y = xx = x) + 5.5;
  tmp -= (xx + 0.5) * Math.log(tmp);
  for (; j < 6; j++)
    ser += cof[j] / ++y;
  return Math.log(2.5066282746310005 * ser / xx) - tmp;
};


// gamma of x
F.gammafn = function gammafn(x) {
  var p = [-1.716185138865495, 24.76565080557592, -379.80425647094563,
           629.3311553128184, 866.9662027904133, -31451.272968848367,
           -36144.413418691176, 66456.14382024054
  ];
  var q = [-30.8402300119739, 315.35062697960416, -1015.1563674902192,
           -3107.771671572311, 22538.118420980151, 4755.8462775278811,
           -134659.9598649693, -115132.2596755535];
  var fact = false;
  var n = 0;
  var xden = 0;
  var xnum = 0;
  var y = x;
  var i, z, yi, res, sum, ysq;
  if (y <= 0) {
    res = y % 1 + 3.6e-16;
    if (res) {
      fact = (!(y & 1) ? 1 : -1) * Math.PI / Math.sin(Math.PI * res);
      y = 1 - y;
    } else {
      return Infinity;
    }
  }
  yi = y;
  if (y < 1) {
    z = y++;
  } else {
    z = (y -= n = (y | 0) - 1) - 1;
  }
  for (var i = 0; i < 8; ++i) {
    xnum = (xnum + p[i]) * z;
    xden = xden * z + q[i];
  }
  res = xnum / xden + 1;
  if (yi < y) {
    res /= yi;
  } else if (yi > y) {
    for (var i = 0; i < n; ++i) {
      res *= y;
      y++;
    }
  }
  if (fact) {
    res = fact / res;
  }
  return res;
};


// lower incomplete gamma function, which is usually typeset with a
// lower-case greek gamma as the function symbol
F.gammap = function gammap(a, x) {
  return F.lowRegGamma(a, x) * F.gammafn(a);
};


// The lower regularized incomplete gamma function, usually written P(a,x)
F.lowRegGamma = function lowRegGamma(a, x) {
  var aln = F.gammaln(a);
  var ap = a;
  var sum = 1 / a;
  var del = sum;
  var b = x + 1 - a;
  var c = 1 / 1.0e-30;
  var d = 1 / b;
  var h = d;
  var i = 1;
  // calculate maximum number of itterations required for a
  var ITMAX = -~(Math.log((a >= 1) ? a : 1 / a) * 8.5 + a * 0.4 + 17);
  var an, endval;

  if (x < 0 || a <= 0) {
    return NaN;
  } else if (x < a + 1) {
    for (; i <= ITMAX; i++) {
      sum += del *= x / ++ap;
    }
    return (sum * Math.exp(-x + a * Math.log(x) - (aln)));
  }

  for (; i <= ITMAX; i++) {
    an = -i * (i - a);
    b += 2;
    d = an * d + b;
    c = b + an / c;
    d = 1 / d;
    h *= d * c;
  }

  return (1 - h * Math.exp(-x + a * Math.log(x) - (aln)));
};

// natural log factorial of n
F.factorialln = function factorialln(n) {
  return n < 0 ? NaN : F.gammaln(n + 1);
};

// factorial of n
F.factorial = function factorial(n) {
  return n < 0 ? NaN : F.gammafn(n + 1);
};

// combinations of n, m
F.combination = function combination(n, m) {
  // make sure n or m don't exceed the upper limit of usable values
  return (n > 170 || m > 170)
      ? Math.exp(F.combinationln(n, m))
      : (F.factorial(n) / F.factorial(m)) / F.factorial(n - m);
};


F.combinationln = function combinationln(n, m){
  return F.factorialln(n) - F.factorialln(m) - F.factorialln(n - m);
};


// permutations of n, m
F.permutation = function permutation(n, m) {
  return F.factorial(n) / F.factorial(n - m);
};


// beta function
F.betafn = function betafn(x, y) {
  // ensure arguments are positive
  if (x <= 0 || y <= 0)
    return undefined;
  // make sure x + y doesn't exceed the upper limit of usable values
  return (x + y > 170)
      ? Math.exp(F.betaln(x, y))
      : F.gammafn(x) * F.gammafn(y) / F.gammafn(x + y);
};


// natural logarithm of beta function
F.betaln = function betaln(x, y) {
  return F.gammaln(x) + F.gammaln(y) - F.gammaln(x + y);
};


// Evaluates the continued fraction for incomplete beta function by modified
// Lentz's method.
F.betacf = function betacf(x, a, b) {
  var fpmin = 1e-30;
  var m = 1;
  var qab = a + b;
  var qap = a + 1;
  var qam = a - 1;
  var c = 1;
  var d = 1 - qab * x / qap;
  var m2, aa, del, h;

  // These q's will be used in factors that occur in the coefficients
  if (Math.abs(d) < fpmin)
    d = fpmin;
  d = 1 / d;
  h = d;

  for (; m <= 100; m++) {
    m2 = 2 * m;
    aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    // One step (the even one) of the recurrence
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin)
      d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin)
      c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    // Next step of the recurrence (the odd one)
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin)
      d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin)
      c = fpmin;
    d = 1 / d;
    del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < 3e-7)
      break;
  }

  return h;
};


// Returns the inverse of the lower regularized inomplete gamma function
F.gammapinv = function gammapinv(p, a) {
  var j = 0;
  var a1 = a - 1;
  var EPS = 1e-8;
  var gln = F.gammaln(a);
  var x, err, t, u, pp, lna1, afac;

  if (p >= 1)
    return Math.max(100, a + 100 * Math.sqrt(a));
  if (p <= 0)
    return 0;
  if (a > 1) {
    lna1 = Math.log(a1);
    afac = Math.exp(a1 * (lna1 - 1) - gln);
    pp = (p < 0.5) ? p : 1 - p;
    t = Math.sqrt(-2 * Math.log(pp));
    x = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t;
    if (p < 0.5)
      x = -x;
    x = Math.max(1e-3,
                 a * Math.pow(1 - 1 / (9 * a) - x / (3 * Math.sqrt(a)), 3));
  } else {
    t = 1 - a * (0.253 + a * 0.12);
    if (p < t)
      x = Math.pow(p / t, 1 / a);
    else
      x = 1 - Math.log(1 - (p - t) / (1 - t));
  }

  for(; j < 12; j++) {
    if (x <= 0)
      return 0;
    err = F.lowRegGamma(a, x) - p;
    if (a > 1)
      t = afac * Math.exp(-(x - a1) + a1 * (Math.log(x) - lna1));
    else
      t = Math.exp(-x + a1 * Math.log(x) - gln);
    u = err / t;
    x -= (t = u / (1 - 0.5 * Math.min(1, u * ((a - 1) / x - 1))));
    if (x <= 0)
      x = 0.5 * (x + t);
    if (Math.abs(t) < EPS * x)
      break;
  }

  return x;
};


// Returns the error function erf(x)
F.erf = function erf(x) {
  var cof = [-1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
             -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
             4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
             1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
             6.529054439e-9, 5.059343495e-9, -9.91364156e-10,
             -2.27365122e-10, 9.6467911e-11, 2.394038e-12,
             -6.886027e-12, 8.94487e-13, 3.13092e-13,
             -1.12708e-13, 3.81e-16, 7.106e-15,
             -1.523e-15, -9.4e-17, 1.21e-16,
             -2.8e-17];
  var j = cof.length - 1;
  var isneg = false;
  var d = 0;
  var dd = 0;
  var t, ty, tmp, res;

  if (x < 0) {
    x = -x;
    isneg = true;
  }

  t = 2 / (2 + x);
  ty = 4 * t - 2;

  for(; j > 0; j--) {
    tmp = d;
    d = ty * d - dd + cof[j];
    dd = tmp;
  }

  res = t * Math.exp(-x * x + 0.5 * (cof[0] + ty * d) - dd);
  return isneg ? res - 1 : 1 - res;
};


// Returns the complmentary error function erfc(x)
F.erfc = function erfc(x) {
  return 1 - F.erf(x);
};


// Returns the inverse of the complementary error function
F.erfcinv = function erfcinv(p) {
  var j = 0;
  var x, err, t, pp;
  if (p >= 2)
    return -100;
  if (p <= 0)
    return 100;
  pp = (p < 1) ? p : 2 - p;
  t = Math.sqrt(-2 * Math.log(pp / 2));
  x = -0.70711 * ((2.30753 + t * 0.27061) /
                  (1 + t * (0.99229 + t * 0.04481)) - t);
  for (; j < 2; j++) {
    err = F.erfc(x) - pp;
    x += err / (1.12837916709551257 * Math.exp(-x * x) - x * err);
  }
  return (p < 1) ? x : -x;
};


// Returns the inverse of the incomplete beta function
F.ibetainv = function ibetainv(p, a, b) {
  var EPS = 1e-8;
  var a1 = a - 1;
  var b1 = b - 1;
  var j = 0;
  var lna, lnb, pp, t, u, err, x, al, h, w, afac;
  if (p <= 0)
    return 0;
  if (p >= 1)
    return 1;
  if (a >= 1 && b >= 1) {
    pp = (p < 0.5) ? p : 1 - p;
    t = Math.sqrt(-2 * Math.log(pp));
    x = (2.30753 + t * 0.27061) / (1 + t* (0.99229 + t * 0.04481)) - t;
    if (p < 0.5)
      x = -x;
    al = (x * x - 3) / 6;
    h = 2 / (1 / (2 * a - 1)  + 1 / (2 * b - 1));
    w = (x * Math.sqrt(al + h) / h) - (1 / (2 * b - 1) - 1 / (2 * a - 1)) *
        (al + 5 / 6 - 2 / (3 * h));
    x = a / (a + b * Math.exp(2 * w));
  } else {
    lna = Math.log(a / (a + b));
    lnb = Math.log(b / (a + b));
    t = Math.exp(a * lna) / a;
    u = Math.exp(b * lnb) / b;
    w = t + u;
    if (p < t / w)
      x = Math.pow(a * w * p, 1 / a);
    else
      x = 1 - Math.pow(b * w * (1 - p), 1 / b);
  }
  afac = -F.gammaln(a) - F.gammaln(b) + F.gammaln(a + b);
  for(; j < 10; j++) {
    if (x === 0 || x === 1)
      return x;
    err = F.ibeta(x, a, b) - p;
    t = Math.exp(a1 * Math.log(x) + b1 * Math.log(1 - x) + afac);
    u = err / t;
    x -= (t = u / (1 - 0.5 * Math.min(1, u * (a1 / x - b1 / (1 - x)))));
    if (x <= 0)
      x = 0.5 * (x + t);
    if (x >= 1)
      x = 0.5 * (x + t + 1);
    if (Math.abs(t) < EPS * x && j > 0)
      break;
  }
  return x;
};


// Returns the incomplete beta function I_x(a,b)
F.ibeta = function ibeta(x, a, b) {
  // Factors in front of the continued fraction.
  var bt = (x === 0 || x === 1) ?  0 :
    Math.exp(F.gammaln(a + b) - F.gammaln(a) -
             F.gammaln(b) + a * Math.log(x) + b *
             Math.log(1 - x));
  if (x < 0 || x > 1)
    return false;
  if (x < (a + 1) / (a + b + 2))
    // Use continued fraction directly.
    return bt * F.betacf(x, a, b) / a;
  // else use continued fraction after making the symmetry transformation.
  return 1 - bt * F.betacf(1 - x, b, a) / b;
};


// Returns a normal deviate (mu=0, sigma=1).
// If n and m are specified it returns a object of normal deviates.
F.randn = function randn(n, m) {
  var u, v, x, y, q, mat;
  if (!m)
    m = n;
  if (n)
    return F.create(n, m, function() { return F.randn(); });
  do {
    u = Math.random();
    v = 1.7156 * (Math.random() - 0.5);
    x = u - 0.449871;
    y = Math.abs(v) + 0.386595;
    q = x * x + y * (0.19600 * y - 0.25472 * x);
  } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
  return v / u;
};


// Returns a gamma deviate by the method of Marsaglia and Tsang.
F.randg = function randg(shape, n, m) {
  var oalph = shape;
  var a1, a2, u, v, x, mat;
  if (!m)
    m = n;
  if (!shape)
    shape = 1;
  if (n) {
    mat = F.zeros(n,m);
    mat.alter(function() { return F.randg(shape); });
    return mat;
  }
  if (shape < 1)
    shape += 1;
  a1 = shape - 1 / 3;
  a2 = 1 / Math.sqrt(9 * a1);
  do {
    do {
      x = F.randn();
      v = 1 + a2 * x;
    } while(v <= 0);
    v = v * v * v;
    u = Math.random();
  } while(u > 1 - 0.331 * Math.pow(x, 4) &&
          Math.log(u) > 0.5 * x*x + a1 * (1 - v + Math.log(v)));
  // alpha > 1
  if (shape == oalph)
    return a1 * v;
  // alpha < 1
  do {
    u = Math.random();
  } while(u === 0);
  return Math.pow(u, 1 / oalph) * a1 * v;
};
},{}],25:[function(require,module,exports){
const uu6 = require('../../uu6')
const V = require('./vector')
const P = module.exports = require('./probFunction')
let {exp, log, pow, sqrt, PI, tan, atan, min } = Math

class Distribution {
  pdf(arg) {}
  cdf(arg) {}
  inv(arg) { let {p} = arg; uu6.be(p>=0 && p<=1) }
  mean(arg) {}
  medium(arg) { return this.mean(arg) }
  mode(arg) { return this.median(arg) } // 密度最大的點 -- https://en.wikipedia.org/wiki/Mode_(statistics)
  sample(arg) {
    let p = uu6.random(0, 1)
    return this.inv(Object.assign({}, arg, {p}))
  }
  variance(arg) {}
  sd(arg) { return sqrt(this.variance(arg)) }
}

class Uniform extends Distribution {
  pdf(arg) {
    let {x, a, b} = arg
    return (x < a || x > b) ? 0 : 1 / (b - a)
  }
  cdf(arg) {
    let {x, a, b} = arg
    if (x < a) return 0
    else if (x < b) return (x - a) / (b - a)
    return 1
  }
  inv(arg) {
    let {p, a, b} = arg
    return a + (p * (b - a))
  }
  mean(arg) {
    let {a, b} = arg
    return 0.5 * (a + b)
  }
  mode(arg) { throw new Error('Uniform has no mode() !') }
  variance(arg) {
    let {a, b} = arg
    return pow(b - a, 2) / 12;
  }
}

class Exp extends Distribution {
  pdf(arg) {
    let {x, rate} = arg
    return (x<0) ? 0: rate*exp(-rate*x)
  }
  cdf(arg) {
    let {x, rate} = arg
    return (x<0) ? 0: 1-exp(-rate*x)
  }
  inv(arg) {
    let {p, rate} = arg
    return -log(1-p)/rate
  }
  mean(arg) {
    let {rate} = arg
    return 1/rate
  }
  medium(arg) {
    let {rate} = arg
    return (1 / rate) * log(2)
  }
  mode(arg) { return 0 }
  variance(arg) {
    let {rate} = arg
    return 1/(rate*rate)
  }
}

class Normal extends Distribution {
  pdf(arg) {
    let {x, mu, sd} = arg
    let d = x-mu
    return 1/(sqrt(2*PI)*sd) * exp(-(d*d)/(2*sd*sd))
  }
  cdf(arg) {
    let {x, mu, sd} = arg
    return 0.5 * (1 + P.erf((x - mu) / sqrt(2*sd*sd)))
  }
  inv(arg) {
    let {p, mu, sd} = arg
    return -1.41421356237309505 * sd * P.erfcinv(2*p) + mu
  }
  mean(arg) {
    let {mu, sd} = arg
    return mu
  }
  variance(arg) {
    let {mu, sd} = arg
    return sd*sd
  }
}

class Beta extends Distribution {
  pdf(arg) {
    let {x, alpha, beta} = arg
    if (x > 1 || x < 0) return 0 // PDF is zero outside the support
    if (alpha == 1 && beta == 1) return 1 // PDF is one for the uniform case
    if (alpha < 512 && beta < 512) {
      return (pow(x, alpha - 1) * pow(1 - x, beta - 1)) / P.betafn(alpha, beta)
    } else {
      return exp((alpha - 1) * log(x) +
                      (beta - 1) * log(1 - x) -
                      P.betaln(alpha, beta))
    }
  }
  cdf(arg) {
    let {x, alpha, beta} = arg
    return (x > 1 || x < 0) ? (x > 1) * 1 : P.ibeta(x, alpha, beta)
  }
  inv(arg) {
    let {p, alpha, beta} = arg
    return P.ibetainv(p, alpha, beta)
  }
  mean(arg) {
    let {alpha, beta} = arg
    return alpha / (alpha + beta)
  }
  median(arg) {
    let {alpha, beta} = arg
    return P.ibetainv(0.5, alpha, beta)
  }
  mode(arg) {
    let {alpha, beta} = arg
    return (alpha - 1 ) / ( alpha + beta - 2)
  }
  variance(arg) {
    let {alpha, beta} = arg
    return (alpha * beta) / (pow(alpha + beta, 2) * (alpha + beta + 1));
  }
}

class F extends Distribution {
  pdf(arg) {
    let {x, df1, df2} = arg
    var p, q, f;
    if (x < 0) return 0
    if (df1 <= 2) {
      if (x === 0 && df1 < 2) return Infinity
      if (x === 0 && df1 === 2) return 1;
      return (1 / P.betafn(df1 / 2, df2 / 2)) *
              pow(df1 / df2, df1 / 2) *
              pow(x, (df1/2) - 1) *
              pow((1 + (df1 / df2) * x), -(df1 + df2) / 2)
    }
    p = (df1 * x) / (df2 + x * df1)
    q = df2 / (df2 + x * df1)
    f = df1 * q / 2.0
    return f * P.binomial.pdf({k:(df1 - 2) / 2, n:(df1 + df2 - 2) / 2, p})
  }
  cdf(arg) {
    let {x, df1, df2} = arg
    if (x < 0) return 0
    return P.ibeta((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2)
  }
  inv(arg) {
    let {p, df1, df2} = arg
    return df2 / (df1 * (1 / P.ibetainv(p, df1 / 2, df2 / 2) - 1))
  }
  mean(arg) {
    let {df1, df2} = arg
    return (df2 > 2) ? df2 / (df2 - 2) : undefined
  }
  variance(arg) {
    let {df1, df2} = arg
    if (df2 <= 4) return undefined
    return 2 * df2 * df2 * (df1 + df2 - 2) / (df1 * (df2 - 2) * (df2 - 2) * (df2 - 4))
  }
}

class Cauchy extends Distribution {
  pdf(arg) {
    let {x, local, scale} = arg
    if (scale < 0) return 0
    return (scale / (pow(x - local, 2) + pow(scale, 2))) / PI
  }
  cdf(arg) {
    let {x, local, scale} = arg
    return atan((x - local) / scale) / PI + 0.5
  }
  inv(arg) {
    let {p, local, scale} = arg
    return local + scale * tan(PI * (p - 0.5));
  }
  mean(arg) {
    let {local, scale} = arg
    return local
  }
}

class ChiSquare extends Distribution {
  pdf(arg) {
    let {x, dof} = arg
    if (x < 0) return 0
    return (x === 0 && dof === 2) ? 0.5 :
      exp((dof / 2 - 1) * log(x) - x / 2 - (dof / 2) * log(2) - P.gammaln(dof / 2))
  }
  cdf(arg) {
    let {x, dof} = arg
    if (x < 0) return 0
    return P.lowRegGamma(dof / 2, x / 2)
  }
  inv(arg) {
    let {p, dof} = arg
    return 2 * P.gammapinv(p, 0.5 * dof)
  }
  mean(arg) {
    let {dof} = arg
    return dof
  }
  median(arg) {
    let {dof} = arg
    return dof * pow(1 - (2 / (9 * dof)), 3)
  }
  mode(arg) {
    let {dof} = arg
    return (dof - 2 > 0) ? dof - 2 : 0
  }
  variance(arg) {
    let {dof} = arg
    return 2 * dof
  }
}

class Gamma extends Distribution {
  pdf(arg) {
    let {x, shape, scale} = arg
    if (x < 0) return 0
    return (x === 0 && shape === 1) ? 1 / scale :
          exp((shape - 1) * log(x) - x / scale - P.gammaln(shape) - shape * log(scale));
  }
  cdf(arg) {
    let {x, shape, scale} = arg
    if (x < 0) return 0
    return P.lowRegGamma(shape, x / scale)
  }
  inv(arg) {
    let {p, shape, scale} = arg
    return P.gammapinv(p, shape) * scale
  }
  mean(arg) {
    let {shape, scale} = arg
    return shape * scale
  }
  mode(arg) {
    let {shape, scale} = arg
    if(shape > 1) return (shape - 1) * scale;
    return undefined;
  }
  variance(arg) {
    let {shape, scale} = arg
    return shape * scale * scale
  }
}

class InvGamma extends Distribution {
  pdf(arg) {
    let {x, shape, scale} = arg
    if (x <= 0) return 0
    return exp(-(shape + 1) * log(x) - scale / x - P.gammaln(shape) + shape * log(scale))
  }
  cdf(arg) {
    let {x, shape, scale} = arg
    if (x <= 0) return 0
    return 1 - P.lowRegGamma(shape, scale / x)
  }
  inv(arg) {
    let {p, shape, scale} = arg
    return scale / P.gammapinv(1 - p, shape)
  }
  mean(arg) {
    let {shape, scale} = arg
    return (shape > 1) ? scale / (shape - 1) : undefined
  }
  mode(arg) {
    let {shape, scale} = arg
    return scale / (shape + 1)
  }
  variance(arg) {
    let {shape, scale} = arg
    if (shape <= 2) return undefined
    return scale * scale / ((shape - 1) * (shape - 1) * (shape - 2))
  }
}

class T extends Distribution {
  pdf(arg) {
    let {x, dof} = arg
    dof = dof > 1e100 ? 1e100 : dof
    return (1/(sqrt(dof) * P.betafn(0.5, dof/2))) * pow(1 + ((x * x) / dof), -((dof + 1) / 2))
  }
  cdf(arg) {
    let {x, dof} = arg
    var dof2 = dof / 2;
    return P.ibeta((x + sqrt(x * x + dof)) /
                   (2 * sqrt(x * x + dof)), dof2, dof2)
  }
  inv(arg) {
    let {p, dof} = arg
    var x = P.ibetainv(2 * min(p, 1 - p), 0.5 * dof, 0.5)
    x = sqrt(dof * (1 - x) / x)
    return (p > 0.5) ? x : -x
  }
  mean(arg) {
    let {dof} = arg
    return (dof > 1) ? 0 : undefined
  }
  median(arg) { return 0 }
  mode(arg) { return 0 }
  variance(arg) {
    let {dof} = arg
    return (dof  > 2) ? dof / (dof - 2) : (dof > 1) ? Infinity : undefined
  }
}

class Weibull extends Distribution {
  pdf(arg) {
    let {x, scale, shape} = arg
    if (x < 0 || scale < 0 || shape < 0)
      return 0;
    return (shape / scale) * pow((x / scale), (shape - 1)) * exp(-(pow((x / scale), shape)))
  }
  cdf(arg) {
    let {x, scale, shape} = arg
    return x < 0 ? 0 : 1 - exp(-pow((x / scale), shape))
  }
  inv(arg) {
    let {p, scale, shape} = arg
    return scale * pow(-log(1 - p), 1 / shape)
  }
  mean(arg) {
    let {scale, shape} = arg
    return scale * P.gammafn(1 + 1 / shape)
  }
  median(arg) {
    let {scale, shape} = arg
    return scale * pow(log(2), 1 / shape)
  }
  mode(arg) {
    let {scale, shape} = arg
    if (shape <= 1) return 0
    return scale * pow((shape - 1) / shape, 1 / shape)
  }
  variance(arg) {
    let {scale, shape} = arg
    return scale * scale * P.gammafn(1 + 2 / shape) -
        pow(P.weibull.mean(scale, shape), 2)
  }
}

class Binomial extends Distribution {
  pdf(arg) {
    let {k, p, n} = arg
    return (p === 0 || p === 1) ?
      ((n * p) === k ? 1 : 0) :
      P.combination(n, k) * pow(p, k) * pow(1 - p, n - k)
  }
  cdf(arg) {
    let {x, p, n} = arg
    if (x < 0) return 0
    if (x < n) {
      let binomarr = []
      for (let k=0; k <= x; k++) {
        binomarr[k] = this.pdf({k, p, n})
      }
      return V.sum(binomarr)
    }
    return 1;
  }
}

class NegBinomial extends Distribution {
  pdf(arg) {
    let {k, p, r} = arg
    if (k !== k >>> 0) return false
    if (k < 0) return 0
    return P.combination(k + r - 1, r - 1) * pow(1 - p, k) * pow(p, r);
  }
  cdf(arg) {
    let {x, p, r} = arg
    if (x < 0) return 0
    let sum = 0
    for (let k=0; k <= x; k++) {
      sum += P.negBinomial.pdf({k, r, p})
    }
    return sum
  }
}

class Poisson extends Distribution {
  pdf(arg) {
    let {k, l} = arg
    if (l < 0 || (k % 1) !== 0 || k < 0) return 0
    return pow(l, k) * exp(-l) / P.factorial(k)
  }
  cdf(arg) {
    let {x, l} = arg
    var sumarr = [], k = 0;
    if (x < 0) return 0;
    for (; k <= x; k++) {
      sumarr.push(P.poisson.pdf({k, l}))
    }
    return V.sum(sumarr)
  }
  mean(arg) { return 1 }
  variance(arg) { return 1 }
}

P.uniform = new Uniform()
P.exp = new Exp()
P.normal = new Normal()
P.beta = new Beta()
P.f = new F()
P.chiSquare = new ChiSquare()
P.cauchy = new Cauchy()
P.gamma = new Gamma()
P.invGamma = new InvGamma()
P.t = new T()
P.weibull = new Weibull()
P.binomial = new Binomial()
P.negBinomial = new NegBinomial()
// P.hyperGenomial = new HyperGenomial()
P.poisson = new Poisson()

Object.assign(P, {Distribution, Uniform, Exp, Normal, 
  Beta, F, ChiSquare, Cauchy, Gamma, InvGamma, T, Weibull, 
  Binomial, NegBinomial, Poisson })

},{"../../uu6":61,"./probFunction":24,"./vector":32}],26:[function(require,module,exports){
const F = require('./function')
const R = module.exports = {}

R.neg = function (x) { return {a:-x.a, b:x.b} }
R.inv = function (x) { return {a:x.b, b:x.a} }
R.add = function (x,y) { return {a:x.a*y.b+x.b*y.a, b:x.b*y.b} }
R.sub = function (x,y) { return {a:x.a*y.b-x.b*y.a, b:x.b*y.b} }
R.mul = function (x,y) { return {a:x.a*y.a, b:x.b*y.b} }
R.div = function (x,y) { return R.mul(x, R.inv(y)) }
R.str = function (x) { return x.a+'/'+x.b }

R.reduce = function (x) {
  var c = F.gcd(x.a, x.b)
  return {a:x.a/c, b:x.b/c}
}

R.ratio = function (s) {
  var m = s.match(/^(\d+)(\/(\d+))?$/);
  if (m == null) return
  var a = parseInt(m[1]);
  var b = typeof m[3]==='undefined'?1:parseInt(m[3]);
  return {a, b}
}

R.number = function (x) {
  return x.a/x.b
}

class Ratio {
  constructor(x) {
    if (typeof x === 'string') return new Ratio(R.ratio(x))
    this.a = x.a; this.b = x.b
  }
  neg() { return new Ratio(R.neg(this)) }
  inv() { return new Ratio(R.inv(this)) }
  add(y) { return new Ratio(R.add(this, y)) }
  sub(y) { return new Ratio(R.sub(this, y)) }
  mul(y) { return new Ratio(R.mul(this, y)) }
	div(y) { return new Ratio(R.div(this, y)) }
  clone() { return new Ratio(this) }
  toString() { return R.str(this) }
  reduce() { return new Ratio(R.reduce(this)) }
}

R.Ratio = Ratio

},{"./function":18}],27:[function(require,module,exports){
const F = require('./function')

class Series {
  constructor(f, p) {
    this.f = f
    this.p = p
  }

  sum(n, ...arg) {
    let r = 0
    for (let i=0; i<n; i++) {
      r += this.f(i)*this.p(i)(...arg)
      // console.log('r=', r)
    }
    return r
  }

  // forall f(i)*p(i) = y(i)
  solve(y, n) { throw Error('Series.sovle() not defined!') }
}

class PolynomialSeries extends Series {
  constructor(f) { 
    super(f, null)
    this.p = function (i) {
      return function (x) { return Math.pow(x, i) }
    }
  }
}

class Polynomial extends PolynomialSeries {
  constructor(c) {
    super(null)
    this.c = c
    this.f = function (i) {
      return (c[i] != null)? c[i] : 0
    }
  }
  sum(x) { return super.sum(this.c.length, x) }
}

class TylorSeries extends Series {
  constructor(df, x0=0) { // df(i) 代表對 f 進行 i 次微分的結果 ....
    super(null)
    this.f = function (i) {
      return df(i)(x0)/F.factorial(i)  // f^i(x0)/i!
    }
    this.p = function (i) {
      return function (x) { return Math.pow(x-x0, i) } // (x-x0)^i
    }
  }
}

let expSeries = (x0) => new TylorSeries((i)=>Math.exp, x0)
let sinSeries = (x0) => new TylorSeries(function (i) {
  let {sin, cos} = Math
  return [sin, cos, (x)=>-sin(x), (x)=>-cos(x)][i%4]
}, x0)

// https://en.wikipedia.org/wiki/Fourier_series
class FourierSeries extends Series {
  constructor(f) {
    super(f, null)
    this.p = function (n) {
      return function (x) { return C.exp(C.mul({i:n}, x)) }
    }
  }
}

module.exports = { 
  Series, PolynomialSeries, Polynomial, 
  TylorSeries, expSeries, sinSeries, 
  FourierSeries,
}

},{"./function":18}],28:[function(require,module,exports){
const S = module.exports = {}
const V = require('./vector')

S.euclidDistance = function (v1, v2) { // sqrt((v1-v2)*(v1-v2)T)
  let dv = V.sub(v1, v2)
  return Math.sqrt(V.dot(dv, dv))
}

/*

S.euclidDistance = function (v1, v2) { // sqrt((v1-v2)*(v1-v2)T)
  let dv = v1.sub(v2)
  return Math.sqrt(dv.dot(dv))
}

S.cosineSimilarity = function (v1, v2) {
  return v1.vdot(v2) / (v1.norm() * v2.norm())
}

S.manhattanDistance = function (v1, v2) { // sum(|v1-v2|)
  return v1.sub(v2).abs().sum()
}

S.chebyshevDistance = function (v1, v2) { // max(|v1-v2|)
  return v1.sub(v2).abs().max()
}
*/
},{"./vector":32}],29:[function(require,module,exports){
const S = module.exports = {}

S.random = function (a = 0, b = 1) {
  let r = a + (Math.random() * (b - a))
  return r
}

S.randomInt = function (a, b) {
  let r = S.random(a, b + 0.999999999)
  return Math.floor(r)
}

S.sample = function (space, probs) {
  if (probs == null) return space[S.randomInt(0, space.length - 1)]
  let p = S.random(0, 1)
  let sump = 0
  for (let i = 0; i < space.length; i++) {
    sump += probs[i]
    if (p <= sump) return space[i]
  }
  throw new Error('S.sample fail!')
}

S.samples = function (space, size, arg) {
  arg = S._.defaults(arg, {replace: true})
  if (arg.replace) {
    var results = []
    for (let i = 0; i < size; i++) {
      results.push(S.sample(space, arg.prob))
    }
    return results
// return _.times(size, ()=>_.sample(space));
  } else {
    if (space.length < size) throw Error('statistics.samples() : size > space.length')
    return S._.sampleSize(space, size)
  }
}

S.normalize = function (a) {
  var sum = S.T.sum(a)
  return a.map(function (x) { return x / sum })
}
/*
S.max = S.T.max
S.min = S.T.min
S.sum = S.T.sum
S.product = S.T.product
*/
// graphics
S.curve = function (f, from = -10, to = 10, step = 0.1) {
  var x = S.steps(from, to, step)
  var y = x.map1(f)
  return {type: 'curve', x: x, y: y}
}

S.hist = function (a, from, to, step = 1) {
  from = from || a.min()
  to = to || a.max()
  var n = Math.ceil((to - from + S.EPSILON) / step)
  var xc = S.steps(from + step / 2.0, to, step)
  var bins = S.V.new(n, 0)
  for (var i in a) {
    var slot = Math.floor((a[i] - from) / step)
    if (slot >= 0 && slot < n) {
      bins[slot]++
    }
  }
  return {type: 'histogram', xc: xc, bins: bins, from: from, to: to, step: step}
}

S.ihist = function (a) {
  return S.hist(a, a.min() - 0.5, a.max() + 0.5, 1)
}
},{}],30:[function(require,module,exports){
// tensor = {r, i, shape} ，若 i!=[] 則是複數張量
const T = module.exports = {}

const uu6 = require('../../uu6')
const {be} = uu6
const V = require('./vector')
const M = require('./matrix')
const C = require('./complex')
const RA = require('./ratio') 

T.new = function (o) {
  return {r:o.r||[], i:o.i||[], shape:o.shape}
}

T.dim = function (o) { return o.shape.length }

T.size = function (o) { return V.product(o.shape) }

T.offset = function (o, idx, lo) {
  let {r, shape} = o
  let len = shape.length
  lo = lo || V.array(len)
  let offset = idx[0]+lo[0]
  for (let i=1; i<len; i++) {
    offset = offset * shape[i] + idx[i] + lo[i]
  }
  return offset
}

T.get = function (o, ...idx) {
  let j = T.offset(o, idx)
  return {r: o.r[j], i: o.i[j] || 0}
}

T.set = function (o, ...idx) {
  let v = idx.pop() // idx 的最後一個是 value
  let j = T.offset(o.shape, idx)
  if (typeof v === 'number') {
    o.r[j] = v
  } else {
    o.r[j] = v.r; o.i[j] = v.i
  }
}

T.reshape = function (o, shape) {
  be(T.size(o) === T.size({r:0, shape}))
  o.shape = shape
  return o
}

function slice1d(v, shape, lo, hi) {
  if (v == null) return
  let [wi,wj,wk] = shape
  let [wi2,wj2,wk2] = [hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2]]
  let rv = new Array(wi2)
  for (let ri = 0, i=lo[0]; i<hi[0]; ri++, i++) rv[ri] = v[i]
  return rv
}

function slice2d(v, shape, lo, hi) {
  if (v == null) return
  let [wi,wj,wk] = shape
  let [wi2,wj2,wk2] = [hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2]]
  let rv = new Array(wi2)
  for (let ri=0, i=lo[0]; i<hi[0]; ri++, i++) {
    let rvi = rv[ri] = new Array(wj2)
    for (let rj=0, j=lo[1]; j<hi[1]; rj++, j++) {
      rvi[rj] = v[i*wj+j]
    }
  }
  return rv
}

function slice3d(v, shape, lo, hi) {
  if (v == null) return
  let [wi,wj,wk] = shape
  let [wi2,wj2,wk2] = [hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2]]
  let rv = new Array(wi2)
  for (let ri=0, i=lo[0]; i<hi[0]; ri++, i++) {
    let rvi = rv[ri] = new Array(wj2)
    for (let rj=0, j=lo[1]; j<hi[1]; rj++, j++) {
      let rvj = rvi[rj] = new Array(wk2)
      for (let rk=0, k=lo[2]; k<hi[2]; rk++, k++) {
        rvj[rk] = v[(i*wj+j)*wk+k]
      }
    }
  }
  return rv
}

T.sliceNdarray = function (o, lo, hi) {
  let {r, i, shape} = o
  let dim = shape.length
  if (dim === 1) return {r: slice1d(r, shape, lo, hi), i: slice1d(i, shape, lo, hi)}
  if (dim === 2) return {r: slice2d(r, shape, lo, hi), i: slice2d(i, shape, lo, hi)}
  if (dim === 3) return {r: slice3d(r, shape, lo, hi), i: slice3d(i, shape, lo, hi)}
  throw Error('sliceNdarray():dim > 3')
}

T.tensor2ndarray = T.ndarray = function (o) {
  return T.sliceNdarray(o, V.array(o.shape.length), o.shape).r
}

T.ndarray2tensor = function (nd) {
  let t = null
  if (!Array.isArray(nd[0])) {
    t = { r: nd, shape: [nd.length] }
    return t
  }
  let rows = nd.length
  uu6.be(rows > 0)
  let r = [], cols = nd[0].length
  for (let i=0; i<rows; i++) {
    uu6.be(nd[i].length === cols)
    t = T.ndarray2tensor(nd[i])
    r = r.concat(t.r)
  }
  t.shape.unshift(nd.length)
  return {r: r, i:[], shape: t.shape }
}

T.str = function (o) {
  return uu6.json(T.tensor2ndarray(o))
}

T.op1 = function (a, op) {
  return {
    r: V[op](a.r),
    shape: a.shape,
  }
}
T.neg = (a, b) => T.op1(a, 'neg')

// ============================= op2 ==================================
function toC(o) {
  if (o.r != null && o.i != null) return o
  // if (typeof o === 'number') return {r:o, i:0}
  if (!Array.isArray(o)) return { r:o, i:0 } // 基本型態
  return {r:o, i:[]}
}

T.op2 = function (a, b, op) {
  a = toC(a); b = toC(b)
  return {
    r: V[op](a.r, b.r),
    i: V[op](a.i, b.i),
    shape: a.shape || b.shape
  }
}

T.add = (a, b) => T.op2(a, b, 'add')
T.sub = (a, b) => T.op2(a, b, 'sub')
T.mod = (a, b) => T.op2(a, b, 'mod')
T.and = (a, b) => T.op2(a, b, 'and')
T.or  = (a, b) => T.op2(a, b, 'or')
T.xor = (a, b) => T.op2(a, b, 'xor')
T.band= (a, b) => T.op2(a, b, 'band')
T.bor = (a, b) => T.op2(a, b, 'bor')
T.bxor= (a, b) => T.op2(a, b, 'bxor')
T.eq  = (a, b) => T.op2(a, b, 'eq')
T.neq = (a, b) => T.op2(a, b, 'neq')
T.lt  = (a, b) => T.op2(a, b, 'lt')
T.gt  = (a, b) => T.op2(a, b, 'gt')
T.leq = (a, b) => T.op2(a, b, 'leq')
T.geq = (a, b) => T.op2(a, b, 'geq')

T.cOp2 = function (a, b, op) {
  a = toC(a); b = toC(b)
  let aT = (a.shape != null), bT = (b.shape != null)
  let Cop = C[op]
  if (!aT && !bT) return Cop(a, b)
  if (a.i.length === 0 && b.i.length === 0) return {r:T.op2(a.r, b.r, op), i:[], shape: a.shape}
  let len = a.r.length || b.r.length, t = T.new({r:new Array(len), i:new Array(len), shape:a.shape || b.shape})
  let tr = t.r, ti = t.i, ar=a.r, ai=a.i, br=b.r, bi=b.i
  // console.log('a=%j b=%j ar=%j ai=%j br=%j bi=%j', a, b, ar, ai, br, bi)
  for (let j=0; j<len; j++) {
    let aj = aT ? {r: ar[j]||0, i: ai[j]||0} : a
    let bj = bT ? {r: br[j]||0, i: bi[j]||0} : b 
    let tj = Cop(aj, bj)
    // console.log('aj=%j bj=%j tj=%j', aj, bj, tj)
    tr[j] = tj.r; ti[j] = tj.i
  }
  return t
}

T.mul = function (a, b) { return T.cOp2(a, b, 'mul') }
T.pow = function (a, b) { return T.cOp2(a, b, 'pow') }
T.div = function (a, b) { return T.cOp2(a, b, 'div') }

// ============================= matrix ==================================
let beMatrix = T.beMatrix = function (o) {
  // let d = T.dim(o)
  // console.log('beMatrix:d=%d', d)
  uu6.be(T.dim(o) == 2)
}
T.rows = function (o) { beMatrix(o); return o.shape[0] }
T.cols = function (o) { beMatrix(o); return o.shape[1] }
T.rowSum = function (o) { beMatrix(o)
  let rows = T.rows(o), cols = T.cols(o)
  let s = V.array(rows), r = o.r
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      s[i] += r[i*cols+j]
    }
  }
  return {r:s, shape:[rows]}
}

T.rowMean = function (o) { beMatrix(o)
  let rows = T.rows(o), cols = T.cols(o);
  return {r: V.div(T.rowSum(o).r, cols), shape:[rows] }
}

T.colSum = function (o) { beMatrix(o)
  let rows = T.rows(o), cols = T.cols(o)
  let s = V.array(cols), r = o.r
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      s[j] += r[i*cols+j]
    }
  }
  return {r:s, shape:[cols]}
}

T.colMean = function (o) { beMatrix(o)
  let rows = T.rows(o), cols = T.cols(o);
  return {r: V.div(T.colSum(o), rows), shape: [cols] }
}

T.transpose = function (o) { beMatrix(o)
  let rows = T.rows(o), cols=T.cols(o)
  let t = T.new({shape:[cols, rows], r: V.array(rows*cols) })
  for (let i=0; i<rows; i++) {
    for (let j=0; j<cols; j++) {
      t.r[j*rows+i] = o.r[i*cols+j]
    }
  }
  return t
}

T.mdot = function (a, b) { beMatrix(a); beMatrix(b)
  let arows = T.rows(a), acols=T.cols(a), bcols = T.cols(b)
  let t = T.new({shape:[arows, bcols], r: V.array(arows*bcols) })
  for (let i = 0; i < arows; i++) {
    for (let j = 0; j < acols; j++) {
      for (let k=0; k<bcols; k++) {
        t.r[i*acols+k] += a.r[i*acols+j] * b.r[j*bcols+k]
      }
    }
  }
  return t
}

T.diag = function (o) { beMatrix(o)
  let a = o, ar = a.r, [rows, cols] = a.shape
  let r = V.array(rows)
  for (let i = 0; i < rows; i++) {
    r[i] = ar[i][i]
  }
  return r
}

T.inv = function (o) { beMatrix(o)
  let a = T.tensor2ndarray(o)
  let ia = M.inv(a)
  return T.ndarray2tensor(ia)
}

T.det = function (o) { beMatrix(o)
  let a = T.tensor2ndarray(o)
  return M.det(a)
}

T.lu = function (o) { beMatrix(o)
  let a = T.tensor2ndarray(o)
  return M.lu(a)
}

T.svd = function (o) { beMatrix(o)
  let a = T.tensor2ndarray(o)
  return M.svd(a)
}

T.solve = function (o, b) { beMatrix(o)
  let a = T.tensor2ndarray(o)
  return M.solve(a, b)
}

},{"../../uu6":61,"./complex":15,"./matrix":20,"./ratio":26,"./vector":32}],31:[function(require,module,exports){
// 來源 -- https://gist.github.com/mbitsnbites/a065127577ff89ff885dd0a932ec2477
// 參考 -- https://en.wikipedia.org/wiki/Discrete_Fourier_transform

function FFT(x) {
  var m = x.r.length / 2, k, X={r:[], i:[]}, Y={r:[], i:[]}

  for (k = 0; k < m; ++k) {
    X.r[k] = x.r[2 * k];
    X.i[k] = x.i[2 * k];
    Y.r[k] = x.r[2 * k + 1];
    Y.i[k] = x.i[2 * k + 1];
  }

  if (m > 1) {
    FFT(X)
    FFT(Y)
  }

  for (k = 0; k < m; ++k) {
    var a, b, tw = {}
    a = -Math.PI * k / m, tw.r = Math.cos(a), tw.i = Math.sin(a);
    a = tw.r * Y.r[k] - tw.i * Y.i[k];
    b = tw.r * Y.i[k] + tw.i * Y.r[k];
    x.r[k] = X.r[k] + a;
    x.i[k] = X.i[k] + b;
    x.r[k + m] = X.r[k] - a;
    x.i[k + m] = X.i[k] - b;
  }
}

// 參考: Four Ways to Compute an Inverse FFT Using the Forward FFT Algorithm
// https://www.dsprelated.com/showarticle/800.php
function iFFT(x) {
  let X = {r:[x.r[0]].concat(x.r.slice(1).reverse()),
           i:[x.i[0]].concat(x.i.slice(1).reverse())}
  FFT(X)
  let N = X.r.length
  for (let i=0; i<N; i++) {
    x.r[i] = X.r[i]/N
    x.i[i] = X.i[i]/N
  }
}

// 找出 2^k > n 的 k 傳回
function toPow2(n) {
  let k = Math.ceil(Math.log2(n))
  return Math.pow(2, k)
}

function extendPow2(a) {
  let alen = a.length
  let N = toPow2(a.length)
  for (let i=alen; i<N; i++) a.push(a[i-alen])
}

function fft(x) {
  extendPow2(x.r)
  extendPow2(x.i)
  FFT(x)
}

function ifft(X) {
  iFFT(X)
}

module.exports = { fft, ifft }


},{}],32:[function(require,module,exports){
const uu6 = require('../../uu6')
const V = module.exports = {}

V.array = uu6.array
V.range = uu6.range
V.steps = uu6.steps

V.random = function (r, min=0, max=1) {
  let len = r.length
  for (let i=0; i<len; i++) {
    r[i] = uu6.random(min, max)
  }
}

V.assign = function (r, o) {
  let isC = (typeof o === 'number')
  if (!isC) uu6.be(r.length === o.length)
  let len = r.length
  for (let i=0; i<len; i++) {
    r[i] = isC ? o : o[i]
  }
  return r
}

V.normalize = function (r) {
  let ar = V.abs(r)
  let s = V.sum(ar) // 不能用 sum，sum 只適用於機率。
  let len = r.length
  for (let i=0; i<len; i++) {
    r[i] = (s==0) ? 0 : r[i]/s
  }
  return r
}

function op2(op) { // 這個函數強調速度，所以會比較長 ...
  let text = `
  var ai, bi, i, c
  let aA = Array.isArray(a)
  let bA = Array.isArray(b)
  let len = a.length || b.length
  if (aA && bA) {
    c = new Array(len)
    for (let i=0; i<len; i++) {
      ai=a[i]
      bi=b[i]
      c[i] = ${op}
    }
    return c
  }
  if (!aA && !bA) { ai=a; bi=b; return ${op} }
  c = new Array(len)
  for (let i=0; i<len; i++) {
    ai=(aA) ? a[i] : a
    bi=(bA) ? b[i] : b
    c[i] = ${op}
  }
  return c
  `
  return new Function('a', 'b', text)
}

V.add = op2('ai+bi')
V.sub = op2('ai-bi')
V.mul = op2('ai*bi')
V.div = op2('ai/bi')
V.mod = op2('ai%bi')
V.pow = op2('Math.pow(ai,bi)')
V.and = op2('ai&&bi')
V.or  = op2('ai||bi')
V.xor = op2('(ai || bi) && !(ai && bi)')
V.band= op2('ai&bi')
V.bor = op2('ai|bi')
V.bxor= op2('ai^bi')
V.eq  = op2('ai==bi')
V.neq = op2('ai!=bi')
V.lt  = op2('ai<bi')
V.gt  = op2('ai>bi')
V.leq = op2('ai<=bi')
V.geq = op2('ai>=bi')


// Uniary Operation
V.op1 = function (op) {
  let text = `
  var ai
  let aA = Array.isArray(a)
  if (!aA) { ai=a; return ${op} }
  let len = a.length
  let c = new Array(len)
  for (let i=0; i<len; i++) {
    ai=a[i]
    c[i] = ${op}
  }
  return c
  `
  return new Function('a', text)
}

V.neg = V.op1('-ai')
V.abs = V.op1('Math.abs(ai)')
V.log = V.op1('Math.log(ai)')
V.not = V.op1('!ai')

// 累積性運算
V.dot = function (a,b) {
  let len = a.length
  let r = 0
  for (let i=0; i<len; i++) {
    r += a[i] * b[i]
  }
  return r
}

V.min = function (a) {
  let len = a.length, r = a[0]
  for (let i=1; i<len; i++) {
    if (a[i] < r) r = a[i]
  }
  return r
}

V.max = function (a) {
  let len = a.length, r = a[0]
  for (let i=1; i<len; i++) {
    if (a[i] > r) r = a[i]
  }
  return r
}

V.any = function (a) {
  let len = a.length
  for (let i=0; i<len; i++) {
    if (a[i]) return true
  }
  return false
}

V.all = function (a) {
  let len = a.length
  for (let i=0; i<len; i++) {
    if (!a[i]) return false
  }
  return true
}

V.sum = function(a) {
  let len = a.length
  let r = 0
  for (let i=0; i<len; i++) {
    r += a[i]
  }
  return r
}

V.product = function(a) {
  let len = a.length
  let r = 1
  for (let i=0; i<len; i++) {
    r *= a[i]
  }
  return r
}

V.norm = function (a) {
  let a2 = V.pow(a, 2)
  return Math.sqrt(V.sum(a2))
}

V.norminf = function (a) {
  let len = a.length
  let r = 0
  for (let i=0; i<len; i++) {
    r = Math.max(r, Math.abs(a[i]))
  }
  return r
}

// norminf: ['accum = max(accum,abs(xi));','var accum = 0, max = Math.max, abs = Math.abs;'],

V.mean = function(a) {
  return V.sum(a)/a.length
}

V.sd = function (a) {
  let m = V.mean(a)
  let diff = V.sub(a, m)
  let d2 = V.pow(diff, 2)
  return Math.sqrt(V.sum(d2)/(a.length-1))
}

const EPSILON = 0.00000001

V.hist = function (a, from = Math.floor(V.min(a)), to=Math.ceil(V.max(a)), step = 1) {
  // from = (from==null) ?  : from
  // to   = (to==null) ?  : to
  var n = Math.ceil((to - from + EPSILON) / step)
  var xc = V.range(from + step / 2.0, to, step)
  var bins = V.array(n, 0)
  let len = a.length
  for (let i=0; i<len; i++) {
    var slot = Math.floor((a[i] - from) / step)
    if (slot >= 0 && slot < n) {
      bins[slot]++
    }
  }
  return {type: 'histogram', xc: xc, bins: bins, from: from, to: to, step: step}
}

class Vector {
  constructor(o) { this.v = (Array.isArray(o))?o.slice(0):new Array(o) }
  static random(n, min=0, max=1) { return new Vector(V.random(n, min, max)) }
  static range(begin, end, step=1) { return new Vector(V.range(begin, end, step)) }
  static zero(n) { return new Vector(n) }
  assign(o) { let a=this; V.assign(a.v, o); return a }
  random(min=0, max=1) { this.v = V.random(n, min, max) }
  add(b) { let a=this; return a.clone(V.add(a.v,b.v)) }
  sub(b) { let a=this; return a.clone(V.sub(a.v,b.v)) } 
  mul(b) { let a=this; return a.clone(V.mul(a.v,b.v)) } 
  div(b) { let a=this; return a.clone(V.div(a.v,b.v)) } 
  mod(b) { let a=this; return a.clone(V.mod(a.v,b.v)) }
  neg() { let a=this; return a.clone(V.neg(a.v)) }
  dot(b) { let a=this; return V.dot(a.v,b.v) }
  min() { let a=this; return V.min(a.v) }
  max() { let a=this; return V.max(a.v) }
  sum() { let a=this; return V.sum(a.v) }
  norm() { let a=this; return V.norm(a.v)  }
  mean() { let a=this; return V.mean(a.v) }
  sd() { let a=this; return V.sd(a.v) }
  toString() { return this.v.toString() }
  clone(v) { return new Vector(v||this.v) }
  hist(from, to, step) { let a = this; return V.hist(a.v, from, to, step) }
  get length() { return this.v.length }
}

V.Vector = Vector

V.vector = function (o) {
  return new Vector(o)
}

/*
V.new = function (n, value = 0) {
  let a = new Array(n)
  return a.fill(value)
}

V.fill = function (a, value = 0) {
  return a.fill(value)
}

V.range = function (begin, end, step=1) {
  let len = Math.floor((end-begin)/step)
  let a = new Array(len)
  let i = 0
  for (let t=begin; t<end; t+=step) {
    a[i++] = t
  }
  return a
}

V.random = function (len, min=0, max=1) {
  let r = new Array(len)
  for (var i = 0; i < len; i++) {
    r[i] = R.random(min, max)
  }
  return r
}
*/

/*
V.op = function (a, b, f) {
  let aisa = Array.isArray(a)
  let bisa = Array.isArray(b)
  if (!aisa && !bisa) return f(a,b)
  let len = a.length || b.length
  let r = new Array(len)
  for (let i=0; i<len; i++) {
    let ai = aisa ? a[i] : a
    let bi = bisa ? b[i] : b
    r[i] = f(ai, bi)
  }
  return r
}

V.add = (a,b)=>V.op(a,b,(x,y)=>x+y)
*/

/*
V.oadd = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] + b[i]
}

V.osub = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] - b[i]
}

V.omul = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] * b[i]
}

V.odiv = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] / b[i]
}

V.omod = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] % b[i]
}

V.opow = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = Math.pow(a[i], b[i])
}

// logical
V.oand = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] && b[i]
}

V.oor  = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] || b[i]
}

V.oxor  = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = ( a[i] || b[i] ) && !( a[i] && b[i] )
}

// compare
V.olt = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] < b[i]
}

V.ogt = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] > b[i]
}

V.oeq = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] === b[i]
}

V.oneq = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] !== b[i]
}

V.oleq = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] <= b[i]
}

V.ogeq = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] >= b[i]
}

// bit operator
V.oband = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] & b[i]
}

V.obor = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] | b[i]
}

V.obxor = function (r, a, b, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] ^ b[i]
}

V.op2 = function (a, b, f2) {
  uu6.be(Array.isArray(a) && a.length === b.length)
  let len = a.length
  let r = new Array(len)
  f2(r, a, b, len)
  return r
}

V.add = function (a, b) { return V.op2(a, b, V.oadd) }
V.sub = function (a, b) { return V.op2(a, b, V.osub) }
V.mul = function (a, b) { return V.op2(a, b, V.omul) }
V.div = function (a, b) { return V.op2(a, b, V.odiv) }
V.mod = function (a, b) { return V.op2(a, b, V.omod) }
V.pow = function (a, b) { return V.op2(a, b, V.opow) }
V.and = function (a, b) { return V.op2(a, b, V.oand) }
V.or  = function (a, b) { return V.op2(a, b, V.oor) }
V.xor = function (a, b) { return V.op2(a, b, V.oxor) }
V.eq  = function (a, b) { return V.op2(a, b, V.oeq) }
V.neq = function (a, b) { return V.op2(a, b, V.oneq) }
V.lt  = function (a, b) { return V.op2(a, b, V.olt) }
V.gt  = function (a, b) { return V.op2(a, b, V.ogt) }
V.leq = function (a, b) { return V.op2(a, b, V.oleq) }
V.geq = function (a, b) { return V.op2(a, b, V.ogeq) }
V.band= function (a, b) { return V.op2(a, b, V.oband) }
V.bor = function (a, b) { return V.op2(a, b, V.obor) }
V.bxor= function (a, b) { return V.op2(a, b, V.obxor) }

// Constant Operation
V.oaddc = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] + c
}

V.osubc = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] - c
}

V.omulc = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] * c
}

V.odivc = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] / c
}

V.omodc = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = a[i] % c
}

V.opowc = function (r, a, c, len) {
  for (let i = 0; i < len; i++) r[i] = Math.pow(a[i], c)
}

V.oandc = function (r, a, c, len) {
  for (let i = 0; i < len; i++) r[i] = a[i] && c
}

V.ocadd = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = c + a[i]
}

V.ocsub = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = c - a[i]
}

V.ocmul = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = c * a[i]
}

V.ocdiv = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = c / a[i]
}

V.ocmod = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = c % a[i]
}

V.ocpow = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = Math.pow(c, a[i])
}

V.ocand = function (r, a, c, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = c && a[i]
}

V.opc = function (a, c, fc) {
  uu6.be(Array.isArray(a) && !Array.isArray(c))
  let len = a.length
  let r = new Array(len)
  fc(r, a, c, len)
  return r
}

V.addc = function (a, c) { return V.opc(a, c, V.oaddc) }
V.subc = function (a, c) { return V.opc(a, c, V.osubc) }
V.mulc = function (a, c) { return V.opc(a, c, V.omulc) }
V.divc = function (a, c) { return V.opc(a, c, V.odivc) }
V.modc = function (a, c) { return V.opc(a, c, V.omodc) }
V.powc = function (a, c) { return V.opc(a, c, V.opowc) }
V.andc = function (a, c) { return V.opc(a, c, V.oandc) }
V.ltc = function (a, c) { return V.opc(a, c, V.oltc) }

V.cadd = function (c, a) { return V.opc(a, c, V.ocadd) }
V.csub = function (c, a) { return V.opc(a, c, V.ocsub) }
V.cmul = function (c, a) { return V.opc(a, c, V.ocmul) }
V.cdiv = function (c, a) { return V.opc(a, c, V.ocdiv) }
V.cmod = function (c, a) { return V.opc(a, c, V.ocmod) }
V.cpow = function (c, a) { return V.opc(a, c, V.ocpow) }
V.cand = function (c, a) { return V.opc(a, c, V.ocand) }
V.clt  = function (c, a) { return V.opc(a, c, V.oclt) }

// Uniary Operation
V.oneg = function (r, a, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = -a[i]
}

V.oabs = function (r, a, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = Math.abs(a[i])
}

V.olog = function (r, a, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = Math.log(a[i])
}

V.onot = function (r, a, len = a.length) {
  for (let i = 0; i < len; i++) r[i] = !a[i]
}

V.op1 = function (a, f1) {
  let len = a.length
  let r = new Array(len)
  f1(r, a, len)
  return r
}

V.neg = function (a) { return V.op1(a, V.oneg) }
V.abs = function (a) { return V.op1(a, V.oabs) }
V.log = function (a) { return V.op1(a, V.olog) }
V.not = function (a) { return V.op1(a, V.onot) }
*/
},{"../../uu6":61}],33:[function(require,module,exports){
module.exports = require('./src/ml6')

},{"./src/ml6":40}],34:[function(require,module,exports){
// 參考文獻：Numerical example to understand Expectation-Maximization -- http://ai.stanford.edu/~chuongdo/papers/em_tutorial.pdf
// What is the expectation maximization algorithm? (PDF) -- http://stats.stackexchange.com/questions/72774/numerical-example-to-understand-expectation-maximization

class EM {
  constructor(p) {
    this.p = p || {}
    this.p.maxLoops = this.p.maxLoops || 1000
    this.p.minDelta = this.p.minDelta || 0.001
  }
  estimate() { throw Error('EM:estimate() not defined!') }
  maximize() { throw Error('EM:maximize() not defined!') }
  run() {
    console.log('===========run===============')
    let { maxLoops, minDelta } = this.p
    let delta = 9.99999
    console.log('p=%j', this.p)
    for (let gen=0; gen<maxLoops && delta > minDelta; gen++) {
      let p1 = this.estimate()
      delta = this.maximize(p1)
    }
  }
}

module.exports = {EM}
},{}],35:[function(require,module,exports){
class Player {
  constructor(arg) {
    let {i, ep, L} = arg
    this.i = i
    this.L = L
    this.ep = ep // 對方坦白的機率 p[ei, 1] = ep, 對方抵賴的機率 p[ei, 0] = 1-ep
  }
  action () {
    var lF, lT, {i, ep, L} = this
    if (i === 0) {
      //              我 對               我 對
      lF = (1-ep) * L[0][0][i] + (ep) * L[0][1][i]   // 我方抵賴 : 對方抵賴*我方的損失 + 對方坦白*我方的損失
      lT = (1-ep) * L[1][0][i] + (ep) * L[1][1][i]   // 我方坦白 : 對方抵賴*我方的損失 + 對方坦白*我方的損失  
    } else if (i === 1) {
      //              對 我               對 我
      lF = (1-ep) * L[0][0][i] + (ep) * L[1][0][i]   // 我方抵賴 : 對方抵賴*我方的損失 + 對方坦白*我方的損失
      lT = (1-ep) * L[0][1][i] + (ep) * L[1][1][i]   // 我方坦白 : 對方抵賴*我方的損失 + 對方坦白*我方的損失  
    }
    // console.log('%d: lF=%d lT=%d', i, lF, lT)
    return (lT > lF) ? 'T' : 'F'  // 坦白的期望損失小就坦白，抵賴的期望損失小就抵賴
  }
  get (eAction) {
    let {ep} = this
    if (eAction == 'T') ep += 0.01; else ep -= 0.01
    if (ep > 1) ep = 1
    if (ep < 0) ep = 0
    this.ep = ep
  }
}

function game22(args) {
  let {maxLoops, ep0, ep1, name} = args
  console.log('================Game : %s======================', name)
  let p0 = new Player({i:0, ep:ep0, L:args.L})
  let p1 = new Player({i:1, ep:ep1, L:args.L})
  for (let i=0; i<maxLoops; i++) {
    let a0 = p0.action(), a1 = p1.action()
    p1.get(a0); p0.get(a1)
    console.log('a0=%s a1=%s p0.ep=%d p1.ep=%d', a0, a1, p0.ep.toFixed(4), p1.ep.toFixed(4))
    // console.log('p0=%j p1=%j', p0, p1)
  }
}

module.exports = {Player, game22}

},{}],36:[function(require,module,exports){
// 參考： https://zh.wikipedia.org/wiki/%E7%BB%B4%E7%89%B9%E6%AF%94%E7%AE%97%E6%B3%95
const {argmax} = require('../../ma6')
const M = module.exports = {} 

M.viterbi = function (obs, states, P) {
  console.log('觀察到的序列=', obs)
  const T = [{}] // Viterbi Table
  let path = {}  // path[state] = 從 0 到 t 到達 state 機率最大的 path
  for (let y of states) { // # Initialize base cases (t == 0)
    T[0][y] = P[y] * P[y+'=>'+obs[0]]
    path[y] = [y]
  }
  // console.log('T=%j path=%j', T, path)
  for (let t=1; t<obs.length; t++) { // # Run Viterbi for t > 0
    T[t] = {}
    let newpath = {}
    for (let y of states) {
      let {max:prob, index:si} = argmax(states.map((y0)=>T[t-1][y0] * P[y0+'=>'+y] * P[y+'=>'+obs[t]]))
      let state = states[si]
      // console.log('y=%s prob=%d state=%s', y, prob, state)
      T[t][y] = prob
      newpath[y] = path[state].concat(y)
    }
    // console.log('t=%d T=%j', t, T)
    path = newpath
    console.log('t=%d path=%j', t, path)
  }
  let {max:prob, index:si} = argmax(states.map((y)=>T[obs.length - 1][y]))
  console.log('T=%j', T)
  return {prob, path:path[states[si]]}
}

},{"../../ma6":11}],37:[function(require,module,exports){
// ref : https://dotblogs.com.tw/dragon229/2013/02/04/89919
const ma6 = require('../../ma6')
const uu6 = require('../../uu6')
const V = ma6.V, M = ma6.M
const KMean = module.exports = {}

KMean.loadData = function (data) {
  KMean.data = data
}

KMean.initialize = function (k) {
  KMean.k = k
  KMean.centers = uu6.samples(KMean.data, k)
}

KMean.grouping = function (distance) {
  var data = KMean.data
  var k = KMean.k
  var groups = Array(k).fill(0)
  var totalDist = 0
  for (var di = 0; di < data.length; di++) {
    var minDist = Number.MAX_VALUE
    var minGroup = 0
    for (var gi = 0; gi < k; gi++) {
      var dist = distance(KMean.centers[gi], data[di])
      if (dist < minDist) {
        minDist = dist
        minGroup = gi
      }
    }
    groups[di] = minGroup
    totalDist += minDist
  }
  console.log('totalDist = %d', totalDist)
  return groups
}

KMean.centering = function () {
  var data = KMean.data
  var groups = KMean.groups
  var k = KMean.k
  var counts = Array(k).fill(0)
  var newCenters = M.new(k, data[0].length)
  for (let i = 0; i < data.length; i++) {
    var gi = groups[i]
    newCenters[gi] = V.add(newCenters[gi], data[i])
    counts[gi] ++
  }
  for (let gi = 0; gi < k; gi++) {
    if (counts[gi] > 0) { // 如果 counts[gi] == 0 不能除，這一群沒有人！
      newCenters[gi] = V.div(newCenters[gi], counts[gi])
    }
  }
  return newCenters
}

KMean.run = function (data, k, maxLoop) {
  KMean.loadData(data)
  KMean.initialize(k)
  for (var i = 0; i < maxLoop; i++) {
    console.log('============== loop ' + i + '================')
    KMean.groups = KMean.grouping(ma6.euclidDistance)
    console.log('groups=%j', KMean.groups)
    KMean.centers = KMean.centering()
    console.log('centers=%j', KMean.centers)
  }
  return KMean.data
}

},{"../../ma6":11,"../../uu6":61}],38:[function(require,module,exports){
let KNN = module.exports = {}

KNN.loadQA = function (QA) {
  KNN.QA = QA
}

KNN.kNearestNeighbors = function (item, k = 1, distance=KNN.distance) {
  var QA = KNN.QA
  var d = []
  for (var i = 0; i < QA.length; i++) {
    let qad = {dist: distance(item, QA[i].Q), qa: QA[i]}
    d.push(qad)
  }
  d.sort((o1, o2) => o1.dist - o2.dist)
  return d.slice(0, k)
}

KNN.countMap = function (kneighbors) {
  let aCount = {}
  for (let i=0; i<kneighbors.length; i++) {
    let A = kneighbors[i].qa.A
    aCount[A] = (aCount[A] == null) ? 1 : aCount[A] + 1
  }
  return aCount
}

KNN.maxLabel = function (countMap) {
  let label = null, max = 0
  for (let k in countMap) {
    let count = countMap[k]
    if (count > max) {
      label = k
      max = count
    }
  }
  return label
}

KNN.answer = function (item, k = 1, distance=KNN.distance) {
  let kneighbors = KNN.kNearestNeighbors(item, k, distance)
  console.log('kneighbors=%j', kneighbors)
  let countMap = KNN.countMap(kneighbors)
  console.log('countMap=%j', countMap)
  let label = KNN.maxLabel(countMap)
  console.log('label = ', label)
  return countMap
}

KNN.distance = function (a, b) {
  let len = a.length, d = 0
  for (let i=0; i<len; i++) {
    let di = a[i]-b[i]
    d += di * di
  }
  return d
}

return KNN
},{}],39:[function(require,module,exports){
// 參考： 自然語言處理 -- Hidden Markov Model http://cpmarkchang.logdown.com/posts/192352
const M = module.exports = {}

M.markovSeqProb = function (P, s) {
  let p = P[s[0]]
  for (let i=1; i<s.length; i++) {
    let key = s[i-1]+'=>'+s[i]
    p = p * P[key]
  }
  return p
}


M.metropolisHasting = function  (P, S) {
  var Q = P // 初始機率分佈
  var A = {} // 入出比 = 流入/流出
  do {
    console.log('Q = %j', Q)
    var Qn = {}
    for (let x of S) { // 計算 A 矩陣 = 入出比 = 流入/流出
      for (let y of S) {
        Qn[x+'=>'+y] = Q[x+'=>'+y]
        A[x+'=>'+y] = (P[y] * Q[y+'=>'+x]) / (P[x] * Q[x+'=>'+y]) // 入出比 = 流入/流出
        console.log('x=%s y=%s, A[x=>y]=%d P[y]*Q[y=>x]=%d P(x)*Q[x=>y]=%d', x, y, A[x+'=>'+y], P[x]*Q[x+'=>'+y], P[y]*Q[y+'=>'+x])
      }
    }
    console.log('A = %j', A)
    var diff = 0
    for (let x of S) {
      for (let y of S) { // 計算下一代 Qn 矩陣
        if (A[x+'=>'+y] < 1) {  // 入出比 < 1 ，代表流入太少，流出太多
          Qn[x+'=>'+y] = Q[x+'=>'+y] * A[x+'=>'+y] // 降低流出量
          Qn[x+'=>'+x] = Qn[x+'=>'+x] + Q[x+'=>'+y] * (1 - A[x+'=>'+y]) // 『規一化』調整
          diff += Math.abs(Qn[x+'=>'+y] - Q[x+'=>'+y]) // 計算新舊矩陣差異
        }
      }
    }
    Q = Qn
    console.log('diff = %d', diff)
  } while (diff > 0.001)  // 假如差異夠小的時候，就可以停止了。
}

/* 這是特用的，改寫成通用的！
function gibbs (P) {
  var P0 = {'a': P['a'], 'b': P['b'] }
  do {
    var P1 = { // 下一輪的機率分布。
      'a': P0['a'] * P['a=>a'] + P0['b'] * P['b=>a'], 
      'b': P0['a'] * P['a=>b'] + P0['b'] * P['b=>b']
    }
    console.log('P1 = %j', P1)
    var da = P1['a'] - P0['a'], db = P1['b'] - P0['b'] // 兩輪間的差異。
    var step = Math.sqrt(da * da + db * db) // 差異的大小
    P0 = P1
  } while (step > 0.001)  // 假如差異夠小的時候，就可以停止了。
  console.log('標準答案:P(a)=5/8=%d P(b)=3/8=%d', 5 / 8, 3 / 8) // 印出標準答案，以便看看我們找到的答案是否夠接近。
}
*/
},{}],40:[function(require,module,exports){
const ml6 = module.exports = {
  kmean: require('./kmean'),
  knn: require('./knn'),
  markov: require('./markov'),
  naiveBayes: require('./naiveBayes'),
  hmm:require('./hmm'),
  em:require('./em'),
  qlearning:require('./qlearning'),
  gameTheory: require('./gameTheory'),
}

let {kmean, knn, markov, naiveBayes, hmm, em, qlearning, gameTheory} = ml6

Object.assign(ml6, kmean, knn, markov, naiveBayes, hmm, em, qlearning, gameTheory)


},{"./em":34,"./gameTheory":35,"./hmm":36,"./kmean":37,"./knn":38,"./markov":39,"./naiveBayes":41,"./qlearning":42}],41:[function(require,module,exports){
const ma6 = require('../../ma6')
const {argmax} = ma6
const M = module.exports = {}

// P(C|F1...Fn) = P(C) * P(F1|C) * ....* P(Fn|C)
M.naiveBayesProb = function (prob, c, f) {
  let p = prob[c]
  for (let fi of f) p = p*prob[c+'=>'+fi]
  return p
}

M.naiveBayesClassifier = function (prob, c, f) {
  const p = c.map((ci) => M.naiveBayesProb(prob, ci, f))
  for (let i=0; i<c.length; i++) {
    console.log('P(%s|f1,f2) = ', c[i], p[i].toFixed(3))
  }
  const {max:pmax, index: imax} = argmax(p)
  console.log('%s 的機率最大', c[imax])
}


},{"../../ma6":11}],42:[function(require,module,exports){
// 參考 https://en.wikipedia.org/wiki/Q-learning
// https://morvanzhou.github.io/tutorials/machine-learning/reinforcement-learning/2-1-general-rl/

class Q {
  constructor () {
    this.init()
  }
  learning(arg) {
    let q = this.q
    // this.init()
    for (var loop=0; loop < arg.maxLoops; loop ++) {
      let s0 = this.getStart()
      let s0s = JSON.stringify(s0)
      while (!this.isGoal(s0)) {
        let a = this.chooseAction(s0)
        let {s1, r} = this.doAction(s0, a)
        let s1s = JSON.stringify(s1)
        q[s0s][a] = (1-arg.rate) * q[s0s][a] + arg.rate * (r + arg.decay * this.argmax(q[s1s])) // this.argmax(q[s1]) 是下個狀態的最大報酬
        s0 = s1
      }
      console.log('======= dump: %d =====\n%s', loop, this.dump(q))
    }
  }
  init() { throw new Error('not defined!') } // 隨機初始化 q 表
  isGoal(s) { throw new Error('not defined!') } // 判斷是否已到達目標
  getStart() { throw new Error('not defined!') } // 取得起始點
  chooseAction(s) { throw new Error('not defined!') } // 選取在 s 狀態的動作 a
  doAction(s,a) { throw new Error('not defined!') } // 在狀態 s 做 a 動作時，會跑到 s1 狀態，並得到 reward r
  argmax(qs) { // 取的報酬最大的狀態
    let max = Number.NEGATIVE_INFINITY
    for (let k in qs) {
      if (qs[k] > max) max = qs[k]
    }
    return max
  }
  dump(q) { throw new Error('not defined!') } // 傳回想印出的狀態字串
}

module.exports = {Q}

},{}],43:[function(require,module,exports){
module.exports = require('./src/nn6')
},{"./src/nn6":50}],44:[function(require,module,exports){
const N = require('./node')
const G = require('./gate')
const L = require('./layer')
const F = require('./func')
const ma6 = require('../../ma6')
const uu6 = require('../../uu6')

module.exports = class Net {
  /*
  static call(net, p) {
    let o = net.forward()
    return o.v
  }

  static grad(net, p) {
    net.backward()
    return net
  }

  static step(p, gnet, stepLen) {
    for (let node of gnet.vars) {
      node.v += stepLen * node.g
    }
    return gnet
  }
*/
  constructor (p={}) {
    this.gates = []
    this.vars = []
    this.step = p.step || -0.01
    this.moment = p.moment || 0
  }

  variable (v, g) {
    let node = new N.Variable(v, g)
    this.vars.push(node)
    return node
  }
  
  constant (v) { return new N.Constant(v) }

  tensorVariable (shape) {
    let node = new N.TensorVariable(null, shape)
    this.vars.push(node)
    return node
  }

  tensorConstant (a) { return new N.TensorConstant(a) }

  op1 (x, f, gfx) {
    let o = new N.Variable()
    let g = new G.Gate1(o, x, f, gfx)
    this.gates.push(g)
    this.o = o
    return o
  }

  op2 (x, y, f, gfx, gfy) {
    let o = new N.Variable()
    let g = new G.Gate2(o, x, y, f, gfx, gfy)
    this.gates.push(g)
    this.o = o
    return o
  }

  // op1
  neg (x) { return this.op1(x, (x)=>-x, (x)=>-1) }
  rev (x) { return this.op1(x, (x)=>1/x, (x)=>-1/(x*x)) }
  sin (x) { return this.op1(x, (x)=>Math.sin(x), (x)=>Math.cos(x)) }
  cos (x) { return this.op1(x, (x)=>Math.cos(x), (x)=>-Math.sin(x)) }
  exp (x) { return this.op1(x, (x)=>Math.exp(x), (x)=>Math.exp(x)) }

  /* 這些要從輸出值 o 回饋 
  exp (x) { return this.op1(x, F.exp, F.dexp) }
  relu (x, leaky=0) { return this.op1(x, (x)=>F.relu(x, leaky), (x)=>F.drelu(x, leaky)) }
  sigmoid (x) { return this.op1(x, F.sigmoid, F.dsigmoid) }
  tanh (x) { return this.op1(x, F.tanh, F.dtanh) }
  */
  // op2
  add (x, y) { return this.op2(x, y, (x,y)=>x+y, (x,y)=>1) }
  sub (x, y) { return this.op2(x, y, (x,y)=>x-y, (x,y)=>1, (x,y)=>-1) }
  mul (x, y) { return this.op2(x, y, (x,y)=>x*y, (x,y)=>y, (x,y)=>x) }
  div (x, y) { return this.op2(x, y, (x,y)=>x/y, (x,y)=>1/y, (x,y)=>-x/(y*y)) }
  pow (x, y) { return this.op2(x, y, F.pow, F.dpowx, F.dpowy) }

  // Layer
  inputLayer(shape) {
    let iLayer = new L.InputLayer(shape)
    this.gates.push(iLayer)
    this.i =iLayer.x
    this.o = iLayer.o
    return iLayer
  }

  push(Layer, p) {
    let lastLayer = this.gates[this.gates.length-1]
    let x = lastLayer.o
    let thisLayer = new Layer(x, p)
    this.gates.push(thisLayer)
    this.o = thisLayer.o
    return thisLayer
  }

  forward() { // 正向傳遞計算結果
    let len = this.gates.length
    for (let i=0; i<len; i++) {
      this.gates[i].forward()
    }
    return this.o
  }

  backward() { // 反向傳遞計算梯度
    if (this.out == null) this.o.g = 1 // 沒有設定輸出 out，這是優化問題，直接將輸出梯度設為 1
    let len = this.gates.length
    for (let i=len-1; i>=0; i--) { // 反向傳遞計算每個節點 Node 的梯度 g
      let gate = this.gates[i]
      gate.backward()
    }
  }

  adjust(step, moment) {
    let len = this.gates.length
    for (let i=0; i<len; i++) {
      this.gates[i].adjust(step, moment)
    }
  }

  setInput(input) {
    if (input == null) return
    this.gates[0].setInput(input)
  }
  
  setOutput(out) {
    this.out = out
    this.lastGate().setOutput(out)
  }

  lastGate() { return this.gates[this.gates.length-1] }
  predict() { return this.lastGate().predict }
  loss() { return this.lastGate().loss }

  improve(input = null, out = null) {
    this.setInput(input)
    this.setOutput(out)
    this.forward()
    this.backward()
    this.adjust(this.step, this.moment)
    return this.loss()
  }

  learn(input, out) { return this.improve(input, out) }

  dump(p) {
    let {inputs, outs} = p
    let len = inputs.length
    for (let i=0; i<len; i++) {
      this.setInput(inputs[i])
      this.setOutput(outs[i])
      this.forward()
      console.log('input:', inputs[i], 'out:', outs[i], 'predict:', uu6.json(this.predict()), 'loss:', this.loss())
    }
  }

  optimize(p = {maxLoops:10000, gap:0.0001}) {
    p.inputs = p.inputs || [ null ]
    p.outs = p.outs || [ null ]
    let {inputs, outs, gap, minLoops, maxLoops} = p
    // uu6.be(inputs && outs)
    gap = gap || 0.00001
    let len = inputs.length
    let loss0 = Number.MAX_VALUE
    for (let loops=0; loops < maxLoops; loops++) {
      let loss = 0
      for (let i=0; i<len; i++) {
        loss += this.improve(inputs[i], outs[i])
      }
      if (loss < loss0 - gap)
        loss0 = loss
      else if (loops >= minLoops)
        break
      console.log(loops+': loss=', loss)
    }
    this.dump(p)
  }

  gradientDescendent(p = {maxLoops:1000, gap:0.0001, debug:false}) {
    let {gap, maxLoops, debug} = p
    for (let loops=0; loops < maxLoops; loops++) {
      this.improve()
      if (debug) console.log('%d: o=%j', loops, this.o.v)
    }
  }

  watch (nodeMap) {
    this.watchNodes = nodeMap
  }

  toString() {
    let watchNodes = this.watchNodes || {i:this.i, o:this.o}
    console.log('watchNodes=', watchNodes)
    let list=[]
    for (let key in watchNodes) {
      list.push('  ' + key + ":" + watchNodes[key].toString())
    }
    return this.constructor.name + ':\n' + list.join("\n")
  }
}

},{"../../ma6":11,"../../uu6":61,"./func":47,"./gate":48,"./layer":49,"./node":51}],45:[function(require,module,exports){
const Net = require('./Net')

class NetFunction extends Net {
  constructor() {
    super()
    this.symTable = {}
  }

  call() { return this.forward().v }

//  diff(x) { return this.symTable[name].g }

  grad(args) {
    this.forward()
    this.backward()
    // console.log('NetFunction: this=%j', this)
    let len = args.length, gv = new Array(len)
    for (let i=0;i<len; i++) {
      let name = args[i]
      gv[i] = this.symTable[name].g
    }
    return gv
  }
}

module.exports = NetFunction

},{"./Net":44}],46:[function(require,module,exports){
const NetFunction = require('./NetFunction')
const sp6 = require('../../sp6')
const { exp, Generator } = sp6

const S = module.exports = {}

class NetGenerator extends Generator {
  constructor() {
    super()
    this.net = new NetFunction()
  }
  op1 (op, t) {
    let {net} = this
    switch (op) {
      case '-': return net.mul(net.constant(-1), t);
      default : throw Error('op:'+op+' not supported!')
    }
  }
  op2 (op, t1, t2) {
    let {net} = this
    let r = null
    switch (op) {
      case '+': r = net.add(t1, t2); break; 
      case '-': r = net.sub(t1, t2); break; 
      case '*': r = net.mul(t1, t2); break;
      case '/': r = net.div(t1, t2); break; 
      case '^': r = net.pow(t1, t2); break; 
      default : throw Error('op2:'+op+' not supported!')
    }
    return r
  } 
  call (fname, args) {
    let {net} = this
    let f = net[fname].bind(net) // f 是 net.fname 綁定 net 物件的結果 (不綁定會錯！)
    return f(...args)
  }
  number (n) {
    return this.net.constant(n)
  }
  variable (name) {
    let {net} = this, {symTable} = net
    if (symTable[name] == null) {
      symTable[name] = net.variable(0)
    }
    return symTable[name]
  }
}

S.compile  = function(text) {
  let g = new NetGenerator()
  exp.compile(text, g)
  return g.net
}

},{"../../sp6":55,"./NetFunction":45}],47:[function(require,module,exports){
var F = module.exports = {}

F.near = function (a, b, diff=0.000001) {
  return Math.abs(a - b) < diff
}

F.neg = function (x) {
  return -x
}

F.dneg = function (o) {
  return -1
}

F.rev = function (x) {
  return 1.0 / x
}

F.drev = function (o) {
  return -1 / (o*o)
}

F.exp = function (x) {
  return Math.exp(x)
}

F.dexp = function (o) {
  return Math.exp(o)
}

// 問題是，當所有的輸出值都小於 0，就會都被 Relu 截掉，於是變成 [0,0,0....]
// 所以 relu 通常要加上 leaky 成為 leakyRelu
// 即使小於 0 也會給一個很小的梯度。
F.relu = function (x, leaky=0.05) {
  return x > 0 ? x : leaky * x
}

F.drelu = function (o, leaky=0.05) {
  return o > 0 ? 1 : leaky
}

F.sigmoid = function (x) {
  return 1 / (1 + Math.exp(-x))
}

F.dsigmoid = function (o) {
  return o * (1 - o)
}

F.tanh = function (x) {
  return Math.tanh(x)
}

F.dtanh = function (o) {
  return 1.0 - o*o
}

F.pow = function (x, y) {
  return Math.pow(x, y)
}

F.dpowx = function (x, y) {
  return y * Math.pow(x, y-1)
}

F.dpowy = function (x, y) {
  return Math.pow(x, y) * Math.log(x)
}

F.add = function (x, y) {
  return x + y
}

F.dadd = function (x, y) {
  return 1
}

F.sub = function (x, y) {
  return x - y
}

F.dsubx = function (x, y) {
  return 1
}

F.dsuby = function (x, y) {
  return -1
}

F.mul = function (x, y) {
  return x * y
}

F.dmul = function (x, y) {
  return y
}

F.div = function (x, y) {
  return x / y
}

F.ddivx = function (x, y) {
  return 1 / y
}

F.ddivy = function (x, y) {
  return -x / (y * y)
}

F.max = function (a) {
  let r = Number.MIN_VALUE
  let len = a.length
  for (let i=0; i<len; i++) {
    if (a[i] > r) r = a[i]
  }
  return r
}

// 這版的 softmax 會有 overflow, underflow 的危險 (只要總和超過幾百，或者小於幾百，就會爆了)，改一下！
// 參考： http://freemind.pluskid.org/machine-learning/softmax-vs-softmax-loss-numerical-stability/
F.softmax = function (x) {
  let len = x.length, r = new Array(len), e = new Array(len)
  let max = F.max(x), sum = 0
  for (let i=0; i<x.length; i++) {
    e[i] = Math.exp(x[i]-max)
    sum += e[i]
  }
  for (let i=0; i<x.length; i++) {
    r[i] = e[i] / sum
  }
  // console.log('Softmax: x=%j r=%j', x, r)
  return r
}

// Softmax 的梯度計算是 x.g = o.v * (1 - o.v) * o.g
F.dsoftmax = function (x, o) {
  let len = x.length
  for (let i=0; i<len; i++) {
    x.g[i] += o.v[i] * (1-o.v[i]) * o.g[i]
  }
}


},{}],48:[function(require,module,exports){
module.exports = G = {}

class Gate {
  constructor(o, x) {
    this.x = x
    this.o = o
  }
  setOutput(y) { this.y = y }
  get predict() { return this.o.v }
}

class Gate1 extends Gate {
  constructor(o, x, f, gfx) {
    super(o, x)
    this.p = {o, x, f, gfx}
  }

  forward() {
    let {o, x, f} = this.p
    o.v = f(x.v)
    o.g = x.g = 0
  }

  backward() {
    let {o, x, gfx} = this.p
    x.g += gfx(x.v) * o.g
  }

  adjust(step, moment) {
    let {x,y} = this.p
    x.v += step * x.g
    x.g = o.g = 0
  }
}

class Gate2 extends Gate {
  constructor(o, x, y, f, gfx, gfy) {
    super(o, x)
    this.p = {o, x, y, f, gfx, gfy:gfy||gfx}
  }

  forward() {
    let {o, x, y, f} = this.p
    o.v = f(x.v, y.v)
    o.g = x.g = y.g = 0
  }

  backward() {
    let {o,x,y,gfx,gfy} = this.p
    x.g += gfx(x.v, y.v) * o.g
    y.g += gfy(x.v, y.v) * o.g
  }

  adjust(step, moment) {
    let {x,y,o} = this.p
    x.v += step * x.g
    y.v += step * y.g
    x.g = y.g = o.g = 0
  }
}

Object.assign(G, {Gate, Gate1, Gate2 })

},{}],49:[function(require,module,exports){
const L = module.exports = {}
const uu6 = require('../../uu6')
const ma6 = require('../../ma6')
const F = require('./func')
const N = require('./node')
const G = require('./gate')
const V = ma6.V

class Layer {
  constructor(x, p = {}) {
    this.x = x
    this.p = uu6.clone(p)
    console.log('p=', p, 'this.p=', this.p)
  }

  setOutput(y) { this.y = y }

  forward() {
    let {o, x} = this
    V.assign(x.g, 0) // 清除 x 的梯度
    V.assign(o.g, 0) // 清除 o 的梯度
    return o
  }

  backward() {}

  grad(h=0.00001) {
    let {x, o} = this
    let xlen = x.length, olen = o.length
    let gx = V.array(xlen, 0)
    this.forward()
    let vo = uu6.clone(o.v)
    for (let xi=0; xi<xlen; xi++) {
      let xvi = x.v[xi]
      x.v[xi] += h  // 小幅調整 x.v[xi] 的值
      this.forward()
      let gxi = 0   // 計算所造成的輸出影響總和
      for (let oi=0; oi<olen; oi++) {
        gxi += (o.v[oi] - vo[oi])
      }
      gx[xi] = gxi  // 這就是 xi 軸的梯度 g_o^x[i]，簡寫為 gxi
      x.v[xi] = xvi // 還原 x.v[xi] 的值
    }
    // console.log('grad(): gx=', gx)
    return V.normalize(gx)
  }

  toString() {
    let {o,x} = this
    return this.constructor.name + ':\n  x:' + x.toString() + '\n  o:' + o.toString()
  }
}

class FLayer extends Layer {
  constructor(x, p) {
    super(x, p)
    this.o = new N.TensorVariable(null, x.shape)
  }
  forward() {
    let {o, x} = this, {f} = this.p
    let len = x.length
    for (let i=0; i<len; i++) {
      o.v[i] = f(x.v[i])
    }
    return super.forward()
  }

  backward() {
    let {o, x} = this, {gf} = this.p
    let len = x.length
    for (let i=0; i<len; i++) {
      x.g[i] += o.g[i] * gf(x.v[i], o.v[i])
    }
  }

  adjust(step, moment) {
    let {o,x} = this
    let len = x.length
    for (let i=0; i<len; i++) {
      x.v[i] += step * x.g[i]
      x.g[i] = 0 // 調過後就設為 0，這樣才不會重複調整 ...
    }
  }
}

class SigmoidLayer extends FLayer {
  constructor(x) { super(x, {f:(vx)=>F.sigmoid(vx), gf:(vx,vo)=>F.dsigmoid(vo) }) }
}

class TanhLayer extends FLayer {
  constructor(x) { super(x, {f:(vx)=>F.tanh(vx), gf:(vx,vo)=>F.dtanh(vo) }) }
}

class ReluLayer extends FLayer {
  constructor(x, leaky) {
    super(x, {f:(vx,l=leaky)=>F.relu(vx,l) , gf: (vx,vo,l=leaky)=>F.drelu(vo,l)})
  }
}

// 參考 -- https://www.oreilly.com/library/view/tensorflow-for-deep/9781491980446/ch04.html
class FullyConnectLayer extends Layer {
  constructor(x, p) {
    super(x, p)
    uu6.be(x)
    let wshape = uu6.clone(x.shape)
    wshape.unshift(p.n)  // shape = [o.length, x.length]
    // wshape.push(p.n)
    this.w = new N.TensorVariable(null, wshape)
    this.o = new N.TensorVariable(null, [p.n])
    this.bias = new N.TensorVariable(null, [p.n])
    if (p.cw) V.assign(this.w.v, p.cw); else V.random(this.w.v, -1, 1)
    if (p.cbias) V.assign(this.bias.v, p.cbias); else V.random(this.bias.v, -1, 1)
  }

  forward() {
    let {o, x, w, bias} = this
    let xlen = x.length, olen = o.length
    for (let oi=0; oi<olen; oi++) {
      let sum = 0
      for (let xi=0; xi<xlen; xi++) {
        sum += x.v[xi] * w.v[oi*xlen+xi]
      }
      sum += -1 * bias.v[oi]
      o.v[oi] = sum
    }
    V.assign(w.g, 0)       // 清除 w 的梯度
    V.assign(bias.g, 0)    // 清除 bias 的梯度
    return super.forward() // 清除 x, o 的梯度
  }

  backward() {
    let {o, x, w, bias} = this
    let xlen = x.length, olen = o.length
    for (let oi=0; oi<olen; oi++) { 
      for (let xi=0; xi<xlen; xi++) {
        w.g[oi*xlen+xi] += x.v[xi] * o.g[oi]
        x.g[xi] += w.v[oi*xlen+xi] * o.g[oi]
      }
      bias.g[oi] += -1 * o.g[oi]
    }
  }

  adjust(step, moment) {
    let {o, x, w, bias} = this
    let xlen = x.length, olen = o.length
    for (let xi=0; xi<xlen; xi++) {
      x.v[xi] += step * x.g[xi]
      x.g[xi] = 0
    }
    for (let oi=0; oi<olen; oi++) {
      for (let xi=0; xi<xlen; xi++) {
        w.v[oi*xlen+xi] += step * w.g[oi*xlen+xi]
        w.g[oi*xlen+xi] = 0
      }
      bias.v[oi] += step * bias.g[oi]
      bias.g[oi] = 0
    }
  }

  toString() {
    let {w, bias} = this
    return super.toString() + '\n  w:'+w.toString()+'\n  bias:'+bias.toString()
  }
}

class FcActLayer extends Layer {
  constructor(x, p) {
    super(x, p)
    this.fcLayer = new FullyConnectLayer(x, p)
    this.actLayer = new p.ActLayer(this.fcLayer.o)
    this.o = this.actLayer.o
  }
  forward() {
    this.fcLayer.forward()
    this.actLayer.forward()
    return super.forward()
  }
  backward() {
    this.actLayer.backward()
    this.fcLayer.backward()
  }

  adjust(step, moment) {
    this.fcLayer.adjust(step, moment)
    this.actLayer.adjust(step, moment)
  }
}

class PerceptronLayer extends FcActLayer {
  constructor(x, p) {
    super(x, Object.assign(p, {ActLayer: SigmoidLayer}))
  }
}

class InputLayer extends Layer {
  constructor(shape) {
    super()
    this.x = new N.TensorVariable(null, shape)
    this.o = this.x
  }
  setInput(input) {
    V.assign(this.x.v, input)
  }
  forward() { // 輸出 o = 輸入 x
    return super.forward()
  }
  backward() {} // 輸入層不用反傳遞
  adjust(step, moment) {} // 輸入層不用調梯度
}

class RegressionLayer extends Layer {
  constructor(x, p) {
    super(x, p)
    this.o = new N.TensorVariable(null, [1])
  }

  forward() {
    super.forward() // 清除梯度 g
    let {o, x, y} = this
    let len = x.length, loss = 0.0
    for (let i=0; i<len; i++) {
      let d = x.v[i] - y[i]   // y 是正確輸出值 (正確答案)，d[i] 是第 i 個輸出的差異
      x.g[i] = d              // 梯度就是網路輸出 x 與答案 y 之間的差異
      loss += 0.5 * d * d     // 誤差採用最小平方法 1/2 (x-y)^2，這樣得到的梯度才會是 (xi-yi)
    }
    this.loss = o.v[0] = loss // 錯誤的數量 loss 就是想要最小化的能量函數 => loss = 1/2 (x-y)^2
                              // 整體的能量函數應該是所有 loss 的加總，也就是 sum(loss(x, y)) for all (x,y)
    this.predict = x.v
    return loss
  }
  backward() {} // 輸出層的反傳遞已經在正傳遞時順便計算掉了！

  adjust(step, moment) {} // 輸出層不用調梯度

  toString() {
    let {y} = this
    return super.toString() + '\n  y:' + uu6.json(y)
  }
}

// 說明: 這個和 RegressionLayer 一樣，是輸出層，只要輸出 loss
// softmax 的梯度參考 https://math.stackexchange.com/questions/945871/derivative-of-softmax-loss-function
// 中文請參考: https://zhuanlan.zhihu.com/p/25723112
class SoftmaxLayer extends Layer {
  constructor(x, p) {
    super(x, p)
    this.o = new N.TensorVariable(null, [1])
  }

  forward() {
    let {o, x, y} = this
    let len = x.length, e = new Array(len)
    let max = F.max(x.v), sum = 0
    let iMax = 0
    for (let i=0; i<len; i++) {
      e[i] = Math.exp(x.v[i]-max)
      if (e[i] > e[iMax]) iMax = i
      sum += e[i]
    }
    for (let i=0; i<len; i++) {
      e[i] = e[i] / sum
    }
    this.e = e
    this.predict = iMax
    this.loss = o.v[0] = -Math.log(e[y]) // 這個對嗎？是否應該用 -Math.log(o.v[y])
    return super.forward()
  }

  backward() {
    let {o, x, y, e} = this
    let len = x.length
    for (let i=0; i<len; i++) {
      let indicator = i === y ? 1.0 : 0.0
      x.g[i] = e[i] - indicator
    }
  }

  adjust(step, moment) {
    let {o, x} = this
    let len = x.length
    for (let i=0; i<len; i++) {
      x.v[i] += step * x.g[i]
      x.g[i] = 0
    }
  }
}

class DropoutLayer extends Layer {
  constructor(x, p) {
    super(x)
    this.dropped = new Array(x.length)
    this.dropProb = p.dropProb || 0.5 // 預設 drop 掉一半
    this.isTraining = p.isTraining || false
    this.o = new N.TensorVariable(null, this.x.shape)
  }
  forward() {
    let {o, x, dropped, dropProb, isTraining } = this
    let len = x.length
    if(isTraining) { // 在訓練階段，隨機的掐掉一些節點 (do dropout) ，以提升容錯力！(在某些節點死掉時，網路還是穩定的！)
      for(var i=0;i<len;i++) {
        if(Math.random() < dropProb) { o.v[i]=0; dropped[i] = true } // drop! 這個節點已經被掐掉了 ..
        else { dropped[i] = false, o.v[i] = x.v[i] } // 需注意的是，每次 forward 都重設，所以每次被掐掉的節點都不一樣，這會讓訓練花更久的時間！
      }
    } else { // 使用階段是全員啟動的，所以將權重 * drop_prob 才會得到和訓練階段期望值一致的結果。// scale the activations during prediction
      for(var i=0;i<len;i++) { o.v[i] = this.dropProb * x.v[i] }
    }
    return super.forward()
  }
  backward() {
    let {x, o, dropped} = this
    let len = x.length
    for (let i=0; i<len; i++) { // 反向傳遞: 單純將沒 dropped 掉的梯度傳回去。(copy over the gradient)
      if(!dropped[i]) x.g[i] = o.g[i]
    }
  }
}

class PoolLayer extends Layer {
  constructor(x, p) {
    super(x, p)
    let i = x // i: input = x
    let {fw, fh, stride, pad} = p // fw, fh: 池化遮罩 (filter) 大小, stride: 步伐大小, pad: 超出寬度
    let [id, iw, ih] = x.shape
    let od = id
    let ow = Math.floor((iw + pad * 2 - fw) / stride + 1)
    let oh = Math.floor((ih + pad * 2 - fh) / stride + 1)
    let o = new N.TensorVariable(null, [od, ow, oh])
    let switchx = V.array(od*ow*oh) // store switches for x,y coordinates for where the max comes from, for each output neuron
    let switchy = V.array(od*ow*oh) // d 個池的最大點座標
    // console.log('p=', {o, fw, fh, switchx, switchy, stride, pad, id, iw, ih, od, ow, oh})
    Object.assign(this, {o, i, fw, fh, switchx, switchy, stride, pad, id, iw, ih, od, ow, oh})
  }

  forward() {
    let {o, x, id, iw, ih, fw, fh, switchx, switchy, stride, pad, od, ow, oh} = this
    for (let d = 0; d < od; d++) {
      let ix = -pad // ix = 目前區塊的右上角 x
      for(let ox=0; ox<ow; ix+=stride, ox++) {
        let iy = -pad // iy = 目前區塊的右上角 y
        for(let oy=0; oy<oh; iy+=stride, oy++) {
          // 接下來尋找 (fw*fh) 區塊的最大值。 convolve at this particular location
          let max = -Number.MAX_VALUE
          let winx=-1, winy=-1
          for(let fx=0; fx<fw; fx++) {
            for(let fy=0; fy<fh; fy++) {
              let mx = ix+fx, my = iy+fy // (mx, my) 遮罩目前遮蔽的點位置 maskX, maskY
              if(mx>=0 && mx<iw && my>=0 && my<ih) {
                let v = x.v[(d*iw+mx)*ih+my]
                // perform max pooling and store pointers to where the max came from. 
                // This will speed up backprop and can help make nice visualizations in future
                if(v > max) { max = v; winx=mx; winy=my; } // 取得最大值
              }
            }
          }
          let oi = (d*ow + ox)*oh+oy
          // switch(x,y) 紀錄該 MaxPool 區塊的最大值位置，之後計算反傳遞梯度時會需要
          switchx[oi] = winx
          switchy[oi] = winy
          o.v[oi] = max
        }
      }
    }
    return super.forward()
  }

  backward() {
    let {o, x, id, iw, ih, fw, fh, switchx, switchy, stride, pad, od, ow, oh} = this
    for(let d=0; d<od; d++) {
      let ix = -pad
      for(let ox=0; ox<ow; ix+=stride, ox++) {
        let iy = -pad
        for(let oy=0; oy<oh; iy+=stride, oy++) {
          let oi = (d*ow + ox)*oh+oy
          let swx = switchx[oi], swy = switchy[oi]
          let grad = o.g[oi]
          // 如果只有一個最大值，那麼以下這行確實能反映輸入點的梯度，但是如果有很多相同的最大值，那麼這行只會修改一個！
          // 所以應該要讓每個輸入的值都不同，才能確保這個結果和數值方法計算的梯度一樣！
          x.g[(d*iw+swx)*ih+swy] += grad
        }
      }
    }
  }
}

class ConvLayer extends Layer {
  // https://zhuanlan.zhihu.com/p/29534841
  // 目前沒有使用：权重衰减（weight decay）：对于目标函数加入正则化项，限制权重参数的个数，这是一种防止过拟合的方法，这个方法其实就是机器学习中的l2正则化方法，只不过在神经网络中旧瓶装新酒改名为weight decay [3]。
  constructor(x, p) { 
    super(x, p)
    // console.log('ConvLayer')
    let i = x // i: input = x
    let {od, fw, fh, stride, pad } = p // fw, fh: 池化遮罩 (filter) 大小, stride: 步伐大小, pad: 超出寬度
    let [id, iw, ih] = x.shape
    let ow = Math.floor((iw + pad * 2 - fw) / stride + 1)
    let oh = Math.floor((ih + pad * 2 - fh) / stride + 1)
    let o = new N.TensorVariable(null, [od, ow, oh])
    // console.log('o=', o)
    let fd = id
    let filters = []
    for(let oi=0; oi<od; oi++) {
      filters.push(new N.TensorVariable(null, [fd, fw, fh]))
      if (p.cw) V.assign(filters[oi].v, p.cw); else V.random(filters[oi].v, -1, 1)
    }
    // console.log('filters=', filters.toString())
    let bias = new N.TensorVariable(null, [1, 1, od])
    if (p.cbias) V.assign(bias.v, p.cbias); else V.random(bias.v, -1, 1)
    // console.log('bias=', bias.toString())
    Object.assign(this, { o, i, id, iw, ih, od, ow, oh, fd, fw, fh, stride, pad, bias, filters })
  }

  forward() {
    let {o, i, id, iw, ih, fd, fw, fh, stride, pad, od, ow, oh, filters, bias} = this
    for (let d = 0; d < od; d++) {
      let f = filters[d]
      let ix = -pad // ix = 目前區塊的右上角 x
      for(let ox=0; ox<ow; ix+=stride, ox++) {
        let iy = -pad // iy = 目前區塊的右上角 y
        for(let oy=0; oy<oh; iy+=stride, oy++) {
          let a = 0.0
          for (let fz=0; fz<fd; fz++) {
            for(let fx=0; fx<fw; fx++) {
              let mx = ix + fx
              for(let fy=0; fy<fh; fy++) {
                let my = iy + fy
                if (mx >= 0 && mx < iw && my >=0 && my < ih) {
                    a += f.v[((fz*fw)+fx)*fh+fy] * i.v[((fz*iw)+mx)*ih+my]
                }
              }
            }
          }
          a += bias.v[d]
          o.v[((d*ow)+ox)*oh+oy] = a
        }
      }
    }
    // console.log('forward(): i=', i)
    // console.log('forward(): o=', o)
    return super.forward()
  }

  backward() {
    let {o, i, id, iw, ih, fd, fw, fh, stride, pad, od, ow, oh, filters, bias} = this
    for(let d=0; d<od; d++) {
      let f = filters[d]
      let ix = -pad
      for(let ox=0; ox<ow; ix+=stride, ox++) {
        let iy = -pad
        for(let oy=0; oy<oh; iy+=stride, oy++) {
          let oGrad = o.g[(d*ow+ox)*oh+oy] // 取得輸出 o 的梯度
          for (let fz=0; fz<fd; fz++) {
            for (let fx=0; fx < fw; fx++) {
              let mx = ix+fx
              for (let fy=0; fy < fh; fy++) {
                let my = iy+fy
                if (mx>=0 && mx<iw && my>=0 && my<ih) { // 反饋到每一個輸入與遮罩
                  let ii = ((fz*iw)+mx)*ih+my
                  let fi = ((fz*fw)+fx)*fh+fy
                  f.g[fi] += i.v[ii] * oGrad
                  i.g[ii] += f.v[fi] * oGrad
                }
              }
            }
          }
          bias.g[d] += oGrad
        }
      }
      // console.log('backward:f=', f)
    }
    // console.log('backward:i=', i)
    // console.log('backward:x=', this.x)
    // console.log('backward:bias=', bias)
  }
}

Object.assign(L, {
  Layer, FLayer, SigmoidLayer, TanhLayer, ReluLayer, 
  FullyConnectLayer, FcActLayer, PerceptronLayer,
  InputLayer, RegressionLayer, SoftmaxLayer, PoolLayer, DropoutLayer, ConvLayer
})

},{"../../ma6":11,"../../uu6":61,"./func":47,"./gate":48,"./node":51}],50:[function(require,module,exports){
module.exports = nn6 = {
  N: require('./node'),
  G: require('./gate'),
  L: require('./layer'),
  Net: require('./Net'),
  AD: require('./autoDiff'),
}

Object.assign(nn6, nn6.N, nn6.G, nn6.L, nn6.AD)

},{"./Net":44,"./autoDiff":46,"./gate":48,"./layer":49,"./node":51}],51:[function(require,module,exports){
const ma6 = require('../../ma6')
const uu6 = require('../../uu6')
const V = ma6.V
const T = ma6.T
const N = {}

class Node {
  toString() {
    return 'v:' + this.v + ' g:' + this.g
  }
}

class Constant extends Node {
  constructor(v = 0) {
    super()
    this._v = v
  }
  get v() { return this._v }
  set v(c) { } // 常數不能事後設定值
  get g() { return 0 } // 常數的梯度 = 0
  set g(c) { } // 常數不能設定梯度
}

class Variable extends Node {
  constructor(v = 0, g = 0) {
    super()
    this.v = v // 輸出值 (f(x))
    this.g = g // 梯度值 (偏微分)
  }
}

class TensorNode extends Node {
  constructor(v, shape) {
    super()
  }

  get length() { return this.v.length }

  toString() {
    return this.constructor.name + ' v:' + uu6.json(this.v) + ' g:' + uu6.json(this.g) + ' shape:' + uu6.json(this.shape)
  }
}

class TensorVariable extends TensorNode {
  constructor(v, shape) {
    super(v, shape)
    let size = (v) ? v.length : T.size({shape})
    this.v = v || V.array(size, 0) // 輸出值 (f(x))
    this.g = V.array(size, 0)      // 梯度值 (偏微分)
    this.shape = shape || [size]
  }
}

class TensorConstant extends TensorNode {
  constructor(v) {
    super()
    this._v = v || V.array(size, 0)      // 輸出值 (f(x))
  }
  get v() { return this._v }
  get g() { return 0 }
}

module.exports = Object.assign(N, {
  Constant, Variable, TensorVariable, TensorConstant
})
},{"../../ma6":11,"../../uu6":61}],52:[function(require,module,exports){
module.exports = require('./src/se6')

},{"./src/se6":54}],53:[function(require,module,exports){
const E = module.exports = {}
const uu6 = require('../../uu6')

class Expect {
  constructor(o) {
    this.o = o
    this.isNot = false
  }

  check(cond) {
    return (cond && !this.isNot) || (!cond && this.isNot)
  }

  pass(f) {
    let cond = f(this.o)
    if (this.check(cond)) return this
    throw Error('Expect.pass fail!')
  }

  each(f) {
    let o = this.o
    for (let k in o) {
      if (!f(o[k])) throw Error('Expect.each fail! key='+k)
    }
  }

  any(f) {
    let o = this.o
    for (let k in o) {
      if (f(o[k])) return true
    }
    throw Error('Expect.any fail!')
  }

  equal(o) {
    if (this.check(uu6.eq(this.o, o))) return this
    throw Error('Expect.equal fail!')
  }

  near(n, gap) {
    if (this.check(uu6.near(this.o, n, gap))) return this
    throw Error('Expect.near fail!')
  }

  type(type) { 
    if (this.check(uu6.type(this.o, type))) return this
    throw Error('Expect.type fail!')
  }

  a(type) {
    if (this.check(uu6.type(this.o, type) || uu6.eq(this.o, type))) return this
    throw Error('Expect.a fail!')
  }

  contain(member) {
    let m = uu6.member(this.o, member)
    if (this.check(m != null)) { this.o = m; return this }
    throw Error('Expect.contain fail!')
  }

  get not() {
    this.isNot = !this.isNot
    return this
  }
  get 不() { return this.not }
  get to() { return this }
  get but() { return this }
  get at() { return this }
  get of() { return this }
  get same() { return this }
  get does() { return this }
  get do() { return this }
  get still() { return this }
  get is() { return this }
  get be() { return this }
  get should() { return this }
  get has() { return this }
  get have() { return this }
  get been() { return this }
  get that() { return this }
  get 那個() { return this.that }
  get and() { return this }
  get to() { return this }
}

E.expect = E.希望 = E.願 = E.驗證 = E.確認 = function (o) {
  return new Expect(o)
}

let p = Expect.prototype

p.property = p.contain
p.include = p.contain
p.包含 = p.include
p.通過 = p.pass
p.每個 = p.each
p.all = p.each
p.等於 = p.equal
p.靠近 = p.near
p.型態 = p.type
p.是 = p.a
p.有 = p.contain
p.屬性 = p.property

},{"../../uu6":61}],54:[function(require,module,exports){
const se6 = module.exports = {}

Object.assign(se6, require('./expect'))

},{"./expect":53}],55:[function(require,module,exports){
module.exports = require('./src/sp6')

},{"./src/sp6":60}],56:[function(require,module,exports){
class Generator {
  op (op, t1, t2) { throw Error('Generator.op not implemented!') } 
  call (fname, args) { throw Error('Generator.call not implemented!') } 
  number (n) { throw Error('Generator.number not implemented!') } 
  variable (name) { throw Error('Generator.variable not implemented!') } 
}

module.exports = Generator

},{}],57:[function(require,module,exports){
const {isNext, next, tokenize} = require('./lexer')
const reNumber = /\d+/
const reId = /[a-zA-Z]\w*/

// EQS = EQ([;] EQ)*
var EQS = function() {
  let eqs = ['eqs']
  let e = EQ()
  eqs.push(e)
  g.eq(e)
  while (isNext(/[;]/)) {
    next(/[;]/)
    e = EQ()
    eqs.push(e)
    g.eq(e)
  }
  return eqs
}

// EQ= E([=] E)*
var EQ = function() {
  let t1 = E()
  let op = next(/[=]/)
  let t2 = E()
  let t = g.op2('=', t1, t2)
  return t
/*
  while (isNext(/[=]/)) {
    let op = next(/[=]/)
    let t2 = E()
    let t = g.op2(op, t1, t2)
    t1 = t
  }
  return t1
*/
}

// E=T ([+-] T)*
var E = function() {
  let t1 = T()
  while (isNext(/[\+\-]/)) {
    let op = next(/[\+\-]/)
    let t2 = T()
    let t = g.op2(op, t1, t2)
    t1 = t
  }
  return t1
}

// T=P ([*/^] P)*
var T = function() {
  let t1 = P()
  while (isNext(/[\*\/\^]/)) {
    let op = next(/[\*\/\^]/)
    let t2 = P()
    let t = g.op2(op, t1, t2)
    t1 = t
  }
  return t1
}

var P=function() {
  if (isNext("-")) {
    next("-");
    let f = F();
    return g.op1('-', f)
  }
  return F()
}

var F=function() {  // F= ( E ) | NUMBER | ID | ID(ELIST) | -E 
  if (isNext("(")) {
    next("(");
    f = E();
    next(")");
  } else if (isNext(reNumber)) {
    number = next(reNumber);
    f = g.number(parseFloat(number))
  } else if (isNext(reId)) {
    id = next(reId)
    if (isNext("(")) {
      f = CALL(id)
    } else {
      return g.variable(id)
    }
  } /* else if (isNext("-")) {
    next("-");
    let e = E();
    f = g.op1('-', e)
  }*/
  return f
}

var CALL = function (id) {
  next("(")
  let args = []
  while (!isNext(")")) {
    let e = E()
    args.push(e)
    if (isNext(",")) next(",")
  }
  next(")")
  return g.call(id, args)
}

let g = null

var compile=function(text, g0) {
  g = g0
  let tokens = tokenize(text)
  // console.log('tokens=%j', tokens)
  return EQS()
}

module.exports = { compile }

},{"./lexer":58}],58:[function(require,module,exports){
// 本來應該用 .*? 來比對 /*...*/ 註解的，但 javascript 的 . 並不包含 \n, 因此用 \s\S 代替 . 就可以了。
const rexp = /(\/\*[\s\S]*?\*\/)|(\/\/[^\r\n])|(\d+)|([a-zA-Z]\w*)|([<=>]+)|(\r?\n)|(.)/gm // *?, +? non greedy, m for multiline

let tokenIdx, tokens = null

const tokenize = function(text) {
  tokenIdx = 0
  tokens = text.match(rexp) 
  return tokens
}

const next = function(o) {
  if (isNext(o))
    return tokens[tokenIdx++]
  throw Error('L.next() is not '+o)
}

const isNext=function(o) {
  if (tokenIdx >= tokens.length) 
    return false
  let token = tokens[tokenIdx]
  if (o instanceof RegExp) {
    return token.match(o)
  } else {
    return (token == o)
  }
}

module.exports = { isNext, next, tokenize }

},{}],59:[function(require,module,exports){
const Generator = require('./Generator')
const compiler = require('./compiler')
const uu6 = require('../../uu6')

class Parser extends Generator {
  constructor() {
    super()
  }
  eq (t) {
    return ['eq', t]
  }
  op1 (op, t) {
    return ['op1', op, t]
  }
  op2 (op, t1, t2) {
    return ['op2', op, t1, t2]
  } 
  call (fname, args) {
    return ['call', fname, args]
  }
  number (n) {
    return ['number', n]
  }
  variable (name) {
    return ['variable', name]
  }
}

let parse = function(text) {
  let g = new Parser()
  return compiler.compile(text, g)
}

module.exports = { Parser, parse }
},{"../../uu6":61,"./Generator":56,"./compiler":57}],60:[function(require,module,exports){
const sp6 = module.exports = {
  // symbol: require('./symbol'),
  lexer: require('./lexer'),
  Generator: require('./Generator'),
}

Object.assign(sp6, require('./parser'), require('./compiler'))
},{"./Generator":56,"./compiler":57,"./lexer":58,"./parser":59}],61:[function(require,module,exports){
module.exports = require('./src/uu6')
},{"./src/uu6":69}],62:[function(require,module,exports){
const A = module.exports = {}

A.defaults = function (args, defs) {
  let r = Object.assign({}, args)
  for (let k in defs) {
    r[k] = (args[k] == null) ? defs[k] : args[k]
  }
  return r
}

},{}],63:[function(require,module,exports){
const U = module.exports = {}

U.array = function (n, value=0) {
  // console.log('array(n): n=', n)
  if (n <= 0) n = 1
  let a = new Array(n)
  return a.fill(value)
}

U.repeats = function (n, f) {
  let r = new Array(n)
  for (let i=0; i<n; i++) {
    r[i] = f()
  }
  return r
}

U.range = function (begin, end, step=1) {
  let len = Math.floor((end-begin)/step)
  let a = new Array(len)
  let i = 0
  for (let t=begin; t<end; t+=step) {
    a[i++] = t
  }
  return a
}

U.steps = U.range

/* 改用 array
U.repeats = function (n, value = 0) {
  let a = new Array(n)
  return a.fill(value)
}
*/

U.last = function (a) {
  return a[a.length-1]
}

U.push = function (a, o) {
  a.push(o)
}

U.pop = function (a) {
  return a.unshift()
}

U.enqueue = function (a, o) {
  a.unshift(o)
}

U.dequeue = function (a) {
  return a.unshift()
}

U.amap2 = function (a, b, f) {
  let len = a.length, c = new Array(len)
  for (let i=0; i<len; i++) {
    c[i] = f(a[i], b[i])
  }
  return c
}


},{}],64:[function(require,module,exports){
const U = module.exports = {}


},{}],65:[function(require,module,exports){
const U = module.exports = {}

U.assert = function (cond, msg='assert fail!') {
  if (!cond) throw Error(msg)
}

U.be = U.assert 


},{}],66:[function(require,module,exports){
const U = module.exports = {}

U.eq = function (o1, o2) {
  if (o1 == o2) return true
  if (Object.is(o1,o2)) return true
  return JSON.stringify(o1) === JSON.stringify(o2)
}

U.nNear = function (n1, n2, gap=0.01) {
  let d = Math.abs(n1-n2)
  return d < gap
}

U.near = function (n1, n2, gap=0.01) {
  if (Array.isArray(n1)) {
    for (let i=0; i<n1.length; i++) {
      if (!U.nNear(n1[i], n2[i], gap))
        return false
    }
    return true
  } else {
    return U.nNear(n1, n2, gap)
  }
}

U.clone = function (o) {
  if (null == o || "object" != typeof o) return o
  if (o.constructor != Object && o.clone != null) return o.clone()
  let r = JSON.parse(JSON.stringify(o)) // 這只會複製非函數欄位！
  if (o.constructor == Object) { // 複製非類別的函數
    for (var attr in o) {
      if (typeof o[attr] === 'function' && o.hasOwnProperty(attr)) r[attr] = o[attr]
    }
  }
  return r
  /*
  var copy = o.constructor()
  for (var attr in o) {
    if (o.hasOwnProperty(attr)) copy[attr] = U.clone(o[attr])
  }
  return copy;
  */
}

U.typeof = function (o) {
  let t = typeof o
  if (t !== 'object') return t
  return o.constructor.name
}

U.type = function (o, type) { // U.is
  if (U.typeof(o).toLowerCase() === type.toLowerCase()) return true
  if (typeof o === 'object' && o instanceof type) return true
  return false
  /*
  if (typeof o === type) return true
  if (type==='array' && Array.isArray(o)) return true
  if (type==='number') return !isNaN(parseFloat(o)) && !isNaN(o - 0) // 參考 -- https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
  if (typeof o === 'object') {
    if (typeof type === 'object' && o instanceof type) return true
  }
  return false
  */
}

U.member = function (o, member) {
  if (typeof o === 'string') return member
  if (Array.isArray(o)) return o[o.indexOf(member)]
  if (o instanceof Set && o.has(member)) return member
  if (o instanceof Map) return o.get(member)
  return o[member]
}

U.contain = function (o, member) {
  return U.member(o, member) != null
}

U.omap2 = function (o1, o2, f) {
  let o = {}
  for (let k in o1) {
    o[k] = f(o1[k], o2[k])
  }
  return o
}

U.map2array = function (map) {
  let a = []
  for (let k in map) {
    a.push({key:k, value:map[k]})
  }
  return a
}

U.array2map = function (a) {
  let map = {}
  for (let i in a) {
    map[i] = a[i]
  }
  return map
}

U.key2value = function (o) {
  let r = {}
  for (let k in o) {
    let v = o[k]
    r[v] = k 
  }
  return r
}

// U.mixin = Object.assign

U.mixin = function (target, ...args) {
  for (let source of args) {
    Object.getOwnPropertyNames(source).forEach(function(property) {
      target[property] = source[property]; 
    })
    // Object.assign(target, source)
  }
}

},{}],67:[function(require,module,exports){
const U = module.exports = {}

U.random = function (min=0, max=1) {
  return min + Math.random()*(max-min)
}

U.randomInt = function (min, max) {
  return Math.floor(U.random(min, max))
}

U.randomChoose = function (a) {
  return a[U.randomInt(0, a.length)]
}

U.samples = function (a, n) {
  let s = new Array(n)
  for (let i=0; i<n; i++) {
    s[i] = U.randomChoose(a)
  }
  return s
}

},{}],68:[function(require,module,exports){
const U = module.exports = {
  precision: 4,
  tab: undefined
}

U.json = function (o, tab, n) {
  let digits = n || this.precision || 4
  return JSON.stringify(o, function(key, val) {
    return (val && val.toFixed) ? Number(val.toFixed(digits)) : val
  }, tab)
}

},{}],69:[function(require,module,exports){
const uu6 = module.exports = require('./object')

uu6.mixin(uu6, 
  require('./array'),
  require('./error'),
  require('./string'),
  require('./random'),
  require('./control'),
  require('./args'),
)
},{"./args":62,"./array":63,"./control":64,"./error":65,"./object":66,"./random":67,"./string":68}]},{},[9]);
