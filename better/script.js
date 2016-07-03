// bored of this reactpack bullshit
// just playing around here for now

var settings = {
  numChannels: 5,
  bottomFreq: 500,
  topFreq: 600,
  releaseTime: 0.5
}

var a = new AudioContext()
var bufferSize = 1000 // tweak this?
var noiseBuffer = a.createBuffer(1, bufferSize, a.sampleRate)
var noiseData = noiseBuffer.getChannelData(0)
for (var i = 0; i < bufferSize; i++) {
  noiseData[i] = Math.random()
}

function createNoiseNode(freq) {

  var bufferSize = 10000 // is this too big?
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
  gain.gain.value = 0
  //gain.gain.value = Math.min(1, 1/(freq/100)) / settings.numChannels

  //gain.gain.setValueAtTime(gain.gain.value, a.currentTime + 2)
  //gain.gain.exponentialRampToValueAtTime(0.00001, a.currentTime + 5)

  filter.connect(gain)

  return gain
}

var nodes = []
for (var i = 0; i < settings.numChannels; i ++) {
  nodes[i] = createNoiseNode(settings.bottomFreq + i * (settings.topFreq - settings.bottomFreq) / (settings.numChannels - 1))
  nodes[i].connect(a.destination)
}

var scheduledTo = 0
var schedulePeriod = 10
var timeoutPeriod = 1
var notesPerSecond = 10
function scheduleNotes() {
  var thisSchedulePeriod = schedulePeriod - (scheduledTo - a.currentTime)
  console.log(thisSchedulePeriod)
  var totalNotes = notesPerSecond * thisSchedulePeriod
  for(var i = 0; i < totalNotes; i++) {
    scheduleNote(scheduledTo + Math.random() * thisSchedulePeriod)
  }
  scheduledTo = a.currentTime + schedulePeriod
}

function scheduleNote(t) {
  console.log(t)
  var node = a.createBufferSource()
  node.buffer = noiseBuffer
  node.connect(a.destination)
  node.start(t)
}

scheduleNotes()
