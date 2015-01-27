module.exports = getResolvedEvents

function getResolvedEvents(events, schedule){
  var result = []
  if (Array.isArray(events)){
    var loopLength = events[0] || 1
    for (var i=1;i<events.length;i++){
      var event = events[i]
      var startPosition = getAbsolutePosition(event[0], schedule.from, loopLength)
      result.push([
        startPosition,
        startPosition + event[1]
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