
var Speaker = require('speaker')


/*

var fs = require('fs')
var audioFile = 
  '../../Projects/Destroy With Science/Exports/Time Travellers Die.wav'

var speaker = Speaker({
  channels: 2,
  sampleRate: 44100,
  bitDepth: 16
})

fs.createReadStream(audioFile, {start: 44})
  .pipe(speaker)

*/

/*
var Readable = require('stream').Readable

var speaker = Speaker({
  channels: 1,
  sampleRate: 44100,
  bitDepth: 32,
  float: true
})

var oscillator = new Readable()
oscillator.position = 0
oscillator.chunkLength = 1024

oscillator._read = function(){
  var chunk = new Float32Array(this.chunkLength)
  var freq = 440

  for (var i=0;i<chunk.length;i++){
    var time = this.position / speaker.sampleRate
    //var modulator = Math.round(Math.cos(Math.PI * (time % 2) / 4) * 4) + 2
    chunk[i] = (time * freq % 1 > 0.5 ? 1 : -1) * 0.3
      //+ Math.sin(2 * Math.PI * time * freq / 2)
      //+ Math.sin(2 * Math.PI * time * freq / modulator)

    //chunk[i] = Math.min(1, chunk[i] * 30) / 30
    this.position += 1
  }

  this.push(toBuffer(chunk))
}

oscillator.pipe(speaker)

function toBuffer(buffer){
  return new Buffer(new Uint8Array(buffer.buffer))
}

*/





var context = {
  nodes: {
    speaker: require('./sinks/speaker'),
    oscillator: require('./sources/oscillator'),
    noise: require('./sources/noise'),
    filter: require('./processors/filter'),
    gain: require('./processors/gain'),
    clip: require('./processors/clip'),
    envelope: require('./sources/envelope'),
    lfo: require('./sources/lfo'),
    ramp: require('./sources/ramp')
  },
  sampleRate: 44100
}

var speaker = context.nodes.speaker(context)

// speaker.set({
//   sources: [

//     { node: 'oscillator',
//       frequency: 220,
//       shape: 'saw',
//       play: [2, [0, 1]],
//       amp: {
//         node: 'envelope',
//         release: 0.1
//       }
//     },

//     { node: 'oscillator',
//       frequency: 440,
//       shape: 'square',
//       play: [4, [0, 1/2], [1, 1/2], [2,1/4], [2+1/2,1/4], [3,1/8], [3+1/4,1/8]],
//       amp: {
//         node: 'envelope',
//         value: 0.4,
//         release: 0.2
//       }
//     }
//   ]
// })




var chokidar = require('chokidar');
var fork = require('child_process').fork
var child = null
function restart(){
  child && child.kill()
  child = fork('./inner.js')
  child.on('message', function(m){
    speaker.set(m)
  })
}

var watcher = chokidar.watch('./inner.js')
watcher.on('change', restart)
restart()



setInterval(function(){}, 1000) // keep alive :)