var ObservStruct = require('observ-struct')
var Observ = require('observ')
var Param = require('../param')
var readEventValue = require('../event-value')

module.exports = function EnvelopeNode(context){
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

    if (obs.play() === true){
      return values
    }

    var events = getResolvedEvents(
      obs.play()||[],
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
        var time = (t / schedule.length) * schedule.duration
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
              step = 1 / attack / context.sampleRate
            } else if (phase === 'decay'){
              from = currentValue
              step = 1 / decay / context.sampleRate
            } else if (phase === 'release'){
              from = currentPhase ? currentValue : value
              step = 1 / release / context.sampleRate
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

function getResolvedEvents(events, schedule){
  var result = []
  if (Array.isArray(events)){
    var loopLength = events[0] || 1
    for (var i=1;i<events.length;i++){
      var event = events[i]
      var startPosition = getAbsolutePosition(event[0], schedule.from, loopLength)
      var deltaPosition = (startPosition - schedule.from) / schedule.beatDuration
      var startTime = schedule.time + deltaPosition
      result.push([
        startTime,
        startTime + event[1]
      ])
    }
  }
  return result
}


function getAbsolutePosition(pos, start, length){
  pos = pos % length
  var micro = start % length
  var position = start+pos-micro
  if (position > start){
    return position - length
  } else {
    return position
  }
}