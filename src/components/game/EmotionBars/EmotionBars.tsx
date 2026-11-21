import { FaceIcon } from '@/components/ui';
import { EMOTIONS } from '@/constants/emotions';
import { rankEmotions } from '@/lib/game/score';
import type { TEmotionScores } from '@/types/emotion';

import styles from './EmotionBars.module.scss';

type TEmotionBarsProps = {
  scores: TEmotionScores;
  limit?: number;
};

export function EmotionBars({ scores, limit = 5 }: TEmotionBarsProps) {
  const ranked = rankEmotions(scores).slice(0, limit);

  return (
    <ul className={styles.bars} aria-label="What the judge heard">
      {ranked.map((emotion) => (
        <li
          key={emotion}
          className={styles.row}
          style={{ '--emotion-color': `var(--emotion-${emotion})`, '--value': scores[emotion] }}
        >
          <span className={styles.name}>
            <FaceIcon emotion={emotion} size={18} className={styles.icon} />
            {EMOTIONS[emotion].name}
          </span>
          <span className={styles.track}>
            <span className={styles.fill} />
          </span>
          <span className={styles.percent}>{Math.round(scores[emotion] * 100)}%</span>
        </li>
      ))}
    </ul>
  );
}
