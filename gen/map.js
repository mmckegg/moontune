module.exports = Map

function Map(mod, args){
  return function(val){
    var index = Math.floor((val % mod) / mod * args.length)
    return args[index]
  }  
}