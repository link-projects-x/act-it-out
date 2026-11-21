import { cx } from '@/components/ui';

import styles from './ScenePips.module.scss';

type TScenePipsProps = {
  current: number;
  total: number;
  completed: number;
};

export function ScenePips({ current, total, completed }: TScenePipsProps) {
  return (
    <div className={styles.progress}>
      <span className={styles.label}>
        <span className={styles.long}>
          Scene {current} of {total}
        </span>
        <span className={styles.short}>
          {current} / {total}
        </span>
      </span>
      <div className={styles.pips} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx(
              styles.pip,
              i < completed && styles.done,
              i === current - 1 && i >= completed && styles.current
            )}
          />
        ))}
      </div>
    </div>
  );
}
