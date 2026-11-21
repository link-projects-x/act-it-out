import type { ReactNode } from 'react';

import type { TEmotion } from '@/types/emotion';

type TFaceIconProps = {
  emotion: TEmotion;
  size?: number;
  className?: string;
};

const dot = (cx: number, cy: number) => (
  <circle cx={cx} cy={cy} r="1.1" fill="currentColor" stroke="none" />
);

const FEATURES: Record<TEmotion, ReactNode> = {
  angry: (
    <>
      <path d="M7.6 8.6l3 1.4" />
      <path d="M16.4 8.6l-3 1.4" />
      {dot(9.4, 11.8)}
      {dot(14.6, 11.8)}
      <path d="M8.8 16.6c1.9-1.5 4.5-1.5 6.4 0" />
    </>
  ),
  happy: (
    <>
      <path d="M8 11c.6-1 2-1 2.6 0" />
      <path d="M13.4 11c.6-1 2-1 2.6 0" />
      <path d="M8.2 13.8c1.8 2.9 5.8 2.9 7.6 0" />
    </>
  ),
  sad: (
    <>
      <path d="M7.8 9.6l2.6-1.1" />
      <path d="M16.2 9.6l-2.6-1.1" />
      {dot(9.3, 11.8)}
      {dot(14.7, 11.8)}
      <path d="M8.8 16.9c1.9-1.8 4.5-1.8 6.4 0" />
      <path
        d="M16.6 13.4c.5.8.8 1.3.8 1.7a.8.8 0 0 1-1.6 0c0-.4.3-.9.8-1.7z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  surprise: (
    <>
      <path d="M7.8 8.2c.8-.8 2-.8 2.8 0" />
      <path d="M13.4 8.2c.8-.8 2-.8 2.8 0" />
      <circle cx="9.2" cy="11.2" r="1.3" />
      <circle cx="14.8" cy="11.2" r="1.3" />
      <circle cx="12" cy="16.1" r="1.9" />
    </>
  ),
  fear: (
    <>
      <path d="M7.8 9l2.6-1.2" />
      <path d="M16.2 9l-2.6-1.2" />
      <circle cx="9.2" cy="11.4" r="1.3" />
      <circle cx="14.8" cy="11.4" r="1.3" />
      <path d="M8.6 16.4l1.15-.9 1.15.9 1.1-.9 1.15.9 1.15-.9 1.1.9" />
    </>
  ),
  calm: (
    <>
      <path d="M8 11.2c.7.8 1.9.8 2.6 0" />
      <path d="M13.4 11.2c.7.8 1.9.8 2.6 0" />
      <path d="M9.8 15.2c1.3 1 3.1 1 4.4 0" />
    </>
  ),
  disgust: (
    <>
      <path d="M7.8 9.4l2.6.6" />
      <path d="M8.2 11.8h2.2" />
      {dot(14.7, 11.6)}
      <path d="M8.8 16c1-.9 2.2-.9 3.2 0s2.2.9 3.2 0" />
    </>
  ),
  neutral: (
    <>
      {dot(9.3, 11.4)}
      {dot(14.7, 11.4)}
      <path d="M9.4 15.6h5.2" />
    </>
  ),
};

export function FaceIcon({ emotion, size = 24, className }: TFaceIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.2" />
      {FEATURES[emotion]}
    </svg>
  );
}
