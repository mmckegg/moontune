module.exports = {
  highpass: function(freq, sources){
    return {
      node: 'filter',
      type: 'highpass',
      frequency: freq,
      sources: Array.isArray(sources) ? sources : [sources]
    }
  },

  lowpass: function(freq, sources){
    return {
      node: 'filter',
      type: 'lowpass',
      frequency: freq,
      sources: Array.isArray(sources) ? sources : [sources]
    }
  }
}