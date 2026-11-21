import { rms, voicingStrength } from './analysis';

export const MODEL_SAMPLE_RATE = 16_000;

const FRAME = Math.round(MODEL_SAMPLE_RATE * 0.02);
const VOICING_FRAME = Math.round(MODEL_SAMPLE_RATE * 0.04);
const PADDING = Math.round(MODEL_SAMPLE_RATE * 0.15);
const MIN_SPEECH = Math.round(MODEL_SAMPLE_RATE * 0.4);
const MIN_VOICED = Math.round(MODEL_SAMPLE_RATE * 0.1);
const MAX_SPEECH = MODEL_SAMPLE_RATE * 8;
const MIN_LEVEL = 0.008;
const NOISE_MARGIN = 3;
const PEAK_RATIO = 0.08;
const VOICED = 0.4;

export async function decodeToModelRate(data: ArrayBuffer): Promise<Float32Array<ArrayBuffer>> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(data);
    const length = Math.max(1, Math.ceil(decoded.duration * MODEL_SAMPLE_RATE));
    const offline = new OfflineAudioContext(1, length, MODEL_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  } finally {
    void context.close();
  }
}

function frameEnergies(samples: Float32Array): number[] {
  const frames = Math.floor(samples.length / FRAME);
  return Array.from({ length: frames }, (_, i) => rms(samples, i * FRAME, (i + 1) * FRAME));
}

export function speechThreshold(energies: number[]): number {
  const sorted = [...energies].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.2)] ?? 0;
  const loudest = sorted[sorted.length - 1] ?? 0;
  return Math.max(MIN_LEVEL, floor * NOISE_MARGIN, loudest * PEAK_RATIO);
}

export function voicedSamples(samples: Float32Array, threshold: number): number {
  let voiced = 0;
  for (let start = 0; start + VOICING_FRAME <= samples.length; start += VOICING_FRAME) {
    const end = start + VOICING_FRAME;
    if (rms(samples, start, end) < threshold) continue;
    if (voicingStrength(samples.subarray(start, end), MODEL_SAMPLE_RATE) >= VOICED) {
      voiced += VOICING_FRAME;
    }
  }
  return voiced;
}

export function trimToSpeech(samples: Float32Array<ArrayBuffer>): Float32Array<ArrayBuffer> | null {
  const energies = frameEnergies(samples);
  if (!energies.length) return null;

  const threshold = speechThreshold(energies);
  if (voicedSamples(samples, threshold) < MIN_VOICED) return null;

  const first = energies.findIndex((energy) => energy >= threshold);
  const last = energies.length - 1 - [...energies].reverse().findIndex((e) => e >= threshold);
  const start = Math.max(0, first * FRAME - PADDING);
  const end = Math.min(samples.length, (last + 1) * FRAME + PADDING, start + MAX_SPEECH);

  return end - start >= MIN_SPEECH ? samples.slice(start, end) : null;
}
