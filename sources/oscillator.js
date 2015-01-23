var ObservStruct = require('observ-struct')
var Observ = require('observ')
var TriggerPattern = require('../trigger-pattern')
var Param = require('../param')
var readEventValue = require('../event-value')

module.exports = function OscillatorNode(context){

  var currentPhase = null
  var playing = false

  var obs = ObservStruct({
    frequency: Param(context, 440),
    detune: Param(context, 0),
    play: TriggerPattern(),
    amp: Param(context, 1),
    offset: Observ(),
    shape: Observ()
  })

  obs._type = 'OscillatorNode'

  obs.readSamples = function(schedule){
    var buffer = new Float32Array(schedule.length)
    var duration = schedule.duration
    var time = schedule.time
    var frequency = obs.frequency.readSamples(schedule)
    var detune = obs.detune.readSamples(schedule)
    var amp = obs.amp.readSamples(schedule)

    var generate = oscillators[obs.shape()] || oscillators.sine

    var events = obs.play.readState(schedule)

    if (events){
      for (var i=0;i<schedule.length;i++){
        var t = events === true ? 1 : events[i]
        if (t>0){

          if (!playing){
            currentPhase = (obs.offset() || 0) % 1
            playing = true
          }

          var f = applyDetune(readEventValue(frequency, i), readEventValue(detune, i))
          var a = readEventValue(amp, i)

          var sampleIncrement = f / context.sampleRate
          currentPhase = currentPhase != null ? (currentPhase + sampleIncrement) % 1 : 0
          buffer[i] = generate(currentPhase) * a

        } else {
          playing = false
          buffer[i] = 0
        }
      }
    }

    return buffer
  }

  return obs
}

function applyDetune(frequency, detune){
  if (detune != null){
    return frequency * Math.pow(2, detune / 1200)
  } else {
    return frequency
  }
}

var oscillators = {
  sine: function(p){
    return Math.sin(2 * Math.PI * p)
  },
  saw: function(p){
    return -1 + (2 * p)
  },
  saw_i: function(p){
    return 1 - (2 * p)
  },
  square: function(p){
    return p > 0.5 ? 1 : -1;
  }
}