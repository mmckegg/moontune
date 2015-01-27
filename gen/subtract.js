var readValue = require('./read-value')

module.exports = Subtract

function Subtract(f1, f2){
  return function(){
    var v1 = typeof f1 == 'function' ? f1.apply(this, arguments) : f1
    var v2 = typeof f2 == 'function' ? f2.apply(this, arguments) : f2 || 0
    return v1 - v2
  }
}