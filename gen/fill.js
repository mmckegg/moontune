module.exports = Fill

function Fill(rateFn, offsetFn){
  return function(last){
    var rate = typeof rateFn == 'function' ? rateFn.apply(this, arguments) : rateFn
    var offset = typeof offsetFn == 'function' ? offsetFn.apply(this, arguments) : offsetFn

    if (last == null){
      return offset || 0
    } else {
      return rate || 1
    }
  }
}