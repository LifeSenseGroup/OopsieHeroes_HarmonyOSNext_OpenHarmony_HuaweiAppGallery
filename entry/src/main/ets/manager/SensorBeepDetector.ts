/** Detects the Oopsie sensor's repeated 4 kHz beep used to signal a leak. */
export class SensorBeepDetector {
  private readonly sampleRate: number = 44100;
  private readonly frameSamples: number = 2048;
  private readonly firstBeepFrames: number = 22;
  private readonly secondBeepFrames: number = 22;
  private patternState: number = 0;
  private toneFrames: number = 0;
  private elapsedFrames: number = 0;
  private sawFirstSilence: boolean = false;

  public process(buffer: ArrayBuffer): boolean {
    const frameBytes = this.frameSamples * 2;
    if (buffer.byteLength < frameBytes) {
      return false;
    }

    const view = new DataView(buffer);
    for (let offset = 0; offset + frameBytes <= buffer.byteLength; offset += frameBytes) {
      if (this.advancePattern(this.hasFourKilohertzTone(view, offset))) {
        this.reset();
        return true;
      }
    }
    return false;
  }

  private hasFourKilohertzTone(view: DataView, byteOffset: number): boolean {
    const bins: number[] = [];
    const firstBin = Math.floor(3800 * this.frameSamples / this.sampleRate);
    const lastBin = Math.floor(4300 * this.frameSamples / this.sampleRate);
    for (let bin = firstBin; bin <= lastBin; bin++) {
      const omega = 2 * Math.PI * bin / this.frameSamples;
      const coefficient = 2 * Math.cos(omega);
      let previous = 0;
      let previousPrevious = 0;
      for (let sample = 0; sample < this.frameSamples; sample++) {
        const raw = view.getInt16(byteOffset + sample * 2, true);
        const window = 0.5 - 0.5 * Math.cos(2 * Math.PI * sample / (this.frameSamples - 1));
        const current = raw * window + coefficient * previous - previousPrevious;
        previousPrevious = previous;
        previous = current;
      }
      bins.push(previous * previous + previousPrevious * previousPrevious - coefficient * previous * previousPrevious);
    }

    const targetBin = Math.round(4000 * this.frameSamples / this.sampleRate) - firstBin;
    for (let center = Math.max(1, targetBin - 1); center <= Math.min(bins.length - 2, targetBin + 1); center++) {
      const peakEnergy = bins[center - 1] + bins[center] + bins[center + 1];
      let surroundingEnergy = 0;
      let surroundingBins = 0;
      for (let index = Math.max(0, center - 10); index <= Math.min(bins.length - 1, center + 10); index++) {
        if (index >= center - 1 && index <= center + 1) {
          continue;
        }
        surroundingEnergy += bins[index];
        surroundingBins++;
      }
      const localAverage = surroundingBins > 0 ? surroundingEnergy / surroundingBins : 0;
      if (localAverage > 0 && peakEnergy > localAverage * 3.6) {
        return true;
      }
    }
    return false;
  }

  private advancePattern(hasTone: boolean): boolean {
    this.elapsedFrames++;
    if (this.patternState === 0) {
      this.toneFrames = hasTone ? this.toneFrames + 1 : 0;
      if (this.toneFrames >= this.firstBeepFrames) {
        this.patternState = 1;
        this.elapsedFrames = 0;
        this.toneFrames = 0;
      }
      return false;
    }

    if (this.patternState === 1) {
      if (!hasTone) {
        this.sawFirstSilence = true;
        this.toneFrames = 0;
      } else if (this.sawFirstSilence) {
        this.toneFrames++;
        if (this.toneFrames >= this.secondBeepFrames) {
          this.patternState = 2;
          this.elapsedFrames = 0;
          this.toneFrames = 0;
        }
      }
      if (this.elapsedFrames > 120) {
        this.reset();
      }
      return false;
    }

    if (!hasTone) {
      return true;
    }
    if (this.elapsedFrames > 120) {
      this.reset();
    }
    return false;
  }

  private reset(): void {
    this.patternState = 0;
    this.toneFrames = 0;
    this.elapsedFrames = 0;
    this.sawFirstSilence = false;
  }
}
