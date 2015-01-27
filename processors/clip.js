var ObservStruct = require('observ-struct')
var Observ = require('observ')
var AudioNodeArray = require('../lib/audio-node-array')
var Param = require('../lib/param')
var readEventValue = require('../lib/event-value')

module.exports = FilterNode

function FilterNode(context){

  var obs = ObservStruct({
    sources: AudioNodeArray(context),
    gain: Param(context, 1),
    post: Param(context, 1)
  })

  obs._type = 'GainNode'

  obs.readSamples = function(schedule){
    var gain = obs.gain.readSamples(schedule)
    var post = obs.post.readSamples(schedule)

    var input = obs.sources.readSamples(schedule, gain)

    var result = new Float32Array(schedule.length)
    for (var i=0;i<result.length;i++){
      result[i] = Math.min(1, readEventValue(input, i) * readEventValue(gain, i)) * readEventValue(post, i)
    }

    return result
  }

  return obs
}