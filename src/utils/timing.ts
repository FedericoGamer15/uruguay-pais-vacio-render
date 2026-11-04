import vo from "../data/vo.json";

// Línea de tiempo única del videoensayo documental (1920x1080, 30 fps).
// Con src/data/vo.json generado por Fish Audio + prepare_vo.py (540.59s de voz),
// los cortes SCENE_FRAMES se derivan automáticamente de la duración real de cada locución.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
/** Duración total realineada a la voz de Fish Audio (556 s = 9m16s = 16680 frames). */
export const SECONDS = 556;
export const DURATION = SECONDS * FPS;

export const f = (seconds: number) => Math.round(seconds * FPS);
/** Segundo local (dentro de la escena) -> fotograma local. */
export const s = (seconds: number) => Math.round(seconds * FPS);

/** Las 15 locuciones en el orden de las escenas. */
export const VO_KEYS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "s11",
  "s12",
  "s13",
  "s14",
  "s15",
] as const;
export type VoKey = (typeof VO_KEYS)[number];

/** Duraciones planificadas originalmente en el guion (s). */
const PLANNED_SECONDS = [25, 27, 28, 43, 39, 37, 38, 35, 35, 49, 53, 47, 40, 31, 29];
/** La 1ª locución entra después del whoosh de apertura. */
const FIRST_VO = 0.55;
/** El corte de cada escena ocurre este tiempo antes de la 1ª sílaba de su locución. */
const LEAD = 0.3;
/** Pausas dramáticas entre escenas y un poco más amplias en los cambios de capítulo (s3->s4, s6->s7, s9->s10, s12->s13). */
const GAPS: number[] = [0.75, 0.75, 1.35, 0.85, 0.85, 1.35, 0.85, 0.85, 1.35, 0.85, 0.85, 1.35, 0.85, 0.85];

type VoWord = { text: string; start: number; end: number };
type VoLine = { text: string; seconds: number; words: VoWord[] };
const VO_DATA = vo as unknown as Partial<Record<string, VoLine>>;

/** true cuando todas las locuciones ya tienen audio medido. */
export const HAS_VO = VO_KEYS.every((k) => VO_DATA[k] !== undefined);

const voStart = {} as Record<VoKey, number>;
{
  let t = FIRST_VO;
  let planned = 0;
  VO_KEYS.forEach((key, i) => {
    const line = VO_DATA[key];
    voStart[key] = HAS_VO ? t : planned + LEAD;
    t += (line?.seconds ?? 0) + (GAPS[i] ?? 0);
    planned += PLANNED_SECONDS[i];
  });
  if (HAS_VO && t > SECONDS - 0.4) {
    throw new Error(`La narración (${t.toFixed(2)} s) no cabe en ${SECONDS} s: acorta el texto o ajusta GAPS/SECONDS.`);
  }
}

/** Segundo absoluto en que comienza cada locución. */
export const VO_START: Readonly<Record<VoKey, number>> = voStart;

export const VO = VO_KEYS.filter((k) => VO_DATA[k]).map((id) => ({
  id,
  at: VO_START[id],
  seconds: VO_DATA[id]!.seconds,
  text: VO_DATA[id]!.text,
}));

/** Cortes de las escenas en fotogramas globales: [inicio, fin). Suman exactamente DURATION. */
export const SCENE_FRAMES = VO_KEYS.map((key, i) => {
  const next = VO_KEYS[i + 1];
  if (!HAS_VO) {
    const from = f(PLANNED_SECONDS.slice(0, i).reduce((a, b) => a + b, 0));
    const to = next ? f(PLANNED_SECONDS.slice(0, i + 1).reduce((a, b) => a + b, 0)) : DURATION;
    return { from, durationInFrames: to - from };
  }
  const from = i === 0 ? 0 : f(VO_START[key] - LEAD);
  const to = next ? f(VO_START[next] - LEAD) : DURATION;
  return { from, durationInFrames: to - from };
});

/** Palabras de la locución con tiempos (relativos al inicio de la locución), o [] antes del TTS. */
export const voWords = (key: VoKey): VoWord[] => VO_DATA[key]?.words ?? [];

/**
 * Fotograma LOCAL (dentro de la escena) en que comienza la palabra `index` de la locución.
 */
export const wordLocal = (key: VoKey, index: number) => {
  const scene = SCENE_FRAMES[VO_KEYS.indexOf(key)];
  const words = VO_DATA[key]?.words ?? [];
  const clampedIdx = Math.min(Math.max(0, index), Math.max(0, words.length - 1));
  const w = words[clampedIdx];
  const t = w ? w.start : index * (60 / 155);
  return f(VO_START[key] + t) - scene.from;
};

/** Fotograma local en que comienza la locución de la escena. */
export const voLocal = (key: VoKey) => f(VO_START[key]) - SCENE_FRAMES[VO_KEYS.indexOf(key)].from;
