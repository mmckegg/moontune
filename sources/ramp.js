var ObservStruct = require('observ-struct')
var Observ = require('observ')
var Param = require('../lib/param')
var readEventValue = require('../lib/event-value')
var getResolvedEvents = require('../lib/get-resolved-events')

module.exports = function RampNode(parentContext){

  var context = Object.create(parentContext)

  var obs = ObservStruct({
    from: Param(context, 1),
    to: Param(context, 1),
    play: Observ()
  })

  var currentPhase = null
  var pos = null
  var playing = false

  obs.readSamples = function(schedule){

    var from = obs.from.readSamples(schedule)
    var to = obs.to.readSamples(schedule)
    var pattern = obs.play() || context.currentPattern

    context.currentPattern = pattern

    if (pattern === true){
      return pattern
    }

    var events = getResolvedEvents(
      pattern||[],
      schedule
    )

    if (events.length){
      var result = new Float32Array(schedule.length)
      for (var t=0;t<schedule.length;t++){
        var time = (t / schedule.length) * schedule.duration * schedule.beatDuration
        var at = schedule.from + time
        var event = getEvent(events, at)

        if (event){
          var duration = (event[1] - event[0])
          var step = schedule.beatDuration / duration / context.sampleRate

          if (!playing){
            playing = true
            pos = 0
          }

          var value = linear(readEventValue(from, t), readEventValue(to, t), pos)
          
          if (pos <= 1){
            pos += step
          }

          result[t] = value
        } else {
          playing = false
        }

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