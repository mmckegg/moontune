module.exports = function(events, i){
  if (events instanceof Float32Array){
    return events[i]
  } else {
    return events
  }
}