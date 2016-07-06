// bored of this reactpack bullshit
// just playing around here for now

var settings = {
  numChannels: 3,
  bottomFreq: 50,
  topFreq: 500,
  releaseTime: 0.5
}

var a = new AudioContext()
var bufferSize = 1000000 // tweak this?
var noiseBuffer = a.createBuffer(1, bufferSize, a.sampleRate)
var noiseData = noiseBuffer.getChannelData(0)
for (var i = 0; i < bufferSize; i++) {
  noiseData[i] = Math.random()
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

  var gain1 = a.createGain()
  gain1.gain.value = Math.min(1, 1/(freq/100))

  var gain2 = a.createGain()
  gain2.gain.value = 0
  gain2.gain.setValueAtTime(0, 0)

  filter.connect(gain1)
  gain1.connect(gain2)

  return {
    input: filter,
    output: gain2
  }
}

// canvas stuff. crikey this is getting messy

var cvs = document.getElementById('beatCanvas')
var ctx = cvs.getContext('2d')
ctx.fillStyle = 0x000000
ctx.fillRect(0, 0, cvs.width, cvs.height)
var mousePos = {x:0,y:0}
var mouseIsDown = false
cvs.addEventListener("mousedown", function(ev) {
  mouseIsDown = true
})
cvs.addEventListener("mouseup", function(ev) {
  mouseIsDown = false
})
cvs.addEventListener("mousemove", function(ev) {
  mousePos.x = ev.pageX - cvs.offsetLeft
  mousePos.y = ev.pageY - cvs.offsetTop
})
setInterval(function() {
  if(mouseIsDown) {
    var radius = 30
    var x = mousePos.x + 10 * (1 - 2*Math.random())
    var y = mousePos.y + 10 * (1 - 2*Math.random())
    var grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
    grad.addColorStop(0, "rgba(255,255,255,0.04)")
    grad.addColorStop(0.05, "rgba(255,255,255,0.02)")
    grad.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
  }
}, 5)

var scheduledTo = 0
var schedulePeriod = 1
var timeoutPeriod = 0.5
var notesPerSecond = 50
var noteLength = 0.1
var barPos = 0
var barLength = 2
var lastAudioTime = 0
function scheduleNotes() {
  barPos += (a.currentTime - lastAudioTime) / barLength
  barPos = barPos % 1
  var thisSchedulePeriod = schedulePeriod - (scheduledTo - a.currentTime)
  var totalNotes = notesPerSecond * thisSchedulePeriod
  for(var i = 0; i < totalNotes; i++) {
    scheduleNote(scheduledTo + Math.random() * thisSchedulePeriod, noteLength, Math.floor(Math.random() * settings.numChannels))
  }
  scheduleRamps(barPos, barPos + thisSchedulePeriod / barLength)
  scheduledTo = a.currentTime + schedulePeriod
  lastAudioTime = a.currentTime
  setTimeout(scheduleNotes, timeoutPeriod * 1000)
}

function scheduleNote(t, l, channel) {
  var node = a.createBufferSource()
  node.buffer = noiseBuffer

  var gain = a.createGain()
  gain.gain.value = 0
  gain.gain.setValueAtTime(1, t)
  //gain.gain.linearRampToValueAtTime(0.00001, t + l)
  gain.gain.setValueAtTime(0, t+0.05)

  node.connect(gain)
  gain.connect(channels[channel].input)

  node.start(t, Math.random() * 5)
}

function scheduleRamps(startPoint, endPoint) {
  var p
  var t
  for(var i = 0; i < channels.length; i ++) {
    p = getRampPointsFromCanvas(i, startPoint, endPoint)
    for(var j = 0; j < p.length; j ++) {
      t = (p[j].pos + (p[j].pos < barPos ? 1 : 0)) * barLength + a.currentTime
      channels[i].output.gain.linearRampToValueAtTime(Math.round(p[j].vol), t)
      //if(i == 0) console.log(t, p[j].vol)
    }
  }
}

scheduleNotes()

function getBandCurvesFromCanvas() {
  var y
  var blockWidth = 10
  var blockHeight
  var imgData
  var channelArrays = []
  var thisIntensity
  for(var i = 0; i < settings.numChannels; i ++) {
    channelArrays[i] = []
    y = Math.floor(i * cvs.height / settings.numChannels)
    blockHeight = Math.floor(cvs.height / settings.numChannels)
    for(var j = 0; j < cvs.width; j += blockWidth) {
      imgData = ctx.getImageData(j, y, blockWidth, blockHeight)
      thisIntensity = 0
      for(var k = 0; k < imgData.data.length; k+=4) {
        thisIntensity += imgData.data[k]
      }
      thisIntensity /= 255 * imgData.data.length / 4
      channelArrays[i][j] = thisIntensity
    }
  }
  return channelArrays
}

function getRampPointsFromCanvas(channel, startPoint, endPoint) {
  var blockWidth = 10
  var blockHeight = Math.floor(cvs.height / settings.numChannels)
  var y = Math.floor(channel * cvs.height / settings.numChannels)
  var imgData
  var thisIntensity
  var points = []
  var startX = blockWidth * Math.ceil(startPoint * cvs.width / blockWidth)
  var endX = blockWidth * Math.floor(endPoint * cvs.width / blockWidth)
  for(var i = startX; i <= endX && i < cvs.width; i += blockWidth) {
    imgData = ctx.getImageData(i, y, blockWidth, blockHeight)
    thisIntensity = 0
    for(var k = 0; k < imgData.data.length; k+=4) {
      thisIntensity += imgData.data[k]
    }
    thisIntensity /= 255 * imgData.data.length / 4
    points.push({
      pos: i / cvs.width,
      vol: thisIntensity
    })
  }
  return points
}
