import { Button, MicIcon } from '@/components/ui';
import { ROUNDS_PER_GAME } from '@/constants/game';

import styles from './Intro.module.scss';
import { ScriptCard } from '../ScriptCard/ScriptCard';

type TIntroProps = {
  onStart: () => void;
};

const STEPS = [
  {
    title: 'Get a line and a direction',
    text: 'A boring sentence and the emotion to play it with.',
  },
  { title: 'Act it out loud', text: 'Overact. The judge learned from actors, not from real life.' },
  { title: 'Get the verdict', text: 'A speech model scores how much it believes you.' },
];

export function Intro({ onStart }: TIntroProps) {
  return (
    <div className={styles.intro}>
      <section className={styles.hero} aria-labelledby="intro-title">
        <div className={styles.copy}>
          <p className={styles.kicker}>Screen test · judged by AI</p>
          <h1 id="intro-title" className={styles.title}>
            Can you fool an AI <span className={styles.accent}>with your voice?</span>
          </h1>
          <p className={styles.lead}>
            Five boring lines, five emotions. Say each one like you mean it, and a speech model
            decides whether it believes you.
          </p>
          <div className={styles.cta}>
            <Button size="lg" onClick={onStart}>
              <MicIcon />
              Start the audition
            </Button>
            <span className={styles.meta}>{ROUNDS_PER_GAME} scenes · about 2 minutes</span>
          </div>
        </div>
        <div className={styles.preview}>
          <ScriptCard
            variant="preview"
            line="It works on my machine."
            emotion="sad"
            scene={3}
            take={1}
          />
        </div>
      </section>

      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.stepTitle}>{step.title}</span>
            <span className={styles.stepText}>{step.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
