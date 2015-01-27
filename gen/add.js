var readValue = require('./read-value')

module.exports = Add

function Add(f1, f2){
  return function(){
    var v1 = typeof f1 == 'function' ? f1.apply(this, arguments) : f1
    var v2 = typeof f2 == 'function' ? f2.apply(this, arguments) : f2
    return (v1 || 0) + (v2 || 0)
  }
}