// bored of this reactpack bullshit
// just playing around here for now

var settings = {
  numChannels: 5,
  bottomFreq: 2000,
  topFreq: 100,
  releaseTime: 0.5
}

var a = new AudioContext()

function createNoiseNode(freq) {

  var bufferSize = 1000000 // is this too big?
  var node = a.createBufferSource()
  var buffer = a.createBuffer(1, bufferSize, a.sampleRate)
  var data = buffer.getChannelData(0)

  for (var i = 0; i < bufferSize; i++) {
    data[i] = Math.random()
  }

  node.buffer = buffer
  node.loop = true
  node.start()

  var filter = a.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.value = freq
  node.connect(filter)

  var gain = a.createGain()
  gain.gain.value = Math.min(1, 1/(freq/100)) / settings.numChannels

  filter.connect(gain)

  return gain
}

var nodes = []
for (var i = 0; i < settings.numChannels; i ++) {
  nodes[i] = createNoiseNode(settings.bottomFreq + i * (settings.topFreq - settings.bottomFreq) / (settings.numChannels - 1))
  nodes[i].connect(a.destination)
}
