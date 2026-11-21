const SILENCE_RMS = 0.01;

export function rms(samples: Float32Array, start = 0, end = samples.length): number {
  let sum = 0;
  for (let i = start; i < end; i += 1) sum += samples[i] * samples[i];
  return end > start ? Math.sqrt(sum / (end - start)) : 0;
}

export function toDecibels(value: number): number {
  return value > 0 ? Math.max(-100, 20 * Math.log10(value)) : -100;
}

export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  minHz = 70,
  maxHz = 450
): number | null {
  if (rms(samples) < SILENCE_RMS) return null;

  const minLag = Math.floor(sampleRate / maxHz);
  const maxLag = Math.min(Math.floor(sampleRate / minHz), samples.length - 1);
  const correlations = new Float32Array(maxLag + 1);
  let best = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    let energyA = 0;
    let energyB = 0;
    for (let i = 0; i + lag < samples.length; i += 1) {
      sum += samples[i] * samples[i + lag];
      energyA += samples[i] * samples[i];
      energyB += samples[i + lag] * samples[i + lag];
    }
    const value = sum / (Math.sqrt(energyA * energyB) || 1);
    correlations[lag] = value;
    if (value > best) best = value;
  }

  if (best < 0.8) return null;

  for (let lag = minLag + 1; lag < maxLag; lag += 1) {
    const value = correlations[lag];
    const isPeak = value >= correlations[lag - 1] && value >= correlations[lag + 1];
    if (isPeak && value >= best * 0.95) return sampleRate / lag;
  }

  return null;
}
