var ObservStruct = require('observ-struct')
var Observ = require('observ')
var TriggerPattern = require('../trigger-pattern')
var Param = require('../param')
var readEventValue = require('../event-value')

module.exports = function LfoNode(context){

  var currentPhase = null
  var playing = false

  var obs = ObservStruct({
    frequency: Param(context, 1),
    mode: Observ(),
    value: Param(context, 1),
    play: TriggerPattern(),
    amp: Param(context, 1),
    offset: Observ(),
    shape: Observ()
  })

  obs._type = 'LfoNode'

  obs.readSamples = function(schedule){
    var buffer = new Float32Array(schedule.length)
    var duration = schedule.duration
    var time = schedule.time
    var frequency = obs.frequency.readSamples(schedule)
    var amp = obs.amp.readSamples(schedule)

    var generate = oscillators[obs.shape()] || oscillators.sine

    var events = obs.play.readState(schedule)
    var values = obs.value.readSamples(schedule)

    if (events){
      for (var i=0;i<schedule.length;i++){
        var t = events === true ? 1 : events[i]
        if (t>0){

          if (!playing){
            currentPhase = (obs.offset() || 0) % 1
            playing = true
          }

          var f = readEventValue(frequency, i)
          var a = readEventValue(amp, i)

          var sampleIncrement = f / context.sampleRate
          currentPhase = currentPhase != null ? (currentPhase + sampleIncrement) % 1 : 0
          buffer[i] = generate(currentPhase) * a + readEventValue(values, i)

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