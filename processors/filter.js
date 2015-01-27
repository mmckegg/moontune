var ObservStruct = require('observ-struct')
var Observ = require('observ')
var Biquad = require('../dsp/biquad')
var AudioNodeArray = require('../lib/audio-node-array')
var Param = require('../lib/param')
var readEventValue = require('../lib/event-value')


module.exports = FilterNode

function FilterNode(context){

  var filter = new Biquad(context.sampleRate)

  var obs = ObservStruct({
    frequency: Param(context, 340),
    Q: Observ(),
    type: Observ(),
    dbGain: Observ(),
    sources: AudioNodeArray(context)
  })

  obs._type = 'FilterNode'
  obs.type(function(val){
    filter.setType(val)
  })

  //obs.frequency(updateParams)
  //obs.Q(updateParams)
  //obs.dbGain(updateParams)
//
  //function updateParams(){
  //}

  obs.readSamples = function(schedule){
    var input = obs.sources.readSamples(schedule)
    if (input){

      var frequency = obs.frequency.readSamples(schedule)
      filter.setParams(readEventValue(frequency, 0), obs.Q() || 1, obs.dbGain() || 0)

      var cell = new Float32Array(input.length)

      cell.set(input)
      filter.process(cell)

      return cell
    }
  }

  return obs
}