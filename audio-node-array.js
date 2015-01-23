var NodeArray = require('observ-node-array')
var readEventValue = require('./event-value')

module.exports = AudioNodeArray

function AudioNodeArray(context){
  var obs = NodeArray(context)
  obs.readSamples = function(schedule, gain){
    return mix(schedule.length, obs.map(readSamples, schedule), gain)
  }
  return obs
}

function mix(length, buffers, gain){
  gain = gain != null ? gain : 1
  if (buffers && buffers.length){
    if (buffers.length === 1){
      return buffers[0]
    } else {
      var mix = new Float32Array(length)
      for (var i=0;i<mix.length;i++){
        var val = 0
        for (var x=0;x<buffers.length;x++){
          if (buffers[x]){
            val += buffers[x][i]
          }
        }
        mix[i] = val * readEventValue(gain, i)
      }
      return mix
    }
  }
}

function readSamples(target){
  if (target && target.readSamples){
    return target.readSamples(this)
  }
}