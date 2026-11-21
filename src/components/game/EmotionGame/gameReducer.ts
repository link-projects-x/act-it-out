import type { TRound, TRoundResult } from '@/types/emotion';

export type TGamePhase = 'intro' | 'round' | 'analyzing' | 'result' | 'final';

export type TGameState = {
  phase: TGamePhase;
  deck: TRound[];
  index: number;
  take: number;
  results: TRoundResult[];
  notice: string | null;
};

export type TGameAction =
  | { type: 'start'; deck: TRound[] }
  | { type: 'analyze' }
  | { type: 'scored'; result: TRoundResult }
  | { type: 'notice'; message: string }
  | { type: 'retry' }
  | { type: 'next' };

export const initialGameState: TGameState = {
  phase: 'intro',
  deck: [],
  index: 0,
  take: 1,
  results: [],
  notice: null,
};

export function gameReducer(state: TGameState, action: TGameAction): TGameState {
  switch (action.type) {
    case 'start':
      return { ...initialGameState, phase: 'round', deck: action.deck };
    case 'analyze':
      return { ...state, phase: 'analyzing', notice: null };
    case 'scored': {
      const results = [...state.results];
      results[state.index] = action.result;
      return { ...state, phase: 'result', results };
    }
    case 'notice':
      return { ...state, phase: 'round', notice: action.message };
    case 'retry':
      return { ...state, phase: 'round', take: state.take + 1, notice: null };
    case 'next': {
      const isLast = state.index >= state.deck.length - 1;
      return isLast
        ? { ...state, phase: 'final', notice: null }
        : { ...state, phase: 'round', index: state.index + 1, take: 1, notice: null };
    }
  }
}
