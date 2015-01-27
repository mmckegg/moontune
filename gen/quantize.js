module.exports = Quantize 
function Quantize(grid, func){
  return function(){
    return Math.round(func.apply(this, arguments)/grid)*grid
  }
}