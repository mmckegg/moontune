var AudioNodeArray = require('../lib/audio-node-array')
var ObservStruct = require('observ-struct')
var Observ = require('observ')

var Speaker = require('speaker');
var Readable = require('stream').Readable
var now = require("performance-now")

module.exports = SpeakerNode

function SpeakerNode(context){
  var obs = ObservStruct({
    sources: AudioNodeArray(context),
    tempo: Observ()
  })

  var speaker = new Speaker({
    channels: 1,
    bitDepth: 32,
    float: true,
    sampleRate: context.sampleRate || 44100,
    samplesPerFrame: 256
  })

  var lastSchedule = 0
  var position = 0

  var queue = []
  var stream = new Readable()
  stream._read = function(r){
    r = speaker.samplesPerFrame
    stream.push(queue.shift() || silence(r))

    process.nextTick(next)
  }

  function next(){
    var tempo = obs.tempo() || 120
    var r = speaker.samplesPerFrame
    var duration = r / speaker.sampleRate
    var beatDuration =  tempo / 60

    var schedule = {
      length: r,
      duration: duration,
      time: lastSchedule,

      // fake beat clock (60bpm for now)
      from: position,
      to: position + duration * beatDuration,
      beatDuration: beatDuration
    }

    //console.log(position)

    position += duration * beatDuration
    lastSchedule += duration
    queue.push(normalize(obs.sources.readSamples(schedule)))
  }

  for (var i=0;i<2;i++){
    next()
  }

  stream.pipe(speaker)

  obs.destroy = function(){
    speaker.close()
  }

  return obs
}

function normalize(buffer){
  if (buffer instanceof Float32Array){
    return new Buffer(new Uint8Array(buffer.buffer))
  } else {
    return buffer
  }
}

function silence(length){
  var buffer = new Buffer(length*4)
  for (var i=0;i<buffer.length;i++){
    buffer[i] = 0
  }
  return buffer
}