var fs = require('fs')
var fork = require('child_process').fork

var context = {
  nodes: {
    speaker: require('./sinks/speaker'),
    oscillator: require('./sources/oscillator'),
    filter: require('./processors/filter'),
    gain: require('./processors/gain'),
    envelope: require('./sources/envelope'),
    lfo: require('./sources/lfo'),
    noise: require('./sources/noise')
  },
  sampleRate: 44100
}

var speaker = context.nodes.speaker(context)

var child = null
function restart(){
  console.log('child loaded')
  if (child){
    child.kill()
  }

  child = fork('./inner.js')
  child.on('message', function(m){
    speaker.set(m)
  })
}

var watcher = fs.watch('./inner.js')
watcher.on('change', restart)

restart()