var readValue = require('./read-value')

module.exports = Modulo

function Modulo(f1, f2){
  return function(val){
    var v1 = typeof f1 == 'function' ? f1.apply(this, arguments) : f1 || 1
    var v2 = typeof f2 == 'function' ? f2.apply(this, arguments) : f2 || 1
    return Math.round((val % v1) / v1 * v2) / v2
  }
}