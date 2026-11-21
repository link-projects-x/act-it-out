import { cx, MicIcon, SpinnerIcon, StopIcon } from '@/components/ui';
import type { TRecorderStatus } from '@/types/audio';

import styles from './RecordControl.module.scss';

type TRecordControlProps = {
  status: TRecorderStatus;
  judging: boolean;
  maxMs: number;
  onRecord: () => void;
  onStop: () => void;
};

type TLook = 'ready' | 'recording' | 'judging';

const HINTS: Record<TRecorderStatus, string> = {
  idle: 'Tap and say the line out loud',
  requesting: 'Allow the microphone…',
  recording: 'Recording… tap to stop',
  processing: 'Processing the take…',
};

const LABELS: Record<TLook, string> = {
  ready: 'Start recording',
  recording: 'Stop recording',
  judging: 'Judging the take',
};

export function RecordControl({ status, judging, maxMs, onRecord, onStop }: TRecordControlProps) {
  const look: TLook =
    judging || status === 'processing' ? 'judging' : status === 'recording' ? 'recording' : 'ready';

  return (
    <div className={styles.control}>
      <button
        type="button"
        className={cx(styles.button, styles[look])}
        onClick={look === 'recording' ? onStop : onRecord}
        disabled={look === 'judging' || status === 'requesting'}
        aria-label={LABELS[look]}
        style={{ '--duration': `${maxMs}ms` }}
      >
        {look === 'ready' && <MicIcon size={36} />}
        {look === 'recording' && (
          <>
            <StopIcon size={30} />
            <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="48" />
            </svg>
          </>
        )}
        {look === 'judging' && (
          <span className={styles.spin}>
            <SpinnerIcon size={40} />
          </span>
        )}
      </button>
      <p className={styles.hint} aria-live="polite">
        {judging ? 'The judge is reviewing your take…' : HINTS[status]}
      </p>
    </div>
  );
}
