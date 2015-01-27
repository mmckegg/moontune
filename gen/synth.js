module.exports = {
  sine: function(amp, attack, release){
    return Synth('sine', amp, attack, release)
  },
  square: function(amp, attack, release){
    return Synth('square', amp*0.4, attack, release)
  },
  saw: function(amp, attack, release){
    return Synth('saw', amp*0.4, attack, release)
  },
  triangle: function(amp, attack, release){
    return Synth('triangle', amp*0.4, attack, release)
  }
}

function Synth(shape, amp, attack, release){
  release = release != null ? release : 0.1
  return function(freq, pattern){
    return { node: 'oscillator', 
      frequency: freq || 440, 
      shape: shape,
      detune: 0, 
      amp: {
        node: 'envelope',
        attack: attack,
        release: release,
        value: amp
      }, 
      play: pattern
    }
  }
}