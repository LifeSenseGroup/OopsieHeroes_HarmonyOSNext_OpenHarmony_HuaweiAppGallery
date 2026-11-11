/**
 * Case 9 fallback. T is the bisected mixture time in minutes after sleep.
 * The estimator does not round and does not subtract the 15-minute whisper lead.
 */
export function estimateCase9Delay(delays: number[], dayNumbers: number[]): number | null {
  if (delays.length < 3 || delays.length !== dayNumbers.length) {
    return null;
  }
  const medianDelay = medianOf(delays);
  const deviations: number[] = [];
  for (let i = 0; i < delays.length; i++) {
    deviations.push(Math.abs(delays[i] - medianDelay));
  }
  const mad = medianOf(deviations);
  const scale = Math.max(15, mad);
  let newestDay = dayNumbers[0];
  for (let i = 1; i < dayNumbers.length; i++) {
    if (dayNumbers[i] > newestDay) {
      newestDay = dayNumbers[i];
    }
  }

  const rawWeights: number[] = [];
  let weightSum = 0;
  for (let i = 0; i < delays.length; i++) {
    const age = newestDay - dayNumbers[i];
    const u = Math.exp(Math.max(-700, -Math.log(2) * age / 7));
    const distance = (delays[i] - medianDelay) / (2 * scale);
    const r = 0.5 + 0.5 / (1 + distance * distance);
    const weight = u * r;
    rawWeights.push(weight);
    weightSum += weight;
  }
  if (!(weightSum > 0)) {
    return null;
  }

  const weights: number[] = [];
  let mu = 0;
  for (let i = 0; i < delays.length; i++) {
    const p = rawWeights[i] / weightSum;
    weights.push(p);
    mu += p * delays[i];
  }
  let variance = 0;
  for (let i = 0; i < delays.length; i++) {
    const delta = delays[i] - mu;
    variance += weights[i] * delta * delta;
  }
  const sd = Math.sqrt(variance);
  const dRatio = sd + mu > 0 ? sd / (sd + mu) : 0;
  const h = Math.max(0.01, Math.min(45, Math.max(5, 0.25 * sd), mu / 3));
  const q = 0.5 - 0.25 * dRatio;

  let hi = delays[0];
  for (let i = 1; i < delays.length; i++) {
    if (delays[i] > hi) {
      hi = delays[i];
    }
  }
  hi = hi + 12 * h;

  const logistic = (x: number): number => {
    const clipped = Math.max(-40, Math.min(40, -x));
    return 1 / (1 + Math.exp(clipped));
  };
  const mixture = (t: number): number => {
    let total = 0;
    for (let i = 0; i < delays.length; i++) {
      const leakAt = delays[i];
      const base = logistic(-leakAt / h);
      const denom = 1 - base;
      const grown = denom !== 0 ? (logistic((t - leakAt) / h) - base) / denom : 0;
      total += weights[i] * grown;
    }
    return total;
  };

  let lo = 0;
  let upper = hi;
  for (let step = 0; step < 36; step++) {
    const mid = (lo + upper) / 2;
    if (mixture(mid) < q) {
      lo = mid;
    } else {
      upper = mid;
    }
  }
  return (lo + upper) / 2;
}

function medianOf(values: number[]): number {
  const sorted: number[] = [];
  for (let i = 0; i < values.length; i++) {
    sorted.push(values[i]);
  }
  sorted.sort((a: number, b: number) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}
