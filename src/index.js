import React, { Component } from 'react'
import { render } from 'react-dom'
import { generateHits } from './HitMaker'
import { FreqBand } from './FreqBand'

var actx

class Example extends Component {
  componentDidMount() {
    actx = new AudioContext()
    var hits = generateHits()
    var bands = []
    for (var i = 0; i < 5; i ++) {
      bands.push(new FreqBand())
    }
    for (var i = 0; i < hits.length; i ++) {
      this.scheduleHit(hits[i])
    }
  }
  scheduleHit(h) {
    var l = 0.2
    var oscillator = actx.createOscillator();
    oscillator.frequency.value = 50 + 1000 * h.f
    var gain = actx.createGain()
    oscillator.connect(gain)
    gain.connect(actx.destination)
    var now = actx.currentTime
    gain.gain.setValueAtTime(0.02 * h.v, now + h.t)
    gain.gain.exponentialRampToValueAtTime(0.001, now + h.t + l)
    oscillator.start(now + h.t)
    oscillator.stop(now + h.t + l)
  }
  render () {
    return <h1>This is not yet a drum machine</h1>
  }
}

render(<Example />, document.getElementById('react-app'))
