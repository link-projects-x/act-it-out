# Act it out

A screen test judged by AI. You get a boring line and an emotion, act it out loud, and a speech emotion model running in your browser decides whether it believes you.

Five scenes per game. Audio never leaves the page: the model is downloaded once and runs locally.

## How it works

1. The microphone is recorded with `MediaRecorder` for up to 5 seconds, with the browser's echo cancellation, noise suppression and auto gain turned off so the model hears the voice as it is. A clip can be uploaded instead.
2. The take is decoded, mixed down to mono, resampled to 16 kHz with `OfflineAudioContext` and trimmed to speech by frame energy.
3. A Web Worker runs [Speech-Emotion-Classification](https://huggingface.co/prithivMLmods/Speech-Emotion-Classification), a wav2vec2 classifier, through Transformers.js (ONNX Runtime Web on WASM, 8-bit weights, 95 MB, cached by the browser). It classifies the whole take and every 1.5-second window with a 0.5-second step, then averages the probabilities.
4. A take is believed when the requested emotion beats every other one. A calm card also counts neutral, because the model splits calm speech between the two labels. Believed takes score 70 to 100 depending on how clear the win is; the rest score below 70 depending on how close the requested emotion came.
5. Loudness and pitch shown during recording come from the Web Audio analyser, without the model.

The model was trained on acted speech, so it rewards clear, exaggerated delivery. It judges acting, not mood.

## Stack

- Next.js 16 (App Router, static export), React 19, TypeScript in strict mode
- SCSS modules with design tokens in CSS custom properties
- Transformers.js 4 with ONNX Runtime Web
- Web Audio API, MediaRecorder, Web Workers
- ESLint, Prettier, Husky and lint-staged

## Getting started

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Open http://localhost:4870. No environment variables are needed.

## Scripts

| Script                         | What it does                                        |
| ------------------------------ | --------------------------------------------------- |
| `npm run dev`                  | Development server on port 4870                     |
| `npm run build`                | Static export to `out/`                             |
| `npm run lint`                 | ESLint, zero warnings allowed                       |
| `npm run lint:fix`             | ESLint with autofix                                 |
| `npm run type-check`           | TypeScript check without emitting                   |
| `npm run format`               | Prettier over the whole project                     |
| `npm run eval:models -- <dir>` | Compares the candidate models on labelled WAV clips |

## Project structure

```
src/
  app/                layout and the single page
  components/
    common/           header and footer
    game/             game screens and their parts: intro, script card, recorder, verdict, wrap
    ui/               button, face icons, line icons, class name helper
  constants/          model id, emotion labels, game settings
  hooks/              useRecorder (microphone), useEmotionModel (worker bridge)
  lib/
    audio/            decoding, resampling, silence trimming, loudness and pitch
    game/             deck, scoring, verdicts, formatting
  styles/             tokens, typography, breakpoints, global styles
  types/              shared types
  workers/            emotion classifier worker
scripts/
  eval-models.mjs     model comparison in Node
```

## Choosing the model

`scripts/eval-models.mjs` runs three browser-ready ONNX models on a folder of labelled clips named like CREMA-D (`1001_DFA_ANG_XX.wav`, 16 kHz mono PCM) and reports top-1 accuracy for the whole clip and for the whole clip averaged with 1.5-second windows.

Results on 156 CREMA-D clips (12 actors, 6 emotions):

| Model                                                          | Whole clip                                           | With windows |
| -------------------------------------------------------------- | ---------------------------------------------------- | ------------ |
| `onnx-community/Speech-Emotion-Classification-ONNX` (used)     | 60%                                                  | 65%          |
| `onnx-community/wav2vec2-base-Speech_Emotion_Recognition-ONNX` | 62%                                                  | 57%          |
| `onnx-community/wav2vec2-emotion-recognition-ONNX`             | fails to load: no `tokenizer.json` in the repository |              |

The used model also covers calm and surprise, which the game needs. Running the same clips through a simulated laptop microphone (band limit, room echo, noise, Opus at 32 kbps) changed its accuracy by no more than 2 points, so the limit is the model, not the microphone. Its most common mistakes are angry heard as happy, and fear or neutral heard as sad. The clips are not part of this repository.

## Credits

- Model: [prithivMLmods/Speech-Emotion-Classification](https://huggingface.co/prithivMLmods/Speech-Emotion-Classification) (Apache-2.0), ONNX weights from [onnx-community](https://huggingface.co/onnx-community/Speech-Emotion-Classification-ONNX)
- Fonts: Bebas Neue, Courier Prime, Inter and JetBrains Mono from Google Fonts (SIL Open Font License)
- Evaluation clips: CREMA-D

## License

[MIT](LICENSE)
