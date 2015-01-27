module.exports = Group

function Group(targets){
  return function(args){
    args = Array.prototype.slice.apply(arguments)
    return {
      node: 'gain',
      sources: targets.map(function(f){
        return f.apply(this, args)
      })
    }
  }
}