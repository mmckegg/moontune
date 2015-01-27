module.exports = {
  kick: kick,
  snare: snare,
  hat: hat
}

function kick(amp, from, to, duration){

  duration = duration || 0.3
  from = from || 120
  to = to || 10


  return function(freq, pattern){
    pattern = pattern.map(function(e,i){
      if (i>0){
        return [e[0], duration]
      } else {
        return e
      }
    })

    var freq = {
      node: 'ramp',
      from: from,
      to: to,
    }

    var node = {
      node: 'gain',
      sources: [
        { node: 'filter',
          frequency: 1000,
          sources: [

            { node: 'oscillator', 
              frequency: freq,
              shape: 'sine',
              detune: 0, 
              amp: {
                node: 'envelope',
                release: 0.1,
                value: 3
              },
              play: pattern
            },

            //{ node: 'oscillator', 
            //  frequency: freq,
            //  shape: 'square',
            //  detune: 0, 
            //  amp: {
            //    node: 'envelope',
            //    release: 0.1,
            //    value: 0.1
            //  },
            //  play: pattern
            //},

            { node: 'oscillator', 
              frequency: 60,
              shape: 'square',
              amp: {
                node: 'envelope',
                release: 1,
                value: 0.2
              },
              play: pattern
            }
          ]
        }
      ],
      gain: amp
    } 
    
    return node
  }
}

function snare(amp, duration){

  duration = duration || 0.3

  return function(freq, pattern){

    pattern = pattern.map(function(e,i){
      if (i>0){
        return [e[0], Math.min(duration, e[1])]
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
  duration = duration || 0.3

  return function(freq, pattern){

    pattern = pattern.map(function(e,i){
      if (i>0){
        return [e[0], Math.min(duration, e[1])]
      } else {
        return e
      }
    })

    return {
      node: 'filter',
      type: 'highpass',
      frequency: 5000,
      sources: [
        { node: 'noise', 
          amp: {
            node: 'envelope',
            release: duration,
            value: amp*0.4
          }, 
          play: pattern
        }
      ]
    } 
  }
}