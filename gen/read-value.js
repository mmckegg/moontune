module.exports = readArray

function readArray(source, index, defaultValue){
  if (Array.isArray(source)){
    return source[index]
  } else if (defaultValue == null){
    return source
  } else {
    return defaultValue
  }
}