import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '../cx';
import styles from './Button.module.scss';

type TButtonVariant = 'primary' | 'secondary';
type TButtonSize = 'lg' | 'md';

type TButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: TButtonVariant;
  size?: TButtonSize;
  children?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...buttonProps
}: TButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
