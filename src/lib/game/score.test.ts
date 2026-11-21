import { describe, expect, it } from 'vitest';

import type { TEmotionScores } from '@/types/emotion';

import { averageScores, isBelieved, scoreRound, verdictFor } from './score';

const base: TEmotionScores = {
  angry: 0,
  calm: 0,
  disgust: 0,
  fear: 0,
  happy: 0,
  neutral: 0,
  sad: 0,
  surprise: 0,
};

const scores = (values: Partial<TEmotionScores>): TEmotionScores => ({ ...base, ...values });

describe('scoreRound', () => {
  it('gives a callback when the requested emotion wins', () => {
    const result = scoreRound({ line: 'x', target: 'happy' }, scores({ happy: 0.7, sad: 0.3 }));
    expect(result.heard).toBe('happy');
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(verdictFor(result.score).tone).toBe('callback');
    expect(isBelieved(result)).toBe(true);
  });

  it('stays below a callback when another emotion wins', () => {
    const result = scoreRound({ line: 'x', target: 'angry' }, scores({ happy: 0.6, angry: 0.4 }));
    expect(result.heard).toBe('happy');
    expect(result.score).toBeLessThan(70);
    expect(isBelieved(result)).toBe(false);
  });

  it('counts neutral for a calm card', () => {
    const result = scoreRound(
      { line: 'x', target: 'calm' },
      scores({ neutral: 0.4, calm: 0.2, sad: 0.4 })
    );
    expect(result.heard).toBe('neutral');
    expect(isBelieved(result)).toBe(true);
  });
});

describe('averageScores', () => {
  it('averages every emotion', () => {
    const result = averageScores([scores({ happy: 1 }), scores({ happy: 0.5, sad: 0.5 })]);
    expect(result.happy).toBeCloseTo(0.75);
    expect(result.sad).toBeCloseTo(0.25);
  });
});
