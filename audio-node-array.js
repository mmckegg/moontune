var NodeArray = require('observ-node-array')

module.exports = AudioNodeArray

function AudioNodeArray(context){
  var obs = NodeArray(context)
  obs.readSamples = function(schedule){
    return mix(schedule.length, obs.map(readSamples, schedule))
  }
  return obs
}

function mix(length, buffers){
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
        mix[i] = val
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