import type { TEmotionScores } from './emotion';

export type TWorkerRequest =
  { type: 'load' } | { type: 'classify'; id: number; audio: Float32Array<ArrayBuffer> };

export type TWorkerResponse =
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'ready' }
  | { type: 'result'; id: number; scores: TEmotionScores }
  | { type: 'error'; id: number | null; message: string };
