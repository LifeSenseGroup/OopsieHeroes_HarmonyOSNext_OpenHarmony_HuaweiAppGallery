/** Detects the Oopsie sensor's repeated 4 kHz beep used to signal a leak. */
export class SensorBeepDetector {
  private readonly sampleRate: number = 44100;
  private readonly frameSamples: number = 2048;
  // Android analyzes a 2048-sample window every 1024 samples. Keep the same
  // overlap so a tone boundary is not skipped when it falls between windows.
  private readonly hopSamples: number = 1024;
  // The overlapped frames advance by 1024 samples, so one second is ~44 frames.
  private readonly firstBeepFrames: number = Math.ceil(44100 / 1024);
  private readonly secondBeepFrames: number = Math.ceil(44100 / 1024);
  private readonly firstBin: number = Math.floor(3800 * 2048 / 44100);
  private readonly lastBin: number = Math.floor(4300 * 2048 / 44100);
  private readonly coefficients: number[] = [];
  private readonly window: number[] = [];
  private pending: Uint8Array = new Uint8Array(0);
  private patternState: number = 0;
  private toneFrames: number = 0;
  private elapsedFrames: number = 0;
  private sawFirstSilence: boolean = false;

  constructor() {
    for (let bin = this.firstBin; bin <= this.lastBin; bin++) {
      this.coefficients.push(2 * Math.cos(2 * Math.PI * bin / this.frameSamples));
    }
    for (let sample = 0; sample < this.frameSamples; sample++) {
      this.window.push(0.5 - 0.5 * Math.cos(2 * Math.PI * sample / (this.frameSamples - 1)));
    }
  }

  public process(buffer: ArrayBuffer): boolean {
    const frameBytes = this.frameSamples * 2;
    const hopBytes = this.hopSamples * 2;
    const chunk = new Uint8Array(buffer);
    const combined = new Uint8Array(this.pending.length + chunk.length);
    combined.set(this.pending);
    combined.set(chunk, this.pending.length);
    const view = new DataView(combined.buffer);
    let offset = 0;
    while (offset + frameBytes <= combined.length) {
      if (this.advancePattern(this.hasFourKilohertzTone(view, offset))) {
        this.reset();
        this.pending = new Uint8Array(0);
        return true;
      }
      offset += hopBytes;
    }
    // Keep the overlap tail and any short final read for the next call.
    this.pending = combined.slice(offset);
    return false;
  }

  private hasFourKilohertzTone(view: DataView, byteOffset: number): boolean {
    const bins: number[] = [];
    for (let index = 0; index < this.coefficients.length; index++) {
      const coefficient = this.coefficients[index];
      let previous = 0;
      let previousPrevious = 0;
      for (let sample = 0; sample < this.frameSamples; sample++) {
        const raw = view.getInt16(byteOffset + sample * 2, true);
        const current = raw * this.window[sample] + coefficient * previous - previousPrevious;
        previousPrevious = previous;
        previous = current;
      }
      bins.push(previous * previous + previousPrevious * previousPrevious - coefficient * previous * previousPrevious);
    }

    // Match Android's bin4khz calculation (floor(4096 / binWidth)). The
    // sensor's nominal "4 kHz" tone is analyzed around 4096 Hz there.
    const targetBin = Math.floor(4096 * this.frameSamples / this.sampleRate) - this.firstBin;
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
      if (this.elapsedFrames > Math.ceil(4 * this.sampleRate / this.hopSamples)) {
        this.reset();
      }
      return false;
    }

    if (!hasTone) {
      return true;
    }
    if (this.elapsedFrames > Math.ceil(5 * this.sampleRate / this.hopSamples)) {
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
