var util = require('util')
var coolScale = scale(440, [2,2,1,2,2,1])

module.exports = {

  sources: [

    seq(8, 
     multi([
       synth('sine', 2, 0, 0.3),
       synth('square', 0.1, 0, 0.3)
     ]),
     fill(2, 1), 
     octave(-3, coolScale), 
     quant(3, cos(16, 0, 7, 0.5))
    ),

    seq(1, 
     synth('saw', 0.9, 0, 0.1),
     fill(1/8), 
     octave(0, coolScale), 
     quant(4, cos(1, 0, 10, 0.5))
    ),

    seq(1, 
     synth('saw', 0.5, 0, 0.1),
     fill(3/7), 
     octave(1, coolScale), 
     quant(4, cos(1, 0, 10, 0.5))
    ),

    seq(8, 
     synth('triangle', 1, 1, 1),
     fill(3/8,1, 0.5), 
     octave(0, coolScale), 
     cos(8, 0, -2, 0.5)
    ),

    seq(4, 
     synth('saw', 0.4, 1, 1),
     fill(1,1), 
     octave(1, coolScale), 
     cos(8, 0, 2, 0.5)
    ),

    seq(4, 
     synth('sine', 0.8, 1, 1),
     fill(3/8,0.3), 
     octave(0, coolScale), 
     quant(3, cos(1, -10, 10, 0.5))
    ),

    seq(2,
      kick(1, 100, 0, 0.2),
      fill(1+3/4)
    ),

    seq(2,
      snare(2, 0.4),
      fill(1, 0.5, 1)
    ),

    seq(1,
      hat(1, 0.1),
      fill(1/8)
    ),

    seq(2,
      hat(1, 0.05),
      fill(1/6)
    )
  ]
}

if (process.send){
  process.send(module.exports)
}

//console.log(util.inspect(module.exports, {depth: 10}))

function quant(grid, func){
  return function(){
    return Math.round(func.apply(this, arguments)/grid)*grid
  }
}

function cos(length, min, max, offset){
  return function pos(event){
    var pos = (event[0]/length) + (offset || 0)
    var res = (Math.cos(pos*Math.PI*2) + 1) / 2
    var range = max - min
    return Math.round(res * range + min)
  }
}

function fill(rate, length, offset){
  length = length != null ? length: 0.5
  return function(last){
    if (!last){
      return [(offset||0)*length, rate * length]
    } else {
      return [last[0]+rate, last[1]]
    }
  }
}

function scale(baseFreq, intervals){

  var fractions = [0]
  var lastFrac = 0
  for (var i=0;i<intervals.length;i++){
    lastFrac = lastFrac+intervals[i]
    fractions.push(lastFrac/12)
  }

  return function(index){
    var i = mod(index, fractions.length)
    var oct = Math.floor(index / fractions.length)
    return baseFreq * Math.pow(2, fractions[i] + oct)
  }
}

function seq(length, osc, trigger, scale, pattern){
  var currentTrigger = null
  var currentFreq = null

  var patternLookup = {}
  var freqs = []
  while ((currentTrigger = trigger(currentTrigger)) && currentTrigger[0] < length) {
    currentFreq = scale && pattern ? scale(pattern(currentTrigger, currentFreq)) : null

    if (!patternLookup[currentFreq]){
      freqs.push(currentFreq)
      patternLookup[currentFreq] = [length]
    }

    patternLookup[currentFreq].push(currentTrigger)
  } 

  return {
    node: 'gain',
    sources: freqs.sort(compare).map(function(freq){
      return osc(freq, patternLookup[freq])
    })
  }
}

function compare(a,b){
  return a - b
}

function multi(targets){

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

function octave(oct, scale){
  return function(args){
    return scale.apply(this, arguments) * Math.pow(2, oct)
  }
}

function kick(amp, from, to, duration){
  return function(freq, pattern){
    pattern = pattern.map(function(e,i){
      if (i>0){
        return [e[0], duration]
      } else {
        return e
      }
    })

    var freq = {
      node: 'lfo',
      frequency: 1 / duration,
      offset: -0.5,
      amp: from,
      shape: 'saw_i',
      value: to,
      play: pattern
    }

    var env = {
      node: 'envelope',
      release: 0.1,
      value: amp/2,
      play: pattern
    }

    var node = {
      node: 'gain',
      sources: [
        { node: 'oscillator', 
          frequency: freq,
          shape: 'square',
          detune: 0, 
          amp: env,
          play: pattern
        },
        { node: 'oscillator', 
          frequency: freq,
          shape: 'sine',
          detune: 0, 
          amp: {
            node: 'envelope',
            release: 0.1,
            value: amp*4,
            play: pattern
          },
          play: pattern
        }
      ]
    } 
    

    console.log(node)

    return node
  }
}

function snare(amp, duration){
  return function(freq, pattern){

    pattern = pattern.map(function(e,i){
      if (i>0){
        return [e[0], duration]
      } else {
        return e
      }
    })

    return { node: 'noise', 
      amp: {
        node: 'envelope',
        release: duration,
        value: amp,
        play: pattern
      }, 
      play: pattern
    }
  }
}

function hat(amp, duration){
  return function(freq, pattern){

    pattern = pattern.map(function(e,i){
      if (i>0){
        return [e[0], duration]
      } else {
        return e
      }
    })

    return {
      node: 'filter',
      type: 'highpass',
      frequency: 4000,
      sources: [
        { node: 'noise', 
          amp: {
            node: 'envelope',
            release: duration,
            value: amp,
            play: pattern
          }, 
          play: pattern
        }
      ]
    } 
  }
}

function synth(shape, amp, attack, release){
  return function(freq, pattern){
    return { node: 'oscillator', 
      frequency: freq, 
      shape: shape,
      detune: 0, 
      amp: {
        node: 'envelope',
        attack: attack,
        release: release,
        value: amp,
        play: pattern
      }, 
      play: pattern
    }
  }
}

function mod(n, m) {
  return ((n%m)+m)%m
}