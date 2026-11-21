import type { TClip } from '@/types/audio';

import { decodeToModelRate, trimToSpeech } from './decode';

const NO_SPEECH = 'Didn’t catch any speech. Get closer to the mic and say the line out loud.';
const UNREADABLE = 'This audio could not be read. Try another file or record again.';

export async function prepareClip(data: ArrayBuffer): Promise<TClip> {
  try {
    const audio = trimToSpeech(await decodeToModelRate(data));
    return audio ? { ok: true, audio } : { ok: false, message: NO_SPEECH };
  } catch {
    return { ok: false, message: UNREADABLE };
  }
}
