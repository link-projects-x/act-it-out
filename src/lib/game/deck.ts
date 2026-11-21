import { TARGET_EMOTIONS } from '@/constants/emotions';
import { LINES, ROUNDS_PER_GAME } from '@/constants/game';
import type { TRound } from '@/types/emotion';

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildDeck(rounds = ROUNDS_PER_GAME): TRound[] {
  const targets = shuffle(TARGET_EMOTIONS);
  const lines = shuffle(LINES);
  return Array.from({ length: rounds }, (_, i) => ({
    target: targets[i % targets.length],
    line: lines[i % lines.length],
  }));
}
