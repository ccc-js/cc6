# js6 的測試程式

測試全部

$ mocha ./ --recursive

```
PS D:\ccc\code\js\pp6\js6test> mocha ./ --recursive
x= TensorVariable v:[2,-3] g:[0,0] shape:[2]
m= TensorVariable v:[1,0,1.1,0,0,1.2,0,1.3,0,0,0,1.4,0,0,2,0] g:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] shape:[1,4,4]


  ai6.gradientDescendent Algorithm
p= [ 0.04057657416273426, 0.02705104944182261 ] norm= 0.04876697290880176
    √ gd result point should be near zero

  ma6 test
e={"v":{"r":1,"i":1.9999999999999998},"type":"complex"}
    √ Complex test

  Matrix test
a=[[1,2],[3,4]]
at=[[1,3],[2,4]]
    √ transpose test
    √ diag test
    √ identity test
a=[[1,2],[3,4]]
aat=[[5,11],[11,25]]
    √ dot test
a=[[1,2],[3,4]]
a=[[1,2],[3,4]]
b=[[-1.9999999999999996,0.9999999999999998],[1.4999999999999998,-0.49999999999999994]]
ab=[[1,-1.1102230246251565e-16],[8.881784197001252e-16,0.9999999999999993]]
a=[[1,2],[3,4]]
    √ inv test
a=[[1,2],[3,4]]
d=-2
    √ det test
lup= { LU: [ [ 3, 4 ], [ 0.3333333333333333, 0.6666666666666667 ] ],
  P: [ 1, 1 ] }
s= [ 5.000000000000001, 5.999999999999999 ]
    √ LU test
svd= { U:
   [ [ 0.404553584833757, 0.9145142956773045 ],
     [ 0.9145142956773045, -0.404553584833757 ] ],
  S: [ 5.464985704219044, 0.3659661906262578 ],
  V:
   [ [ 0.5760484367663207, -0.8174155604703635 ],
     [ 0.8174155604703635, 0.5760484367663207 ] ] }
UtU= [ [ 1, 0 ], [ 0, 1 ] ]
VVt= [ [ 1, 0 ], [ 0, 1 ] ]
USV= [ [ 1.0000000000000002, 2.000000000000001 ],
  [ 3, 4.000000000000002 ] ]
    √ svd test

  ma6: O test
    √ complex test
    √ vector test
a={"v":{"r":[1,2,3],"i":[1,1,1],"shape":[3]},"type":"tensor"}
b={"v":{"r":[2,4,6],"i":[2,2,2],"shape":[3]},"type":"tensor"}
c={"v":{"r":1,"i":0},"type":"complex"}
ac={"v":{"r":[1,2,3],"i":[1,1,1],"shape":[3]},"type":"tensor"}
    √ tensor test
rowSum()={"v":{"r":[48.11846660451341,48.092736611522966,44.3145742382903,62.40098820728922,35.27243964776318,43.51266301026148,47.35346938540285,64.06748625103023,64.3153075286672,46.045195079858864],"i":[],"shape":[10]},"type":"tensor"}
    √ R test

  ma6: Probability test
x= 0.7 p= 0.13999999999999999 x2= 0.7
    √ uniform test
x= 0.7 p= 0.332386312626675 x2= 0.6999999999999988
    √ normal test
x= 0.7 p= 0.7534030360583935 x2= 0.7000000000000001
    √ exp test
x= 0.7 p= 0.9162999999999999 x2= 0.7
    √ beta test
x= 0.7 p= 0.3640224729731535 x2= 0.6999999999999997
    √ f test
x= 0.7 p= 0.12679605093604643 x2= 0.6999999999999997
    √ chiSquare test
x= 0.7 p= 0.36984059550697 x2= 0.7000000000000002
    √ cauchy test
x= 0.7 p= 0.02333620151796928 x2= 0.6999999999999998
    √ gamma test
x= 0.7 p= 0.07275144416040924 x2= 0.7000000000000001
    √ invGamma test
x= 0.7 p= 0.7328365002454507 x2= 0.6999999945124593
    √ t test
x= 0.7 p= 0.052988880874744515 x2= 0.6999999999999997
    √ weibull test
binomial.pdf({"k":5,"p":0.5,"n":5})=0.03125
binomial.cdf({"k":5,"p":0.5,"n":5})=1
    √ binomial test
negBinomial.pdf({"k":3,"p":0.5,"r":5,"x":6})=0.13671875
negBinomial.cdf({"k":3,"p":0.5,"r":5,"x":6})=0.7255859375
    √ negBinomial test
poisson.pdf({"k":3,"l":2,"x":3})=0.1804470443154836
poisson.cdf({"k":3,"l":2,"x":3})=0.8571234604985472
    √ poisson test

  ma6: Probability test
    √ uniform test

  ma6 test
v=[0,1,2,3,4,5,6,7,8,9,10,11]
t= [[[0,1,2],[3,4,5]],[[6,7,8],[9,10,11]]]
t.get(...idx)= OO { v: { r: 11, i: 0 }, type: 'complex' }
t= [[0,1,2,3],[4,5,6,7],[8,9,10,11]]
nd={"v":[[0,1,2,3],[4,5,6,7],[8,9,10,11]],"type":"ndarray"}
    √ Tensor test

  ma6 test
    √ Vector test

  nn6.Net
net.vars=[{"v":2.9999999983170325,"g":0},{"v":1.8673814466702032e-18,"g":0}]
    √ gd result net.x.v should be near 3

  nn6.Layer
    nn6.FLayer
p= { f: [Function: f], gf: [Function: gf] } this.p= { f: [Function: f], gf: [Function: gf] }
gx1:numeric = [1,0]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[2,0] g:[0,0] shape:[2]
gx2:backprop= [1,0]
      √ Relu Layer
p= { f: [Function: f], gf: [Function: gf] } this.p= { f: [Function: f], gf: [Function: gf] }
gx1:numeric = [0.9091,0.0909]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[2,-0.3] g:[0,0] shape:[2]
gx2:backprop= [0.9091,0.0909]
      √ Relu(leaky=0.1) Layer
p= { f: [Function: f], gf: [Function: gf] } this.p= { f: [Function: f], gf: [Function: gf] }
gx1:numeric = [0.6992,0.3008]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[0.8808,0.0474] g:[0,0] shape:[2]
gx2:backprop= [0.6992,0.3008]
      √ Sigmoid Layer
p= { f: [Function: f], gf: [Function: gf] } this.p= { f: [Function: f], gf: [Function: gf] }
gx1:numeric = [0.8775,0.1225]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[0.964,-0.9951] g:[0,0] shape:[2]
gx2:backprop= [0.8775,0.1225]
      √ Tanh Layer
    nn6.InputLayer
p= {} this.p= {}
gx1:numeric = [0.5,0.5]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[2,-3] g:[0,0] shape:[2]
gx2:backprop= [0.5,0.5]
      √ InputLayer(x)
    nn6.RegressionLayer
p= {} this.p= {}
gx1:numeric = [-0.25,-0.75]
forward() x= TensorVariable v:[2,-3] g:[-1,-3] shape:[2] o= TensorVariable v:[5] g:[0] shape:[1]
gx2:backprop= [-0.25,-0.75]
      √ RegressionLayer(x, y=[3, 0])
    nn6.FullyConnectLayer
p= { n: 1, cw: 0.2, cbias: 0.1 } this.p= { n: 1, cw: 0.2, cbias: 0.1 }
gx1:numeric = [0.5,0.5]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[-0.3] g:[0] shape:[1]
gx2:backprop= [0.5,0.5]
      √ FullyConnectLayer 2to1
p= { n: 2, cw: 0.2, cbias: 0.1 } this.p= { n: 2, cw: 0.2, cbias: 0.1 }
gx1:numeric = [0.3636,0.6364]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[-0.3,-1.2] g:[0,0] shape:[2]
gx2:backprop= [0.3636,0.6364]
      √ FullyConnectLayer 2to2
    nn6.FcActLayer
p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: ReluLayer] } this.p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: ReluLayer] }
p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: ReluLayer] } this.p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: ReluLayer] }
p= { f: [Function: f], gf: [Function: gf] } this.p= { f: [Function: f], gf: [Function: gf] }
gx1:numeric = [0.5,0.5]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[-0.015] g:[0] shape:[1]
gx2:backprop= [0.5,0.5]
      √ FcActLayer 2to1
    nn6.PerceptronLayer
p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: SigmoidLayer] } this.p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: SigmoidLayer] }
p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: SigmoidLayer] } this.p= { n: 1, cw: 0.2, cbias: 0.1, ActLayer: [Function: SigmoidLayer] }
p= { f: [Function: f], gf: [Function: gf] } this.p= { f: [Function: f], gf: [Function: gf] }
gx1:numeric = [0.5,0.5]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[0.4256] g:[0] shape:[1]
gx2:backprop= [0.5,0.5]
      √ PerceptronLayer 2to1
    nn6.SoftmaxLayer
p= {} this.p= {}
gx1:numeric = [-0.5,0.5]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[0.0067] g:[0] shape:[1]
gx2:backprop= [-0.5,0.5]
      √ SoftmaxLayer
    nn6.DropoutLayer
p= {} this.p= {}
gx1:numeric = [0.5,0.5]
forward() x= TensorVariable v:[2,-3] g:[0,0] shape:[2] o= TensorVariable v:[1,-1.5] g:[0,0] shape:[2]
gx2:backprop= [0.5,0.5]
      √ DropoutLayer
    nn6.PoolLayer
p= { fw: 3, fh: 3, stride: 1, pad: 0 } this.p= { fw: 3, fh: 3, stride: 1, pad: 0 }
gx1:numeric = [0,0,0,0,0,0.25,0,0,0,0,0,0.25,0,0,0.5,0]
forward() x= TensorVariable v:[1,0,1.1,0,0,1.2,0,1.3,0,0,0,1.4,0,0,2,0] g:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] shape:[1,4,4] o= TensorVariable v:[1.2,1.4,2,2]
g:[0,0,0,0] shape:[1,2,2]
gx2:backprop= [0,0,0,0,0,0.25,0,0,0,0,0,0.25,0,0,0.5,0]
      √ PoolLayer
    nn6.ConvLayer
p= { od: 1, fw: 3, fh: 3, stride: 1, pad: 0, cw: 0.2, cbias: 0.1 } this.p= { od: 1, fw: 3, fh: 3, stride: 1, pad: 0, cw: 0.2, cbias: 0.1 }
gx1:numeric = [0.0278,0.0556,0.0556,0.0278,0.0556,0.1111,0.1111,0.0556,0.0556,0.1111,0.1111,0.0556,0.0278,0.0556,0.0556,0.0278]
forward() x= TensorVariable v:[1,0,1.1,0,0,1.2,0,1.3,0,0,0,1.4,0,0,2,0] g:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] shape:[1,4,4] o= TensorVariable v:[0.76,1.1,0.74,1.28] g:[0,0,0,0] shape:[1,2,2]
gx2:backprop= [0.0278,0.0556,0.0556,0.0278,0.0556,0.1111,0.1111,0.0556,0.0556,0.1111,0.1111,0.0556,0.0278,0.0556,0.0556,0.0278]
      √ ConvLayer
p= { od: 1, fw: 3, fh: 3, stride: 1, pad: 2, cw: 0.3, cbias: 0 } this.p= { od: 1, fw: 3, fh: 3, stride: 1, pad: 2, cw: 0.3, cbias: 0 }
gx1:numeric = [0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625]
forward() x= TensorVariable v:[1,0,1.1,0,0,1.2,0,1.3,0,0,0,1.4,0,0,2,0] g:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] shape:[1,4,4] o= TensorVariable v:[0.437,0.437,0.767,0.467,0.467,0.137,0.437,0.797,1.127,1.217,0.857,0.527,0.437,0.797,1.127,1.637,1.277,0.947,0.137,0.497,1.097,1.907,1.547,0.947,0.137,0.137,0.737,1.157,1.157,0.557,0.137,0.137,0.737,0.737,0.737,0.137] g:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] shape:[1,6,6]
gx2:backprop= [0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625,0.0625]
      √ ConvLayer
p= { od: 1, fw: 3, fh: 3, stride: 2, pad: 2, cw: 0.1, cbias: 0.2 } this.p= { od: 1, fw: 3, fh: 3, stride: 2, pad: 2, cw: 0.1, cbias: 0.2 }
gx1:numeric = [0.1111,0.0556,0.1111,0.0556,0.0556,0.0278,0.0556,0.0278,0.1111,0.0556,0.1111,0.0556,0.0556,0.0278,0.0556,0.0278]
forward() x= TensorVariable v:[1,0,1.1,0,0,1.2,0,1.3,0,0,0,1.4,0,0,2,0] g:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] shape:[1,4,4] o= TensorVariable v:[0.3,0.41,0.31,0.3,0.53,0.58,0.2,0.4,0.54] g:[0,0,0,0,0,0,0,0,0] shape:[1,3,3]
gx2:backprop= [0.1111,0.0556,0.1111,0.0556,0.0556,0.0278,0.0556,0.0278,0.1111,0.0556,0.1111,0.0556,0.0556,0.0278,0.0556,0.0278]
      √ ConvLayer
p= { od: 1, fw: 3, fh: 3, stride: 2, pad: 2 } this.p= { od: 1, fw: 3, fh: 3, stride: 2, pad: 2 }
gx1:numeric = [0.0524,-0.1719,0.0524,-0.1719,0.0215,0.0042,0.0215,0.0042,0.0524,-0.1719,0.0524,-0.1719,0.0215,0.0042,0.0215,0.0042]
forward() x= TensorVariable v:[1,0,1.1,0,0,1.2,0,1.3,0,0,0,1.4,0,0,2,0] g:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] shape:[1,4,4] o= TensorVariable v:[0.1443,-0.3248,-1.1012,-0.6828,-0.234,-0.6294,-0.5129,-0.1329,-1.7035] g:[0,0,0,0,0,0,0,0,0] shape:[1,3,3]
gx2:backprop= [0.0524,-0.1719,0.0524,-0.1719,0.0215,0.0042,0.0215,0.0042,0.0524,-0.1719,0.0524,-0.1719,0.0215,0.0042,0.0215,0.0042]
      √ ConvLayer

  se6.expect 中文測試
    √ number test
    √ array test
    √ object test
    √ pass test

  se6.expect
    √ number test
    √ array test
    √ object test
    √ pass test

  uu6 test
    √ args test


  58 passing (484ms)
```

