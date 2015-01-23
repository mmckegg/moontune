var context = {
  nodes: {
    speaker: require('./sinks/speaker'),
    oscillator: require('./sources/oscillator'),
    filter: require('./processors/filter'),
    gain: require('./processors/gain')
  },
  sampleRate: 44100
}

var speaker = context.nodes.speaker(context)

speaker.set({
  sources: [
    { node: 'filter', type: 'highpass', frequency: 10000, sources: [
      { node: 'oscillator', shape: 'square', frequency: 440, detune: 0, amp: 0.6, pattern: [
        4, [0,0.5], [2,0.4], [2.5, 0.5]
      ] }
    ] },
    { node: 'oscillator', frequency: 440, detune: -200, amp: 0.6, pattern: [
      6, [0,0.5], [2,0.4], [2.5, 0.5]
    ] },
    //{ node: 'oscillator', frequency: 440, detune: 500, amp: 0.6 },
  ]
})