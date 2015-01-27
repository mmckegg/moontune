module.exports = Sequence

function Sequence(length, osc, trigger, getFrequency){
  var currentTrigger = null
  var currentFreq = null

  var patternLookup = {}
  var freqs = []

  var lastTrigger = null
  var currentPos = trigger(null)

  while (currentPos < length) {

    currentFreq = typeof getFrequency == 'function' ? 
      getFrequency(currentPos) : 
      getFrequency || null

    if (!patternLookup[currentFreq]){
      freqs.push(currentFreq)
      patternLookup[currentFreq] = [length]
    }

    var event = [currentPos]
    currentPos = trigger(currentPos) + currentPos
    event.push((currentPos - event[0]) * 0.75)
    patternLookup[currentFreq].push(event)
  } 

  return {
    node: 'gain',
    sources: freqs.sort(compare).map(function(freq){
      return osc(freq, patternLookup[freq])
    })
  }
}

function getStart(event){
  return Array.isArray(event) ? event[0] : null
}

function compare(a,b){
  return a - b
}