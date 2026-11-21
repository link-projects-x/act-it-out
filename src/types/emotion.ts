export type TEmotion =
  'angry' | 'calm' | 'disgust' | 'fear' | 'happy' | 'neutral' | 'sad' | 'surprise';

export type TTargetEmotion = Extract<
  TEmotion,
  'angry' | 'calm' | 'fear' | 'happy' | 'sad' | 'surprise'
>;

export type TEmotionScores = Record<TEmotion, number>;

export type TRound = {
  line: string;
  target: TTargetEmotion;
};

export type TRoundResult = TRound & {
  score: number;
  heard: TEmotion;
  scores: TEmotionScores;
};

export type TVerdictTone = 'callback' | 'close' | 'doubt' | 'miss';

export type TVerdict = {
  tone: TVerdictTone;
  stamp: string;
  line: string;
};
