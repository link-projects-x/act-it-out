import { Button } from '@/components/ui';
import { MODEL_SIZE_MB } from '@/constants/emotions';
import type { TModelStatus } from '@/types/model';

import styles from './ModelStatus.module.scss';

type TModelStatusProps = {
  status: TModelStatus;
  onRetry: () => void;
};

export function ModelChip() {
  return (
    <span className={styles.chip}>
      <span className={styles.dot} aria-hidden="true" />
      Model ready · on your device
    </span>
  );
}

export function ModelStatus({ status, onRetry }: TModelStatusProps) {
  if (status.phase === 'idle' || status.phase === 'ready') return null;

  if (status.phase === 'error') {
    return (
      <div className={styles.error} role="alert">
        <span>The speech model didn’t load: {status.message}</span>
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  const percent = Math.round(status.progress * 100);
  return (
    <div className={styles.loading}>
      <div className={styles.row}>
        <span>
          {percent < 100
            ? 'Downloading the speech model (once, then cached)'
            : 'Starting the model on your device…'}
        </span>
        <span className={styles.percent}>
          {percent}% of {MODEL_SIZE_MB} MB
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Model download"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={styles.fill} style={{ '--progress': status.progress }} />
      </div>
    </div>
  );
}
