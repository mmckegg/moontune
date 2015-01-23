var ObservStruct = require('observ-struct')
var Observ = require('observ')
var AudioNodeArray = require('../audio-node-array')

module.exports = FilterNode

function FilterNode(context){

  var filter = new Biquad(context.sampleRate)

  var obs = ObservStruct({
    gain: Observ()
  })

  obs._type = 'GainNode'

  obs.readSamples = function(schedule){
    
  }

  return obs
}

function readFloatLE(buffer, offset){
  if (buffer instanceof Float32Array){
    return buffer[offset/4]
  } else {
    return buffer.readFloatLE(offset)
  }
}