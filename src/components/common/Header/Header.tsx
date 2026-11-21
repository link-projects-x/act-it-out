import type { ReactNode } from 'react';

import styles from './Header.module.scss';

type THeaderProps = {
  badge?: string;
  children?: ReactNode;
};

export function Header({ badge, children }: THeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>
        <span className={styles.tally} aria-hidden="true" />
        Act it out
      </span>
      {children}
      {badge && <span className={styles.badge}>{badge}</span>}
    </header>
  );
}
