module.exports = Octave

function Octave(oct, scale){
  return function(args){
    return scale.apply(this, arguments) * Math.pow(2, oct)
  }
}