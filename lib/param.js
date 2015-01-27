var Observ = require('observ')
var resolveNode = require('observ-node-array/resolve')

module.exports = ParamNode

function ParamNode(context, defaultValue){
  var obs = Observ()

  var lastDescriptor = null
  var value = defaultValue

  obs(function(data){

    var newNode = getNode(data)
    var lastNode = getNode(defaultValue)

    if (newNode !== lastNode){

      var ctor = resolveNode(context.nodes, newNode)

      if (obs.node){
        obs.node.destroy&&obs.node.destroy()
        obs.node = null
      }

      if (ctor){
        obs.node = ctor(context)
      }

    }

    if (obs.node){
      obs.node.set(data) 
    } else if (typeof data === 'number' || typeof data === 'string') {
      value = data
    } else {
      value = defaultValue
    }

    lastDescriptor = data
  })

  obs.readSamples = function(schedule){
    if (obs.node && obs.node.readSamples){
      return obs.node.readSamples(schedule)
    } else {
      return value
    }
  }

  return obs
}

function getNode(d){
  return d && d.node || null
}