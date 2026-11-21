import { useCallback, useEffect, useRef, useState } from 'react';

import { prepareClip } from '@/lib/audio/clip';
import type { TClip, TRecorderStatus } from '@/types/audio';

export function useRecorder(maxMs: number) {
  const [status, setStatus] = useState<TRecorderStatus>('idle');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const record = useCallback(async (): Promise<TClip> => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return { ok: false, message: 'This browser can’t record audio. Upload a clip instead.' };
    }

    setStatus('requesting');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
    } catch {
      setStatus('idle');
      return {
        ok: false,
        message: 'Microphone access is blocked. Allow it in the address bar or upload a clip.',
      };
    }

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    context.createMediaStreamSource(stream).connect(analyser);
    analyserRef.current = analyser;

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) chunks.push(event.data);
    });
    const stopped = new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
    });
    recorderRef.current = recorder;
    recorder.start();
    setStatus('recording');

    const timer = window.setTimeout(stop, maxMs);
    await stopped;
    window.clearTimeout(timer);
    stream.getTracks().forEach((track) => track.stop());
    analyserRef.current = null;
    recorderRef.current = null;
    void context.close();

    setStatus('processing');
    const blob = new Blob(chunks, { type: recorder.mimeType });
    const clip = await prepareClip(await blob.arrayBuffer());
    setStatus('idle');
    return clip;
  }, [maxMs, stop]);

  useEffect(() => stop, [stop]);

  return { status, analyserRef, record, stop };
}
