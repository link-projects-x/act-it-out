export type TClip = { ok: true; audio: Float32Array<ArrayBuffer> } | { ok: false; message: string };

export type TRecorderStatus = 'idle' | 'requesting' | 'recording' | 'processing';

export type TRecorderPhase = 'ready' | 'recording' | 'judging';
