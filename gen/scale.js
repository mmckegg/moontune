module.exports = Scale

function Scale(baseFreq, offsets){
  return function(fn){
    return function(args){
      var index = typeof fn == 'function' ? 
        fn.apply(this, arguments) :
        fn || 0

      var i = mod(index, offsets.length)
      var oct = Math.floor(index / offsets.length)
      return baseFreq * Math.pow(2, (offsets[i]/12) + oct)
    }
  }
}

Scale.intervals = function(baseFreq, intervals){
  var offsets = [0]
  var lastFrac = 0
  for (var i=0;i<intervals.length;i++){
    lastFrac = lastFrac+intervals[i]
    offsets.push(lastFrac)
  }
  return Scale(baseFreq, offsets)
}

function mod(n, m) {
  return ((n%m)+m)%m
}