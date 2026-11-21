import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { pipeline } from '@huggingface/transformers';

const MODELS = [
  { id: 'onnx-community/wav2vec2-base-Speech_Emotion_Recognition-ONNX', dtype: 'q8' },
  { id: 'onnx-community/Speech-Emotion-Classification-ONNX', dtype: 'q8' },
  { id: 'onnx-community/wav2vec2-emotion-recognition-ONNX', dtype: 'q4' },
];
const CANON = {
  ang: 'angry',
  angry: 'angry',
  dis: 'disgust',
  disgust: 'disgust',
  fea: 'fear',
  fear: 'fear',
  fearful: 'fear',
  hap: 'happy',
  happy: 'happy',
  neu: 'neutral',
  neutral: 'neutral',
  cal: 'neutral',
  calm: 'neutral',
  sad: 'sad',
  sur: 'surprise',
  surprised: 'surprise',
};
const canon = (label) => CANON[label.toLowerCase()] ?? label.toLowerCase();

function readWav(path) {
  const buf = readFileSync(path);
  let pos = 12;
  let rate = 0;
  while (pos < buf.length) {
    const id = buf.toString('ascii', pos, pos + 4);
    const size = buf.readUInt32LE(pos + 4);
    if (id === 'fmt ') rate = buf.readUInt32LE(pos + 12);
    if (id === 'data') {
      const samples = new Float32Array(size / 2);
      for (let i = 0; i < samples.length; i++)
        samples[i] = buf.readInt16LE(pos + 8 + i * 2) / 32768;
      if (rate !== 16000) throw new Error(`${path}: ${rate} Hz, expected 16000`);
      return samples;
    }
    pos += 8 + size + (size % 2);
  }
  throw new Error(`${path}: no data chunk`);
}

const dir = process.argv[2];
const clips = readdirSync(dir)
  .filter((f) => f.endsWith('.wav'))
  .sort()
  .map((f) => ({ file: f, truth: canon(f.split('_')[2]), audio: readWav(join(dir, f)) }));

for (const model of MODELS) {
  const classify = await pipeline('audio-classification', model.id, { dtype: model.dtype });
  let hits = 0;
  const started = performance.now();
  const misses = [];
  for (const clip of clips) {
    const [top] = await classify(clip.audio, { top_k: 1 });
    const guess = canon(top.label);
    if (guess === clip.truth) hits += 1;
    else misses.push(`${clip.truth}->${guess}`);
  }
  const ms = (performance.now() - started) / clips.length;
  console.log(
    `${model.id} [${model.dtype}]: ${hits}/${clips.length} right, ${ms.toFixed(0)} ms/clip`
  );
  console.log(`  misses: ${misses.join(' ')}`);
}
