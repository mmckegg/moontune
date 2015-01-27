var ObservStruct = require('observ-struct')
var Observ = require('observ')
var TriggerPattern = require('../lib/trigger-pattern')
var Param = require('../lib/param')
var readEventValue = require('../lib/event-value')

module.exports = function LfoNode(parentContext){

  var currentPhase = null
  var playing = false

  var context = Object.create(parentContext)

  var obs = ObservStruct({
    frequency: Param(context, 440),
    play: TriggerPattern(context),
    value: Param(context, 1),
    amp: Param(context, 1),
    offset: Observ(),
    shape: Observ()
  })

  obs._type = 'LfoNode'

  obs.readSamples = function(schedule){
    context.currentPattern = obs.play()

    var buffer = new Float32Array(schedule.length)
    var frequency = obs.frequency.readSamples(schedule)
    var amp = obs.amp.readSamples(schedule)
    var value = obs.value.readSamples(schedule)

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

          var f = readEventValue(frequency, i)
          var a = readEventValue(amp, i)
          var v = readEventValue(value, i)

          var sampleIncrement = f / context.sampleRate
          currentPhase = currentPhase != null ? (currentPhase + sampleIncrement) % 1 : 0
          buffer[i] = generate(currentPhase) * a + v

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