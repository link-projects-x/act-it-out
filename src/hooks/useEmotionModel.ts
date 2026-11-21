import { useCallback, useEffect, useRef, useState } from 'react';

import type { TEmotionScores } from '@/types/emotion';
import type { TModelStatus } from '@/types/model';
import type { TWorkerRequest, TWorkerResponse } from '@/types/worker';

type TPending = {
  resolve: (scores: TEmotionScores) => void;
  reject: (error: Error) => void;
};

export function useEmotionModel() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, TPending>());
  const nextIdRef = useRef(1);
  const [status, setStatus] = useState<TModelStatus>({ phase: 'idle' });

  const settle = useCallback((id: number, outcome: TEmotionScores | Error) => {
    const pending = pendingRef.current.get(id);
    pendingRef.current.delete(id);
    if (!pending) return;
    if (outcome instanceof Error) pending.reject(outcome);
    else pending.resolve(outcome);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent<TWorkerResponse>) => {
      const message = event.data;
      switch (message.type) {
        case 'progress':
          setStatus({
            phase: 'loading',
            progress: message.total ? message.loaded / message.total : 0,
          });
          break;
        case 'ready':
          setStatus({ phase: 'ready' });
          break;
        case 'result':
          setStatus({ phase: 'ready' });
          settle(message.id, message.scores);
          break;
        case 'error':
          setStatus({ phase: 'error', message: message.message });
          if (message.id !== null) settle(message.id, new Error(message.message));
          break;
      }
    },
    [settle]
  );

  const send = useCallback(
    (request: TWorkerRequest, transfer: Transferable[] = []) => {
      if (!workerRef.current) {
        const worker = new Worker(new URL('../workers/emotion.worker.ts', import.meta.url), {
          type: 'module',
        });
        worker.addEventListener('message', handleMessage);
        workerRef.current = worker;
      }
      workerRef.current.postMessage(request, transfer);
    },
    [handleMessage]
  );

  const load = useCallback(() => {
    setStatus((current) =>
      current.phase === 'ready' ? current : { phase: 'loading', progress: 0 }
    );
    send({ type: 'load' });
  }, [send]);

  const classify = useCallback(
    (audio: Float32Array<ArrayBuffer>) =>
      new Promise<TEmotionScores>((resolve, reject) => {
        const id = nextIdRef.current;
        nextIdRef.current += 1;
        pendingRef.current.set(id, { resolve, reject });
        send({ type: 'classify', id, audio }, [audio.buffer]);
      }),
    [send]
  );

  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      pending.forEach(({ reject }) => reject(new Error('The page was closed.')));
      pending.clear();
    };
  }, []);

  return { status, load, classify };
}
