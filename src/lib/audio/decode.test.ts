import { describe, expect, it } from 'vitest';

import { MODEL_SAMPLE_RATE, trimToSpeech } from './decode';

const seconds = (value: number) => Math.round(value * MODEL_SAMPLE_RATE);

function random(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296 - 0.5;
  };
}

function whiteNoise(length: number, amplitude: number, seed = 1) {
  const next = random(seed);
  return Float32Array.from({ length }, () => next() * 2 * amplitude);
}

function brownNoise(length: number, amplitude: number) {
  const next = random(7);
  let value = 0;
  return Float32Array.from({ length }, () => {
    value = Math.max(-amplitude, Math.min(amplitude, value + next() * amplitude * 0.1));
    return value;
  });
}

function voicedTake(lead: number, voiced: number, tail: number) {
  const samples = whiteNoise(seconds(lead + voiced + tail), 0.002);
  const start = seconds(lead);
  for (let i = 0; i < seconds(voiced); i += 1) {
    const t = i / MODEL_SAMPLE_RATE;
    const tone = Math.sin(2 * Math.PI * 150 * t) + 0.5 * Math.sin(2 * Math.PI * 300 * t);
    samples[start + i] += 0.2 * tone;
  }
  return samples;
}

describe('trimToSpeech', () => {
  it('rejects silence', () => {
    expect(trimToSpeech(new Float32Array(seconds(3)))).toBeNull();
  });

  it('rejects steady room noise', () => {
    expect(trimToSpeech(whiteNoise(seconds(3), 0.03))).toBeNull();
  });

  it('rejects low rumble', () => {
    expect(trimToSpeech(brownNoise(seconds(3), 0.08))).toBeNull();
  });

  it('keeps a voiced take and trims the silence around it', () => {
    const trimmed = trimToSpeech(voicedTake(1, 0.8, 1));
    expect(trimmed?.length).toBeGreaterThan(seconds(0.8));
    expect(trimmed?.length).toBeLessThan(seconds(1.3));
  });

  it('rejects a voiced blip that is too short to judge', () => {
    expect(trimToSpeech(voicedTake(1, 0.05, 1))).toBeNull();
  });
});
