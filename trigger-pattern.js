var Observ = require('observ')
module.exports = TriggerPattern

function TriggerPattern(context){
  var obs = Observ([])

  obs.readState = function(schedule){
    var result = new Float32Array(schedule.length)
    var events = getResolvedEvents(obs(), schedule)
    for (var t=0;t<schedule.length;t++){
      var time = (t / schedule.length) * schedule.duration
      result[t] = getInEvent(events, schedule.from + time)
    }
    return result
  }

  return obs
}

function getInEvent(events, time){
  for (var i=0;i<events.length;i++){
    var event = events[i]
    if (time >= event[0] && time < event[1]){
      return time - event[0]
    }  
  }
  return -1
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