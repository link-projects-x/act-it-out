import { MODEL_CARD_URL, MODEL_SIZE_MB } from '@/constants/emotions';

import styles from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>Runs in your browser. Your voice never leaves this page.</span>
      <span>
        Model:{' '}
        <a href={MODEL_CARD_URL} target="_blank" rel="noreferrer">
          Speech-Emotion-Classification
        </a>{' '}
        (wav2vec2, Apache-2.0) · {MODEL_SIZE_MB} MB, downloaded once. It learned from acted speech,
        so it judges your acting, not your real mood.
      </span>
    </footer>
  );
}
