import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { pipeline } from '@huggingface/transformers';

const SAMPLE_RATE = 16000;
const WINDOW = 1.5 * SAMPLE_RATE;
const HOP = 0.5 * SAMPLE_RATE;
const MODELS = [
  { id: 'onnx-community/Speech-Emotion-Classification-ONNX', dtype: 'q8' },
  { id: 'onnx-community/wav2vec2-base-Speech_Emotion_Recognition-ONNX', dtype: 'q8' },
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
      if (rate !== SAMPLE_RATE) throw new Error(`${path}: ${rate} Hz, expected ${SAMPLE_RATE}`);
      const samples = new Float32Array(size / 2);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = buf.readInt16LE(pos + 8 + i * 2) / 32768;
      }
      return samples;
    }
    pos += 8 + size + (size % 2);
  }
  throw new Error(`${path}: no data chunk`);
}

function windows(audio) {
  const out = [];
  for (let start = 0; start + WINDOW <= audio.length; start += HOP) {
    out.push(audio.slice(start, start + WINDOW));
  }
  return out;
}

async function scores(classify, audio) {
  const totals = {};
  for (const { label, score } of await classify(audio, { top_k: null })) {
    totals[canon(label)] = (totals[canon(label)] ?? 0) + score;
  }
  return totals;
}

function top(totals) {
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
}

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: npm run eval:models -- <folder of CREMA-D style WAV clips>');
  process.exit(1);
}
const clips = readdirSync(dir)
  .filter((file) => file.endsWith('.wav'))
  .sort()
  .map((file) => ({ truth: canon(file.split('_')[2]), audio: readWav(join(dir, file)) }));

for (const model of MODELS) {
  let classify;
  try {
    classify = await pipeline('audio-classification', model.id, { dtype: model.dtype });
  } catch (error) {
    console.log(`${model.id}: failed to load (${error.message.split('\n')[0]})`);
    continue;
  }
  let full = 0;
  let windowed = 0;
  const started = performance.now();
  for (const clip of clips) {
    const whole = await scores(classify, clip.audio);
    const parts = [whole];
    for (const part of windows(clip.audio)) parts.push(await scores(classify, part));
    const averaged = {};
    for (const part of parts) {
      for (const [emotion, value] of Object.entries(part)) {
        averaged[emotion] = (averaged[emotion] ?? 0) + value / parts.length;
      }
    }
    if (top(whole) === clip.truth) full += 1;
    if (top(averaged) === clip.truth) windowed += 1;
  }
  const seconds = (performance.now() - started) / 1000 / clips.length;
  const percent = (hits) => `${hits}/${clips.length} (${Math.round((100 * hits) / clips.length)}%)`;
  console.log(
    `${model.id} [${model.dtype}]: full clip ${percent(full)}, with windows ${percent(windowed)}, ${seconds.toFixed(2)} s/clip`
  );
}
