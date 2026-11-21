import { padScene } from '@/lib/game/format';
import type { TEmotion } from '@/types/emotion';

import styles from './SceneStrip.module.scss';
import { DirectionChip } from '../DirectionChip/DirectionChip';

type TSceneStripProps = {
  line: string;
  emotion: TEmotion;
  scene: number;
  take: number;
};

export function SceneStrip({ line, emotion, scene, take }: TSceneStripProps) {
  return (
    <div className={styles.strip}>
      <span className={styles.meta}>
        Scene {padScene(scene)} · Take {take}
      </span>
      <span className={styles.line}>{line}</span>
      <DirectionChip emotion={emotion} size="sm" />
    </div>
  );
}
