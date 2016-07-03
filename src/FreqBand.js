export class FreqBand {
  constructor(f) {
    this.f = f
    this.nodes = [
      {
        t: 0,
        v: 1
      },
      {
        t: 1,
        v: 0
      }
    ]
  }
}
