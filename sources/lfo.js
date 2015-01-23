var oscillators = require('oscillators')
var ObservStruct = require('observ-struct')
var Observ = require('observ')
var TriggerPattern = require('../trigger-pattern')

module.exports = function OscillatorNode(){
  var obs = ObservStruct({
    frequency: Observ(),
    value: Observ(),
    mode: Observ(),
    pattern: TriggerPattern(),
    amp: Observ(),
    shape: Observ()
  })

  obs._type = 'OscillatorNode'

  obs.readSamples = function(schedule){
    var buffer = new Float32Array(schedule.length)
    var duration = schedule.duration
    var time = schedule.time
    var frequency = obs.frequency() || 440
    var amp = obs.amp() != null ? obs.amp() : 1
    var finalFrequency = applyDetune(frequency, obs.detune())
    var generate = oscillators[obs.shape()] || oscillators.sine

    var events = obs.pattern.readState(schedule)

    for (var i=0;i<events.length;i++){
      if (events[i]>=0){
        buffer[i] = generate(events[i], finalFrequency) * amp
      } else {
        buffer[i] = 0
      }
    }

    return buffer
  }

  return obs
}