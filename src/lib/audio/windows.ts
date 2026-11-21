import { MODEL_SAMPLE_RATE } from './decode';

export function splitWindows(
  samples: Float32Array<ArrayBuffer>,
  windowSeconds: number,
  hopSeconds: number
): Float32Array<ArrayBuffer>[] {
  const size = Math.round(windowSeconds * MODEL_SAMPLE_RATE);
  const hop = Math.round(hopSeconds * MODEL_SAMPLE_RATE);
  const windows: Float32Array<ArrayBuffer>[] = [];
  for (let start = 0; start + size <= samples.length; start += hop) {
    windows.push(samples.slice(start, start + size));
  }
  return windows;
}
