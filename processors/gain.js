var ObservStruct = require('observ-struct')
var Observ = require('observ')
var AudioNodeArray = require('../audio-node-array')
var Param = require('../param')

module.exports = FilterNode

function FilterNode(context){

  var obs = ObservStruct({
    sources: AudioNodeArray(context),
    gain: Param(context, 1)
  })

  obs._type = 'GainNode'

  obs.readSamples = function(schedule){
    var gain = obs.gain.readSamples(schedule)
    return obs.sources.readSamples(schedule, gain)
  }

  return obs
}