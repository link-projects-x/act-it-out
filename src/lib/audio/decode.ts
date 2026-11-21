import { rms } from './analysis';

export const MODEL_SAMPLE_RATE = 16_000;

const FRAME = Math.round(MODEL_SAMPLE_RATE * 0.02);
const PADDING = Math.round(MODEL_SAMPLE_RATE * 0.15);
const MIN_SPEECH = Math.round(MODEL_SAMPLE_RATE * 0.4);
const MAX_SPEECH = MODEL_SAMPLE_RATE * 8;

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

export function trimToSpeech(samples: Float32Array<ArrayBuffer>): Float32Array<ArrayBuffer> | null {
  const frames = Math.floor(samples.length / FRAME);
  const energies = Array.from({ length: frames }, (_, i) =>
    rms(samples, i * FRAME, (i + 1) * FRAME)
  );
  const loudest = Math.max(0, ...energies);
  if (loudest < 0.01) return null;

  const threshold = Math.max(0.006, loudest * 0.08);
  const first = energies.findIndex((energy) => energy >= threshold);
  const last = energies.length - 1 - [...energies].reverse().findIndex((e) => e >= threshold);
  const start = Math.max(0, first * FRAME - PADDING);
  const end = Math.min(samples.length, (last + 1) * FRAME + PADDING, start + MAX_SPEECH);

  return end - start >= MIN_SPEECH ? samples.slice(start, end) : null;
}
