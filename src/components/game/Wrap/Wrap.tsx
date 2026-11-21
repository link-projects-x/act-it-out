'use client';

import { useState } from 'react';

import { Button, cx, CopyIcon, FaceIcon } from '@/components/ui';
import { EMOTIONS } from '@/constants/emotions';
import { padScene } from '@/lib/game/format';
import { averageScore, isBelieved, rankFor } from '@/lib/game/score';
import type { TEmotion, TRoundResult } from '@/types/emotion';

import styles from './Wrap.module.scss';

type TWrapProps = {
  results: TRoundResult[];
  onRestart: () => void;
};

function scoreTone(score: number): string {
  if (score >= 70) return styles.high;
  if (score >= 45) return styles.mid;
  return styles.low;
}

function EmotionTag({ label, emotion }: { label: string; emotion: TEmotion }) {
  return (
    <span className={styles.tag} style={{ '--emotion-color': `var(--emotion-${emotion})` }}>
      <span className={styles.tagLabel}>{label}</span>
      <FaceIcon emotion={emotion} size={18} className={styles.tagIcon} />
      {EMOTIONS[emotion].name}
    </span>
  );
}

export function Wrap({ results, onRestart }: TWrapProps) {
  const [copied, setCopied] = useState(false);
  const total = averageScore(results);
  const believed = results.filter(isBelieved).length;

  const copy = async () => {
    const text = `I scored ${total}/100 in a screen test judged by AI. Can you beat it? ${window.location.origin}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className={styles.wrap} aria-labelledby="wrap-title">
      <div className={styles.head}>
        <span className={styles.kicker}>Final cut</span>
        <h1 id="wrap-title" className={styles.title}>
          That’s a wrap.
        </h1>
      </div>

      <div className={styles.summary}>
        <div className={styles.total}>
          <span className={styles.totalValue}>{total}</span>
          <span className={styles.totalMax}>/100</span>
        </div>
        <div className={styles.rank}>
          <span className={styles.rankName}>{rankFor(total)}</span>
          <span className={styles.rankLine}>
            The judge believed you in {believed} of {results.length} scenes.
          </span>
        </div>
      </div>

      <div className={styles.sheet}>
        <span className={styles.label}>Casting sheet</span>
        <ol className={styles.rows}>
          {results.map((result, i) => (
            <li key={`${result.line}-${i}`} className={styles.row}>
              <span className={styles.scene}>{padScene(i + 1)}</span>
              <span className={styles.line}>{result.line}</span>
              <EmotionTag label="Asked" emotion={result.target} />
              <EmotionTag label="Heard" emotion={result.heard} />
              <span className={cx(styles.score, scoreTone(result.score))}>{result.score}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => void copy()}>
          <CopyIcon />
          {copied ? 'Copied' : 'Copy my score'}
        </Button>
        <Button onClick={onRestart}>Audition again</Button>
      </div>
    </section>
  );
}
