
var ObservStruct = require('observ-struct')
var Observ = require('observ')
var TriggerPattern = require('../trigger-pattern')
var Param = require('../param')
var readEventValue = require('../event-value')

module.exports = function NoiseNode(context){

  var obs = ObservStruct({
    play: TriggerPattern(),
    amp: Param(context, 1)
  })

  obs.readSamples = function(schedule){
    var buffer = new Float32Array(schedule.length)
    var amp = obs.amp.readSamples(schedule)
    var events = obs.play.readState(schedule)

    if (events){
      for (var i=0;i<schedule.length;i++){
        var t = events === true ? 1 : events[i]
        if (t>0){
          var a = readEventValue(amp, i)
          buffer[i] = generate() * a
        } else {
          buffer[i] = 0
        }
      }
    }

    return buffer
  }

  return obs
}

function generate(){
  return Math.random() * 2 - 1
}