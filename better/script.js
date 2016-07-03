// bored of this reactpack bullshit
// just playing around here for now

var settings = {
  numChannels: 2,
  bottomFreq: 10,
  topFreq: 450,
  releaseTime: 0.5
}

var a = new AudioContext()

function createNoiseNode() {
  var bufferSize = 1000000 // is this too big?
  var node = a.createBufferSource()
  var buffer = a.createBuffer(1, bufferSize, a.sampleRate)
  var data = buffer.getChannelData(0)

  for (var i = 0; i < bufferSize; i++) {
    data[i] = 0.05 * Math.random()
  }

  node.buffer = buffer
  node.loop = true
  node.start()

  return node
}

var nodes = []
for (var i = 0; i < settings.numChannels; i ++) {
  nodes[i] = createNoiseNode()
  //nodes[i].connect(a.destination)
}
