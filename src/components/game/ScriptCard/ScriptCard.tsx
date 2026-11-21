import { cx } from '@/components/ui';
import { EMOTIONS } from '@/constants/emotions';
import { padScene } from '@/lib/game/format';
import type { TEmotion } from '@/types/emotion';

import styles from './ScriptCard.module.scss';
import { DirectionChip } from '../DirectionChip/DirectionChip';

type TScriptCardProps = {
  line: string;
  emotion: TEmotion;
  scene: number;
  take: number;
  variant?: 'scene' | 'preview';
};

export function ScriptCard({ line, emotion, scene, take, variant = 'scene' }: TScriptCardProps) {
  return (
    <article
      className={cx(styles.card, styles[variant])}
      aria-label={`Scene ${scene}, take ${take}`}
    >
      <div className={styles.clapper} aria-hidden="true" />
      <div className={styles.meta}>
        <span>Scene {padScene(scene)}</span>
        <span>Take {take}</span>
      </div>
      <div className={styles.script}>
        <span className={styles.character}>YOU</span>
        <span className={styles.direction}>({EMOTIONS[emotion].direction})</span>
        <p className={styles.line}>{line}</p>
      </div>
      {variant === 'scene' ? (
        <div className={styles.footer}>
          <DirectionChip emotion={emotion} />
          <span className={styles.hint}>Overact it. The judge learned from actors.</span>
        </div>
      ) : (
        <div className={styles.centered}>
          <DirectionChip emotion={emotion} />
        </div>
      )}
    </article>
  );
}
