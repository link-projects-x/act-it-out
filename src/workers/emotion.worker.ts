import { pipeline } from '@huggingface/transformers';

import { MODEL_DTYPE, MODEL_ID } from '@/constants/emotions';
import { toEmotionScores } from '@/lib/game/score';
import type { TWorkerRequest, TWorkerResponse } from '@/types/worker';

import type { ProgressInfo } from '@huggingface/transformers';

const downloads = new Map<string, { loaded: number; total: number }>();
let classifier: ReturnType<typeof loadClassifier> | null = null;

function post(message: TWorkerResponse) {
  self.postMessage(message);
}

function reportProgress(info: ProgressInfo) {
  if (info.status !== 'progress') return;
  downloads.set(info.file, { loaded: info.loaded, total: info.total });
  let loaded = 0;
  let total = 0;
  downloads.forEach((file) => {
    loaded += file.loaded;
    total += file.total;
  });
  post({ type: 'progress', loaded, total });
}

function loadClassifier() {
  return pipeline('audio-classification', MODEL_ID, {
    dtype: MODEL_DTYPE,
    device: 'wasm',
    progress_callback: reportProgress,
  });
}

self.addEventListener('message', async (event: MessageEvent<TWorkerRequest>) => {
  const request = event.data;
  try {
    classifier ??= loadClassifier();
    const classify = await classifier;
    if (request.type === 'load') {
      post({ type: 'ready' });
      return;
    }
    const output = await classify(request.audio, { top_k: 8 });
    post({ type: 'result', id: request.id, scores: toEmotionScores(output) });
  } catch (error) {
    classifier = null;
    post({
      type: 'error',
      id: request.type === 'classify' ? request.id : null,
      message: error instanceof Error ? error.message : 'The model failed to run.',
    });
  }
});
