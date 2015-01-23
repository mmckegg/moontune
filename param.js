var Observ = require('observ')
var resolveNode = require('observ-node-array/resolve')

module.exports = ParamNode

function ParamNode(context, defaultValue){
  var obs = Observ()

  var lastDescriptor = null
  var value = defaultValue

  obs(function(data){
    if (data instanceof Object){
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
      }
    } else {
      value = data != null ? data : defaultValue
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