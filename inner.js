var Seq = require('./gen/sequence')

var Scale = require('./gen/scale')
var Fill = require('./gen/fill')

var Cos = require('./gen/cos')
var Mult = require('./gen/multiply')
var Div = require('./gen/divide')
var Add = require('./gen/add')
var Sub = require('./gen/subtract')
var Mod = require('./gen/modulo')
var Map = require('./gen/map')

var Oct = require('./gen/octave')
var Quant = require('./gen/quantize')

var Synth = require('./gen/synth')
var Drums = require('./gen/drums')

var Group = require('./gen/group')
var Filter = require('./gen/filter')
var Clip = require('./gen/clip')

var Lfo = {
  sine: function(rate, value, amp){
    return {
      node: 'lfo',
      shape: 'sine',
      frequency: rate,
      value: value,
      amp: amp,
      play: true
    }
  }
}

var scale = Scale.intervals(440, [2,2,1,2,2,1])

module.exports = {

  tempo: 60,

  sources: [

    //Seq(2, Synth.saw(1), Fill(1/2), scale(Cos(4, 0, 2))),
    //Seq(2, Synth.saw(1), Fill(1/2), scale(Cos(4, 1, 5))),

    Seq(8, 
      Group([
        Synth.square(0.5),
        Synth.sine(2)
      ]), 
      Fill(2), 
      Oct(-3, 
        scale(Quant(3, Cos(16, 0, 7, 0)))
      )
    ),
//
    //Seq(8, Synth.square(1, 0.1), Fill(1/4), scale(Add(Cos(8, 0, 6), Quant(4, Mult(1, Cos(16, -1, 2, 0.5)))))),

    Seq(1, 
      Synth.saw(0.5, 0, 0.1),
      Fill(3/7, 0.2), 
      scale(Oct(0, Quant(4, Cos(1, 0, 10, 0))))
    ),

    Seq(4, 
      Synth.saw(0.4, 1, 1),
      Fill(1,1), 
      Oct(1, scale(Cos(8, 0, 2, 0)))
    ),

    Seq(8, 
      Synth.triangle(1, 1, 1),
      Fill(3/8,1, 0.5), 
      Oct(0, scale(Cos(8, 0, -2, 0)))
    ),

    Seq(2,
     Drums.kick(1.5, 100, 0, 0.3),
     Fill(1/2)
    ),

    Seq(2,
     Drums.hat(1),
     Fill(1/8)
    ),

    Seq(2,
     Drums.snare(1),
     Fill(1,1/2)
    ),

  ]

}

if (process.send){
  process.send(module.exports)
}


