var ObservStruct = require('observ-struct')
var Observ = require('observ')
var Param = require('../lib/param')
var readEventValue = require('../lib/event-value')
var getResolvedEvents = require('../lib/get-resolved-events')

module.exports = function EnvelopeNode(parentContext){

  var context = Object.create(parentContext)

  var obs = ObservStruct({
    startValue: Observ(),
    attack: Observ(),
    sustain: Observ(),
    decay: Observ(),
    release: Observ(),
    play: Observ(),
    value: Param(context, 1)
  })

  var currentPhase = null
  var step = null
  var from = null
  var currentValue = 0
  var pos = null

  obs.readSamples = function(schedule){

    var values = obs.value.readSamples(schedule)
    var pattern = obs.play()||context.currentPattern

    context.currentPattern = pattern

    if (pattern === true){
      return pattern
    }

    var events = getResolvedEvents(
      pattern||[],
      schedule
    )

    var startValue = obs.startValue()||0
    var endValue = obs.startValue()||0

    var attack = obs.attack()||0
    var decay = obs.decay()||0
    var release = obs.release()||0
    var sustain = obs.sustain() != null ? obs.sustain() : 1

    if (events.length){
      var result = new Float32Array(schedule.length)
      for (var t=0;t<schedule.length;t++){
        var time = (t / schedule.length) * schedule.duration * schedule.beatDuration
        var at = schedule.from + time
        var event = getEvent(events, at)
        var value = readEventValue(values, t)

        var phase = null

        if (event){
          var duration = event[1] - event[0]

          var max = attack + release + decay
          if (max > duration){
            var mult = duration / max
            attack = attack * mult
            release = release * mult
            decay = decay * mult
          }

          if (at > event[1]-release){
            phase = 'release'
          } else if (at < event[0]+attack){
            phase = 'attack'
          } else if (at < event[0]+attack+decay){
            phase = 'decay'
          } else {
            phase = 'sustain'
          }

          if (phase !== currentPhase){
            pos = 0
            if (phase === 'attack'){
              from = startValue
              step = schedule.beatDuration / attack / context.sampleRate
            } else if (phase === 'decay'){
              from = currentValue
              step = schedule.beatDuration / decay / context.sampleRate
            } else if (phase === 'release'){
              from = currentPhase ? currentValue : value
              step = schedule.beatDuration / release / context.sampleRate
            } else {
              from = step = target = null
            }
          }
        }

        currentPhase = phase

        if (phase === 'attack'){
          currentValue = linear(from, value, pos)
        } else if (phase === 'decay'){
          currentValue = linear(from, value*sustain, pos)
        } else if (phase === 'release'){
          currentValue = linear(from, endValue, pos)
        } else if (phase === 'sustain'){
          currentValue = value * sustain
        } else {
          currentValue = startValue
        }

        if (step && pos <= 1){
          pos += step
        }

        result[t] = Math.min(currentValue, 10)
      }

      return result
    }

  }

  return obs
}

function getEvent(events, time){
  for (var i=0;i<events.length;i++){
    var event = events[i]
    if (time >= event[0] && time < event[1]){
      return event
    }  
  }
  return null
}

function linear(from, to, pos){
  var range = to - from
  return pos * range + from
}