'use client';

import { useCallback, useReducer, useRef } from 'react';
import type { ChangeEvent } from 'react';

import { Footer } from '@/components/common/Footer/Footer';
import { Header } from '@/components/common/Header/Header';
import { MAX_RECORDING_MS } from '@/constants/game';
import { useEmotionModel } from '@/hooks/useEmotionModel';
import { useRecorder } from '@/hooks/useRecorder';
import { prepareClip } from '@/lib/audio/clip';
import { buildDeck } from '@/lib/game/deck';
import { scoreRound } from '@/lib/game/score';
import type { TClip, TRecorderPhase } from '@/types/audio';

import styles from './EmotionGame.module.scss';
import { gameReducer, initialGameState } from './gameReducer';
import { Intro } from '../Intro/Intro';
import { ModelChip, ModelStatus } from '../ModelStatus/ModelStatus';
import { RecordControl } from '../RecordControl/RecordControl';
import { RecorderPanel } from '../RecorderPanel/RecorderPanel';
import { ScenePips } from '../ScenePips/ScenePips';
import { SceneStrip } from '../SceneStrip/SceneStrip';
import { ScriptCard } from '../ScriptCard/ScriptCard';
import { Verdict } from '../Verdict/Verdict';
import { Wrap } from '../Wrap/Wrap';

import type { TGamePhase } from './gameReducer';

const BADGES: Partial<Record<TGamePhase, string>> = {
  intro: 'On-device AI',
  final: 'Audition complete',
};

export function EmotionGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { status: modelStatus, load: loadModel, classify } = useEmotionModel();
  const { status: recorderStatus, analyserRef, record, stop } = useRecorder(MAX_RECORDING_MS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const round = state.deck[state.index];
  const result = state.results[state.index];
  const scene = state.index + 1;
  const judging = state.phase === 'analyzing';
  const inScene = state.phase === 'round' || state.phase === 'analyzing';
  const showProgress = inScene || state.phase === 'result';

  const recorderPhase: TRecorderPhase =
    recorderStatus === 'recording'
      ? 'recording'
      : judging || recorderStatus === 'processing'
        ? 'judging'
        : 'ready';

  const start = useCallback(() => {
    loadModel();
    dispatch({ type: 'start', deck: buildDeck() });
  }, [loadModel]);

  const judge = useCallback(
    async (clip: TClip) => {
      if (!round) return;
      if (!clip.ok) {
        dispatch({ type: 'notice', message: clip.message });
        return;
      }
      dispatch({ type: 'analyze' });
      try {
        const scores = await classify(clip.audio);
        dispatch({ type: 'scored', result: scoreRound(round, scores) });
      } catch {
        dispatch({ type: 'notice', message: 'The judge couldn’t review this take. Try again.' });
      }
    },
    [classify, round]
  );

  const handleRecord = useCallback(async () => {
    await judge(await record());
  }, [judge, record]);

  const handleFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      dispatch({ type: 'analyze' });
      await judge(await prepareClip(await file.arrayBuffer()));
    },
    [judge]
  );

  return (
    <div className={styles.page}>
      <Header badge={BADGES[state.phase]}>
        {showProgress && (
          <ScenePips
            current={scene}
            total={state.deck.length}
            completed={state.phase === 'result' ? scene : state.index}
          />
        )}
        {showProgress && modelStatus.phase === 'ready' && <ModelChip />}
      </Header>

      <main className={styles.main}>
        {state.phase === 'intro' && <Intro onStart={start} />}

        {inScene && round && (
          <div className={styles.take}>
            <ModelStatus status={modelStatus} onRetry={loadModel} />
            <ScriptCard line={round.line} emotion={round.target} scene={scene} take={state.take} />
            <RecorderPanel
              analyserRef={analyserRef}
              phase={recorderPhase}
              maxMs={MAX_RECORDING_MS}
            />
            <RecordControl
              status={recorderStatus}
              judging={judging}
              maxMs={MAX_RECORDING_MS}
              onRecord={() => void handleRecord()}
              onStop={stop}
            />
            {state.notice && (
              <p className={styles.notice} role="alert">
                {state.notice}
              </p>
            )}
            <button
              type="button"
              className={styles.upload}
              onClick={() => fileInputRef.current?.click()}
              disabled={judging || recorderStatus !== 'idle'}
            >
              No mic? Upload a clip
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className={styles.fileInput}
              onChange={(event) => void handleFile(event)}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        )}

        {state.phase === 'result' && round && result && (
          <div className={styles.verdict}>
            <SceneStrip line={round.line} emotion={round.target} scene={scene} take={state.take} />
            <Verdict
              result={result}
              isLast={state.index === state.deck.length - 1}
              onRetry={() => dispatch({ type: 'retry' })}
              onNext={() => dispatch({ type: 'next' })}
            />
          </div>
        )}

        {state.phase === 'final' && (
          <div className={styles.verdict}>
            <Wrap results={state.results} onRestart={start} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
