// bored of this reactpack bullshit
// just playing around here for now

var settings = {
  numChannels: 5,
  bottomFreq: 100,
  topFreq: 800,
  releaseTime: 0.5
}

var a = new AudioContext()
var bufferSize = 100000 // tweak this?
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

var channels = []
for (var i = 0; i < settings.numChannels; i ++) {
  channels[i] = createChannel(settings.bottomFreq + i * (settings.topFreq - settings.bottomFreq) / (settings.numChannels - 1))
  channels[i].output.connect(a.destination)
}

function createChannel(freq) {
  var filter = a.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.value = freq

  var gain = a.createGain()
  gain.gain.value = 0
  gain.gain.value = Math.min(1, 1/(freq/100)) / settings.numChannels

  filter.connect(gain)

  return {
    input: filter,
    output: gain
  }
}

var scheduledTo = 0
var schedulePeriod = 1
var timeoutPeriod = 0.5
var notesPerSecond = 20
function scheduleNotes() {
  var thisSchedulePeriod = schedulePeriod - (scheduledTo - a.currentTime)
  var totalNotes = notesPerSecond * thisSchedulePeriod
  for(var i = 0; i < totalNotes; i++) {
    scheduleNote(scheduledTo + Math.random() * thisSchedulePeriod, Math.floor(Math.random() * settings.numChannels))
  }
  scheduledTo = a.currentTime + schedulePeriod
  setTimeout(scheduleNotes, timeoutPeriod * 1000)
}

function scheduleNote(t, channel) {
  console.log(t)
  var node = a.createBufferSource()
  node.buffer = noiseBuffer

  var gain = a.createGain()
  gain.gain.value = 0
  gain.gain.setValueAtTime(Math.random(), t)
  gain.gain.exponentialRampToValueAtTime(0.00001, t + 5)

  node.connect(gain)
  gain.connect(channels[channel].input)

  node.start(t)
}

scheduleNotes()
