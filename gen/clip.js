module.exports = Clip

function Clip(gain, post, sources){
  return {
    node: 'clip',
    gain: gain,
    post: post,
    sources: Array.isArray(sources) ? sources : [sources]
  }
}