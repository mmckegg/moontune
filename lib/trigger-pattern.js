var Observ = require('observ')
var getResolvedEvents = require('./get-resolved-events')

module.exports = TriggerPattern

var count = 0

function TriggerPattern(context){
  var obs = Observ([])
  obs.id = count++

  obs.readState = function(schedule){
    var pattern = obs()||context.currentPattern
    if (pattern === true){
      return true
    } else {
      var events = getResolvedEvents(pattern, schedule)
      if (events.length){
        var result = new Float32Array(schedule.length)
        for (var t=0;t<schedule.length;t++){
          var time = (t / schedule.length) * schedule.duration * schedule.beatDuration
          result[t] = getInEvent(events, schedule.from + time)
        }
        return result
      }
    }
  }

  return obs
}

function getInEvent(events, time){
  for (var i=0;i<events.length;i++){
    var event = events[i]
    if (time >= event[0] && time < event[1]){
      return 1
    }  
  }
  return 0
}