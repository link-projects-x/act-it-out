import { cx, FaceIcon } from '@/components/ui';
import { EMOTIONS } from '@/constants/emotions';
import type { TEmotion } from '@/types/emotion';

import styles from './DirectionChip.module.scss';

type TDirectionChipProps = {
  emotion: TEmotion;
  size?: 'md' | 'sm';
};

export function DirectionChip({ emotion, size = 'md' }: TDirectionChipProps) {
  return (
    <span
      className={cx(styles.chip, styles[size])}
      style={{ '--emotion-color': `var(--emotion-${emotion})` }}
    >
      <FaceIcon emotion={emotion} size={size === 'md' ? 18 : 16} />
      Direction: {EMOTIONS[emotion].name.toLowerCase()}
    </span>
  );
}
