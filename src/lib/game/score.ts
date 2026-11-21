import { MODEL_LABELS, TARGET_ALIASES } from '@/constants/emotions';
import type { TEmotion, TEmotionScores, TRound, TRoundResult, TVerdict } from '@/types/emotion';

type TLabelScore = { label: string; score: number };

export function toEmotionScores(output: TLabelScore[]): TEmotionScores {
  const scores: TEmotionScores = {
    angry: 0,
    calm: 0,
    disgust: 0,
    fear: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    surprise: 0,
  };
  for (const { label, score } of output) {
    const emotion = MODEL_LABELS[label];
    if (emotion) scores[emotion] += score;
  }
  return scores;
}

export function rankEmotions(scores: TEmotionScores): TEmotion[] {
  return (Object.keys(scores) as TEmotion[]).sort((a, b) => scores[b] - scores[a]);
}

function countedFor(round: TRound): TEmotion[] {
  return [round.target, ...(TARGET_ALIASES[round.target] ?? [])];
}

export function scoreRound(round: TRound, scores: TEmotionScores): TRoundResult {
  const hit = countedFor(round).reduce((sum, emotion) => sum + scores[emotion], 0);
  return {
    ...round,
    scores,
    heard: rankEmotions(scores)[0],
    score: Math.round(Math.min(1, hit) * 100),
  };
}

export function averageScore(results: TRoundResult[]): number {
  if (!results.length) return 0;
  return Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);
}

export function isBelieved(result: TRoundResult): boolean {
  return countedFor(result).includes(result.heard);
}

export function verdictFor(score: number): TVerdict {
  if (score >= 70) {
    return {
      tone: 'callback',
      stamp: 'Callback!',
      line: 'Oscar material. The judge fully bought it.',
    };
  }
  if (score >= 45) {
    return {
      tone: 'close',
      stamp: 'So close',
      line: 'Convincing. One more take and it is perfect.',
    };
  }
  if (score >= 20) {
    return {
      tone: 'doubt',
      stamp: 'Not buying it',
      line: 'The judge is not buying it yet. Push it further.',
    };
  }
  return { tone: 'miss', stamp: 'Next!', line: 'Wrong movie. Exaggerate it, like a cartoon.' };
}

export function rankFor(score: number): string {
  if (score >= 70) return 'Method actor';
  if (score >= 45) return 'Solid performer';
  if (score >= 25) return 'Background extra';
  return 'The judge saw right through you';
}
