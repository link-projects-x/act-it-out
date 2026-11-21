export type TModelStatus =
  | { phase: 'idle' }
  | { phase: 'loading'; progress: number }
  | { phase: 'ready' }
  | { phase: 'error'; message: string };
