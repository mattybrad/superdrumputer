var hits = []

function generateHits () {
    var totalHits = 1000
    for(var i = 0; i < totalHits; i++) {
        hits.push(generateRandomHit)
    }
}

function generateRandomHit() {
    return {
        t: 4 * Math.random(),
        f: Math.random(),
        v: Math.random()
    }
}

function scheduleHit(h) {
    
}
