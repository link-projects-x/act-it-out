import { ArrowRightIcon, Button, cx, FaceIcon } from '@/components/ui';
import { EMOTIONS } from '@/constants/emotions';
import { verdictFor } from '@/lib/game/score';
import type { TRoundResult } from '@/types/emotion';

import styles from './Verdict.module.scss';
import { EmotionBars } from '../EmotionBars/EmotionBars';

type TVerdictProps = {
  result: TRoundResult;
  isLast: boolean;
  onRetry: () => void;
  onNext: () => void;
};

export function Verdict({ result, isLast, onRetry, onNext }: TVerdictProps) {
  const verdict = verdictFor(result.score);
  const heard = EMOTIONS[result.heard];

  return (
    <>
      <section className={styles.verdict} aria-live="polite">
        <div className={cx(styles.stamp, styles[verdict.tone])}>
          <span className={styles.score}>{result.score}</span>
          <span className={styles.outOf}>Out of 100</span>
          <span className={styles.word}>{verdict.stamp}</span>
        </div>

        <div className={styles.details}>
          <div className={styles.heard}>
            <span className={styles.label}>The judge heard</span>
            <span
              className={styles.heardName}
              style={{ '--emotion-color': `var(--emotion-${result.heard})` }}
            >
              <FaceIcon emotion={result.heard} size={40} className={styles.heardIcon} />
              {heard.name}
            </span>
            <p className={styles.line}>{verdict.line}</p>
          </div>
          <EmotionBars scores={result.scores} />
        </div>
      </section>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onRetry}>
          Another take
        </Button>
        <Button onClick={onNext}>
          {isLast ? 'See the wrap' : 'Next scene'}
          <ArrowRightIcon />
        </Button>
      </div>
    </>
  );
}
