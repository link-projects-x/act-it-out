'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { cx } from '@/components/ui';
import { detectPitch, rms, toDecibels } from '@/lib/audio/analysis';
import { formatClock } from '@/lib/game/format';
import type { TRecorderPhase } from '@/types/audio';

import styles from './RecorderPanel.module.scss';

type TRecorderPanelProps = {
  analyserRef: RefObject<AnalyserNode | null>;
  phase: TRecorderPhase;
  maxMs: number;
};

const BARS = 48;
const GAIN = 2.5;
const STATUS: Record<TRecorderPhase, string> = {
  ready: 'Mic ready',
  recording: 'Rec',
  judging: 'Judging the take',
};

export function RecorderPanel({ analyserRef, phase, maxMs }: TRecorderPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const loudnessRef = useRef<HTMLElement>(null);
  const pitchRef = useRef<HTMLElement>(null);
  const levelsRef = useRef<number[]>([]);
  const filledRef = useRef(0);
  const limit = formatClock(maxMs / 1000);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const css = getComputedStyle(canvas);
    const color = (name: string) => css.getPropertyValue(name).trim();

    const paint = (filledColor: string, emptyColor: string) => {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const gap = 4 * ratio;
      const barWidth = Math.max(1, (width - gap * (BARS - 1)) / BARS);
      const minHeight = 6 * ratio;
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < BARS; i += 1) {
        const filled = i < filledRef.current;
        const level = filled ? (levelsRef.current[i] ?? 0) : 0;
        const barHeight = Math.max(minHeight, Math.min(height, level * height));
        context.fillStyle = filled ? filledColor : emptyColor;
        context.beginPath();
        context.roundRect(
          i * (barWidth + gap),
          (height - barHeight) / 2,
          barWidth,
          barHeight,
          Math.min(3 * ratio, barWidth / 2)
        );
        context.fill();
      }
    };

    if (phase === 'ready') {
      levelsRef.current = [];
      filledRef.current = 0;
      if (timerRef.current) timerRef.current.textContent = `00:00 / ${limit}`;
      if (loudnessRef.current) loudnessRef.current.textContent = 'silent';
      if (pitchRef.current) pitchRef.current.textContent = 'no voice';
      paint(color('--bar-empty'), color('--bar-empty'));
      return;
    }

    if (phase === 'judging') {
      paint(color('--bar-judging'), color('--bar-empty'));
      return;
    }

    const recorded = color('--bar-recording');
    const empty = color('--bar-empty');
    const started = performance.now();
    let samples = new Float32Array(2048);
    let frame = 0;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const analyser = analyserRef.current;
      if (!analyser) return;
      if (samples.length !== analyser.fftSize) samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);

      const elapsed = performance.now() - started;
      const slot = Math.min(BARS - 1, Math.floor((elapsed / maxMs) * BARS));
      let peak = 0;
      for (let i = 0; i < samples.length; i += 1) peak = Math.max(peak, Math.abs(samples[i]));
      levelsRef.current[slot] = Math.max(levelsRef.current[slot] ?? 0, Math.min(1, peak * GAIN));
      filledRef.current = slot + 1;
      paint(recorded, empty);

      if (timerRef.current) {
        timerRef.current.textContent = `${formatClock(elapsed / 1000)} / ${limit}`;
      }
      frame += 1;
      if (frame % 6 === 0) {
        const decibels = toDecibels(rms(samples));
        const pitch = detectPitch(samples, analyser.context.sampleRate);
        if (loudnessRef.current) {
          loudnessRef.current.textContent =
            decibels > -60 ? `${Math.round(decibels)} dB` : 'silent';
        }
        if (pitchRef.current) {
          pitchRef.current.textContent = pitch ? `${Math.round(pitch)} Hz` : 'no voice';
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, analyserRef, limit, maxMs]);

  return (
    <div className={cx(styles.panel, styles[phase])}>
      <div className={styles.top}>
        <span className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          {STATUS[phase]}
        </span>
        <span ref={timerRef} className={styles.timer}>
          00:00 / {limit}
        </span>
      </div>
      <canvas ref={canvasRef} className={styles.wave} aria-hidden="true" />
      <div className={styles.readouts}>
        <span>
          Loudness <strong ref={loudnessRef}>silent</strong>
        </span>
        <span>
          Pitch <strong ref={pitchRef}>no voice</strong>
        </span>
      </div>
    </div>
  );
}
