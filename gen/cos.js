module.exports = Cos

function Cos(length, min, max, phase){
  return function(val){
    val = val || 0
    var pos = (val/length) + (phase || 0)
    var res = (Math.cos(pos*Math.PI*2-Math.PI) + 1) / 2
    var range = max - min
    return Math.round(res * range + min)
  }
}