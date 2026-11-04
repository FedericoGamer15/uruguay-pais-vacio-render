import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

// Contrato de datos del videoensayo documental (16:9, 1920x1080, 30 fps, 16680 fotogramas derivados de la voz de Fish Audio).
// Tiempos sincronizados con src/data/vo.json y audioCues listos ("ready").

export type VideoConfig = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  theme: string;
  language: string;
};

export const VIDEO: VideoConfig = {
  width: WIDTH,
  height: HEIGHT,
  fps: FPS,
  durationInFrames: DURATION,
  theme: "geopolitical-3d-diorama",
  language: "es-419",
};

export type BadgeVariant = "positive" | "negative" | "info" | "warning";

export type CameraKey = { at: number; position: Vec3; target: Vec3; zoom?: number; easing?: EaseName };

export type CameraPlan = {
  projection: "perspective" | "orthographic";
  movement: "dolly-in" | "dolly-out" | "vertical" | "orbit" | "tracking" | "split" | "hold";
  keys: CameraKey[];
};

export type SceneObject = { id: string; type: string; visible: boolean; state?: { start: string; end: string } };

export type SceneBadge = {
  text: string;
  variant: BadgeVariant;
  appearAt: number;
  disappearAt?: number;
  subtitle?: string;
  slot?: "center" | "left" | "right";
  icon?: "?";
  size?: "normal" | "large";
};

export type CaptionBlock = { text: string; from: number; to: number };

export type AudioCue = {
  kind: "narration" | "sfx";
  src: string;
  at: number;
  volume: number;
  status: "planned" | "ready";
};

export type ScenePlan = {
  id: string;
  startFrame: number;
  durationInFrames: number;
  voKey: VoKey;
  narration: string;
  camera: CameraPlan;
  objects: SceneObject[];
  animations: TrackAnimation[];
  badges: SceneBadge[];
  highlights: string[];
  captions: CaptionBlock[];
  audioCues: AudioCue[];
};

const sc = (i: number) => SCENE_FRAMES[i];
const end = (i: number) => SCENE_FRAMES[i].durationInFrames;
const W = wordLocal;
const key = (at: number, pose: { position: Vec3; target: Vec3 }, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
const narration = (k: VoKey, status: AudioCue["status"] = "ready"): AudioCue => ({
  kind: "narration",
  src: `audio/vo/${k}.wav`,
  at: voLocal(k),
  volume: 1,
  status,
});
const sfx = (name: string, at: number, volume: number): AudioCue => ({
  kind: "sfx",
  src: `audio/sfx/${name}.wav`,
  at: Math.max(0, at),
  volume,
  status: "ready",
});

// Poses orbitales del diorama geopolítico 3D de Uruguay (todas con elevación positiva >= 14° para vista isométrica limpia sin huecos)
const P = {
  globeWide: orbit([0, 0.2, 0.2], 30, 20, 34),
  uruguayTop: orbit([0, 0.2, 0.2], 23, 0, 48),
  scaleCompare: orbit([0, 0.4, 0.3], 22, -14, 26),
  praderaClose: orbit([0.2, 0.2, 0.8], 14, 16, 22),
  estanciaWide: orbit([-0.3, 0.2, 0.5], 18, 22, 24),
  wireFenceClose: orbit([0.4, 0.2, 0.9], 13, -16, 21),
  exodusTrack: orbit([0.2, 0.1, 1.3], 17, 12, 25),
  montevideoTower: orbit([0.45, 0.2, 2.2], 14, 10, 22),
  interiorEmpty: orbit([-0.6, 0.3, -0.3], 21, -18, 28),
  gridRoutes: orbit([0, 0.2, 0.4], 21, 14, 34),
  portScale: orbit([0.45, 0.2, 2.4], 13, 18, 20),
  pyramid3D: orbit([-1.4, 0.7, 0.85], 15, -14, 21),
  airportFlow: orbit([0.4, 0.3, 1.4], 18, 22, 24),
  undergroundDive: orbit([0, -0.45, 1.2], 16, 8, 16),
  agroTech: orbit([0.2, 0.3, 0.6], 18, -12, 23),
  finalDiorama: orbit([0, 0.1, 0.3], 28, 26, 28),
};

export const scenes: ScenePlan[] = [
  // =========================================================================
  // CAPÍTULO 0: EL GANCHO — LA ANOMALÍA EN EL MAPA
  // =========================================================================
  {
    id: "scene-01-silueta-comparada",
    startFrame: sc(0).from,
    durationInFrames: sc(0).durationInFrames,
    voKey: "s1",
    narration:
      "Si tomas el mapa de Uruguay y lo arrastras sobre Europa o Asia, ocurre algo desconcertante. En sus ciento setenta y seis mil kilómetros cuadrados cabrían Inglaterra y Gales juntos, o casi dos veces Corea del Sur. Pero mientras Inglaterra alberga a más de cincuenta y siete millones de personas y Corea del Sur supera los cincuenta y un millones... en Uruguay apenas viven tres millones cuatrocientos noventa y nueve mil habitantes.",
    camera: {
      projection: "perspective",
      movement: "dolly-in",
      keys: [key(0, P.globeWide), key(s(10), P.uruguayTop, "soft"), key(end(0), P.scaleCompare, "soft")],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "silhouette-uk", type: "silueta-3d", visible: true },
      { id: "silhouette-kr", type: "silueta-3d", visible: true },
      { id: "pop-bars-compare", type: "barras-3d", visible: true },
    ],
    animations: [
      { type: "spring", target: "terrain.scale", startFrame: -5, endFrame: 38, from: 0, to: 1, damping: 12, unit: "0-1" },
      { type: "spring", target: "silhouette.uk", startFrame: W("s1", 23), endFrame: W("s1", 23) + 45, from: 0, to: 1, damping: 11, unit: "0-1" },
      { type: "spring", target: "silhouette.kr", startFrame: W("s1", 31), endFrame: W("s1", 31) + 45, from: 0, to: 1, damping: 11, unit: "0-1" },
      { type: "interpolate", target: "bars.height", startFrame: W("s1", 36), endFrame: end(0) - 35, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "176.215 KM²", variant: "info", appearAt: W("s1", 16), disappearAt: W("s1", 37), subtitle: "Tamaño comparable a Inglaterra + Gales" },
      { text: "3,49 MILLONES HAB.", variant: "warning", icon: "?", appearAt: W("s1", 56), disappearAt: end(0) - 8, subtitle: "Censo INE 2023 · La anomalía demográfica" },
    ],
    highlights: ["URUGUAY", "INGLATERRA", "COREA", "MILLONES", "HABITANTES"],
    captions: [{ text: "176.215 km²: el tamaño de Inglaterra o casi dos Coreas del Sur, pero con solo 3,5 millones de personas.", from: voLocal("s1"), to: end(0) }],
    audioCues: [narration("s1"), sfx("whoosh-big", 0, 0.3), sfx("badge", W("s1", 16), 0.25), sfx("badge", W("s1", 56), 0.27)],
  },
  {
    id: "scene-02-geografia-amable",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration:
      "En casi cualquier otro rincón del planeta, cuando un país está así de despoblado, la geografía tiene la culpa. Hay desiertos abrasadores como en Australia, hielos perpetuos como en Islandia, selvas impenetrables o cordilleras imposibles. Pero Uruguay no tiene nada de eso. Es una penillanura suave, templada, regada por cientos de ríos y con casi el noventa por ciento de su suelo apto para producir alimentos. Es uno de los territorios más habitables de la Tierra.",
    camera: {
      projection: "perspective",
      movement: "orbit",
      keys: [key(0, P.scaleCompare), key(s(12), P.uruguayTop, "soft"), key(end(1), P.praderaClose, "soft")],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "climate-hazards", type: "iconos-3d-desierto-montana", visible: true },
      { id: "rivers-network", type: "rios-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "silhouette.uk", startFrame: 0, endFrame: 25, from: 1, to: 0, easing: "in", unit: "0-1" },
      { type: "interpolate", target: "silhouette.kr", startFrame: 0, endFrame: 25, from: 1, to: 0, easing: "in", unit: "0-1" },
      { type: "spring", target: "hazards.cross", startFrame: W("s2", 18), endFrame: W("s2", 34), from: 0, to: 1, damping: 10, unit: "0-1" },
      { type: "interpolate", target: "rivers.glow", startFrame: W("s2", 42), endFrame: end(1) - 30, from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "soil.fertility", startFrame: W("s2", 52), endFrame: end(1) - 20, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "SIN DESIERTOS NI CORDILLERAS", variant: "negative", appearAt: W("s2", 18), disappearAt: W("s2", 41) },
      { text: "~90% SUELO PRODUCTIVO", variant: "positive", appearAt: W("s2", 52), disappearAt: end(1) - 8, subtitle: "Penillanura templada e irrigada" },
    ],
    highlights: ["DESIERTOS", "CORDILLERAS", "PENILLANURA", "NOVENTA", "HABITABLES"],
    captions: [{ text: "Sin desiertos ni selvas: casi el 90% del suelo uruguayo es fértil y habitable.", from: voLocal("s2"), to: end(1) }],
    audioCues: [narration("s2"), sfx("buzz", W("s2", 18), 0.24), sfx("flow", W("s2", 42), 0.22), sfx("shimmer", W("s2", 52), 0.25)],
  },
  {
    id: "scene-03-cuatro-vacas-por-persona",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration:
      "Y sin embargo, si sales de su capital y conduces dos horas hacia el norte, puedes avanzar kilómetros enteros sin cruzarte con un solo ser humano. Lo que sí vas a encontrar son vacas. Doce millones de cabezas de ganado vacuno frente a tres millones y medio de personas: casi cuatro vacas por cada habitante. ¿Por qué un país tan fértil quedó prácticamente vacío? ¿Y cómo esta soledad geográfica define hoy su economía, su política y su destino?",
    camera: {
      projection: "perspective",
      movement: "dolly-out",
      keys: [key(0, P.praderaClose), key(s(12), orbit([0.1, 0.3, 1.1], 13, -12, 16), "soft"), key(end(2), P.estanciaWide, "soft")],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "rivers-network", type: "rios-3d", visible: true },
      { id: "human-figure", type: "peon-lowpoly", visible: true },
      { id: "cattle-herd", type: "ganado-instanciado", visible: true },
    ],
    animations: [
      { type: "spring", target: "human.pop", startFrame: W("s3", 18), endFrame: W("s3", 18) + 40, from: 0, to: 1, damping: 11, unit: "0-1" },
      { type: "spring", target: "cattle.ratio", startFrame: W("s3", 31), endFrame: W("s3", 31) + 55, from: 0, to: 1, damping: 9, unit: "0-1" },
      { type: "interpolate", target: "herd.scatter", startFrame: W("s3", 45), endFrame: end(2) - 25, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "12M VACAS VS. 3,5M PERSONAS", variant: "info", appearAt: W("s3", 33), disappearAt: W("s3", 55), subtitle: "~3,5 a 3,8 vacunos por habitante" },
      { text: "EL PAÍS VACÍO", variant: "warning", icon: "?", size: "large", appearAt: W("s3", 57), disappearAt: end(2) - 8, subtitle: "Por qué el país más habitable está casi vacío" },
    ],
    highlights: ["VACAS", "DOCE", "CUATRO", "VACÍO", "DESTINO"],
    captions: [{ text: "12 millones de vacas frente a 3,5 millones de personas: casi 4 vacas por habitante.", from: voLocal("s3"), to: end(2) }],
    audioCues: [narration("s3"), sfx("pop-high", W("s3", 31), 0.26), sfx("badge", W("s3", 57), 0.28)],
  },

  // =========================================================================
  // CAPÍTULO 1: CUANDO LAS VACAS LLEGARON ANTES QUE LAS PERSONAS
  // =========================================================================
  {
    id: "scene-04-banda-oriental-hernandarias",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration:
      "Para entender este vacío hay que viajar al siglo diecisiete. Mientras el Imperio Español volcaba millones de personas, ciudades y mano de obra forzada en las minas de plata del Alto Perú o en las plantaciones tropicales, la margen oriental del Río de la Plata fue considerada una tierra sin ningún provecho. No había oro ni plata, ni grandes imperios agrarios que someter. Pero en mil seiscientos once y mil seiscientos diecisiete, el gobernador Hernandarias tomó una decisión que cambiaría la historia: soltó un puñado de vacas y toros en esta pradera infinita. Sin depredadores y con pasto y agua en abundancia, el ganado se multiplicó por millones antes de que existiera una sola ciudad. En Uruguay, literalmente, las vacas llegaron un siglo antes que los colonos.",
    camera: {
      projection: "perspective",
      movement: "tracking",
      keys: [
        key(0, P.estanciaWide),
        key(s(14), orbit([-1.8, 0.5, 0.6], 24, 30, 24), "soft"),
        key(s(28), orbit([0.0, 0.3, 0.9], 16, 12, 18), "soft"),
        key(end(3), P.estanciaWide, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "rivers-network", type: "rios-3d", visible: true },
      { id: "colonial-ship", type: "barco-1611", visible: true },
      { id: "cattle-herd", type: "ganado-instanciado", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "ship.arrive", startFrame: W("s4", 60), endFrame: W("s4", 86), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "cattle.expansion", startFrame: W("s4", 88), endFrame: end(3) - 30, from: 0.1, to: 1, easing: "inOut", unit: "0-1" },
    ],
    badges: [
      { text: "TIERRA SIN PROVECHO", variant: "negative", appearAt: W("s4", 42), disappearAt: W("s4", 64), subtitle: "Sin oro ni plata colonial" },
      { text: "HERNANDARIAS (1611–1617)", variant: "info", appearAt: W("s4", 68), disappearAt: W("s4", 108), subtitle: "Introducción del ganado en la Banda Oriental" },
      { text: "GANADO ANTES QUE CIUDADES", variant: "positive", appearAt: W("s4", 112), disappearAt: end(3) - 8 },
    ],
    highlights: ["PLATA", "PROVECHO", "HERNANDARIAS", "PRADERA", "ANTES", "COLONOS"],
    captions: [{ text: "Hernandarias soltó ganado en 1611: las vacas se multiplicaron un siglo antes de fundarse ciudades.", from: voLocal("s4"), to: end(3) }],
    audioCues: [narration("s4"), sfx("whoosh-soft", 15, 0.24), sfx("badge", W("s4", 68), 0.25), sfx("shimmer", W("s4", 112), 0.25)],
  },
  {
    id: "scene-05-alambramiento-campos",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration:
      "Durante más de dos siglos, la Banda Oriental fue una frontera abierta de ganado cimarrón, gauchos a caballo y estancias sin límites precisos. Parecía que el campo iría poblándose a medida que creciera el comercio de cuero y tasajo. Pero en la década de mil ochocientos setenta llegó una revolución silenciosa y brutal: el alambramiento de los campos. Impulsados por el gobierno de Lorenzo Latorre y la Asociación Rural, los estancieros cercaron millones de hectáreas con alambre de acero importado de Gran Bretaña. De pronto, para cuidar miles de vacas y ovejas ya no hacían falta decenas de peones y puesteros recorriendo la llanura: bastaban unos pocos alambres, potreros fijos y un capataz.",
    camera: {
      projection: "perspective",
      movement: "dolly-in",
      keys: [
        key(0, P.estanciaWide),
        key(s(14), P.wireFenceClose, "soft"),
        key(s(28), orbit([0.9, 0.2, 1.3], 13, 16, 15), "soft"),
        key(end(4), P.wireFenceClose, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "cattle-herd", type: "ganado-instanciado", visible: true },
      { id: "wire-fences", type: "alambrados-3d", visible: true },
      { id: "gaucho-workers", type: "peones-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "fences.grow", startFrame: W("s5", 45), endFrame: W("s5", 86), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "workers.count", startFrame: W("s5", 88), endFrame: end(4) - 25, from: 1, to: 0.16, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "CAMPO ABIERTO CIMARRÓN", variant: "info", appearAt: 25, disappearAt: W("s5", 42) },
      { text: "EL ALAMBRAMIENTO (1870s)", variant: "warning", appearAt: W("s5", 48), disappearAt: W("s5", 88), subtitle: "Cercamiento de las estancias" },
      { text: "MÍNIMA MANO DE OBRA", variant: "negative", appearAt: W("s5", 92), disappearAt: end(4) - 8, subtitle: "Tecnología que ahorra peones" },
    ],
    highlights: ["GAUCHOS", "ALAMBRAMIENTO", "LATORRE", "HECTÁREAS", "PEONES"],
    captions: [{ text: "En los años 1870, el alambramiento cercó las estancias e hizo innecesaria a la mayoría de los peones.", from: voLocal("s5"), to: end(4) }],
    audioCues: [narration("s5"), sfx("clunk", W("s5", 48), 0.28), sfx("click", W("s5", 68), 0.22), sfx("buzz", W("s5", 92), 0.25)],
  },
  {
    id: "scene-06-expulsion-rural-pueblos-de-ratas",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration:
      "La consecuencia demográfica fue sísmica. Decenas de miles de jornaleros, agregados y familias rurales quedaron de la noche a la mañana sin tierra y sin trabajo. Fueron expulsados de las estancias hacia los márgenes de los caminos, formando rancheríos precarios que la época llamó cruelmente pueblos de ratas, o empujados directamente hacia las vías del ferrocarril rumbo al puerto de Montevideo. Mientras Estados Unidos o Canadá colonizaban su interior repartiendo pequeñas granjas familiares que fundaban miles de pueblos, Uruguay consolidó el latifundio ganadero extensivo: un modelo capaz de generar enorme riqueza exportadora con el campo casi vacío.",
    camera: {
      projection: "perspective",
      movement: "tracking",
      keys: [
        key(0, P.wireFenceClose),
        key(s(13), P.exodusTrack, "soft"),
        key(s(26), orbit([0.4, -0.3, 1.9], 17, 10, 22), "soft"),
        key(end(5), P.montevideoTower, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "wire-fences", type: "alambrados-3d", visible: true },
      { id: "exodus-arrows", type: "flechas-flujo-3d", visible: true },
      { id: "rancherios-edge", type: "caserios-marginales", visible: true },
      { id: "montevideo-spire", type: "columna-densidad-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "exodus.flow", startFrame: W("s6", 22), endFrame: W("s6", 68), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "spring", target: "montevideo.growth", startFrame: W("s6", 54), endFrame: end(5) - 25, from: 0.15, to: 0.65, damping: 12, unit: "0-1" },
    ],
    badges: [
      { text: "ÉXODO RURAL FORZADO", variant: "negative", appearAt: W("s6", 22), disappearAt: W("s6", 66), subtitle: "Rancheríos y migración hacia la capital" },
      { text: "LATIFUNDIO EXTENSIVO", variant: "info", appearAt: W("s6", 72), disappearAt: end(5) - 8, subtitle: "Alta exportación · Baja densidad humana" },
    ],
    highlights: ["EXPULSADOS", "PUEBLOS", "MONTEVIDEO", "GRANJAS", "LATIFUNDIO", "VACÍO"],
    captions: [{ text: "El modelo de gran estancia exportadora vació el campo y empujó a la población hacia Montevideo.", from: voLocal("s6"), to: end(5) }],
    audioCues: [narration("s6"), sfx("whoosh", W("s6", 22), 0.25), sfx("rumble-soft", W("s6", 54), 0.24)],
  },

  // =========================================================================
  // CAPÍTULO 2: EL ENANO GIGANTE — MONTEVIDEO VS. EL INTERIOR
  // =========================================================================
  {
    id: "scene-07-macrocefalia-urbana",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration:
      "Ese embudo histórico desembocó en una de las macrocefalias urbanas más extremas del planeta. Todos los ferrocarriles, las rutas, los frigoríficos, los bancos, la universidad y el aparato estatal convergieron en un solo punto: la bahía de Montevideo. A esto se sumó la gran ola de inmigración europea de italianos y españoles entre finales del siglo diecinueve y principios del veinte. Al encontrar el campo ya repartido y cerrado por el alambre, los inmigrantes se quedaron en la capital. Hoy, el área metropolitana de Montevideo concentra cerca del sesenta por ciento de toda la población del país en apenas una fracción mínima del territorio.",
    camera: {
      projection: "perspective",
      movement: "orbit",
      keys: [
        key(0, P.montevideoTower),
        key(s(18), orbit([0.6, -0.3, 2.1], 13, -16, 17), "soft"),
        key(end(6), P.interiorEmpty, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "montevideo-spire", type: "columna-densidad-3d", visible: true },
      { id: "rail-fan", type: "red-radial-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "rail.converge", startFrame: W("s7", 14), endFrame: W("s7", 45), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "spring", target: "montevideo.growth", startFrame: W("s7", 70), endFrame: end(6) - 30, from: 0.65, to: 1, damping: 10, unit: "0-1" },
    ],
    badges: [
      { text: "MACROCEFALIA URBANA", variant: "warning", appearAt: W("s7", 7), disappearAt: W("s7", 68), subtitle: "Red radial convergente en el puerto" },
      { text: "~60% EN EL ÁREA METROPOLITANA", variant: "info", appearAt: W("s7", 74), disappearAt: end(6) - 8, subtitle: "Montevideo + Canelones + San José" },
    ],
    highlights: ["MACROCEFALIA", "FERROCARRILES", "INMIGRACIÓN", "CAPITAL", "SESENTA"],
    captions: [{ text: "Con el campo cerrado, la inmigración europea se quedó en Montevideo: ~60% del país vive en su área metropolitana.", from: voLocal("s7"), to: end(6) }],
    audioCues: [narration("s7"), sfx("badge", W("s7", 7), 0.25), sfx("glow", W("s7", 74), 0.24)],
  },
  {
    id: "scene-08-paradoja-96-urbano-interior-siberiano",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration:
      "Si apagamos las luces y miramos a Uruguay desde el espacio de noche, el contraste es sobrecogedor. Un foco incandescente brilla sobre el Río de la Plata, mientras el noventa y cinco por ciento restante del mapa se sumerge en una penumbra casi absoluta. En departamentos del centro y norte como Flores, Durazno o Treinta y Tres, la densidad cae a menos de cinco habitantes por kilómetro cuadrado, cifras propias de la Patagonia o de Siberia. Y aquí surge la gran paradoja cultural uruguaya: el noventa y seis por ciento de los uruguayos vive en ciudades, pero el motor exportador y el mito fundacional de la nación siguen estando en la pradera.",
    camera: {
      projection: "perspective",
      movement: "split",
      keys: [
        key(0, P.interiorEmpty),
        key(s(14), P.uruguayTop, "soft"),
        key(end(7), P.gridRoutes, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "montevideo-spire", type: "columna-densidad-3d", visible: true },
      { id: "night-lights", type: "luces-nasa-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "world.nightMode", startFrame: 10, endFrame: 90, from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "spring", target: "split.compare", startFrame: W("s8", 74), endFrame: end(7) - 25, from: 0, to: 1, damping: 12, unit: "0-1" },
    ],
    badges: [
      { text: "< 5 HAB/KM² EN EL CENTRO-NORTE", variant: "negative", appearAt: W("s8", 42), disappearAt: W("s8", 72), subtitle: "Flores · Durazno · Treinta y Tres" },
      { text: "96% POBLACIÓN URBANA", variant: "info", slot: "left", appearAt: W("s8", 78), disappearAt: end(7) - 8 },
      { text: "MOTOR AGROEXPORTADOR", variant: "positive", slot: "right", appearAt: W("s8", 88), disappearAt: end(7) - 8 },
    ],
    highlights: ["ESPACIO", "PENUMBRA", "DENSIDAD", "PARADOJA", "CIUDADES", "PRADERA"],
    captions: [{ text: "El 96% de los uruguayos vive en ciudades, pero el interior tiene menos de 5 habitantes por km².", from: voLocal("s8"), to: end(7) }],
    audioCues: [narration("s8"), sfx("dive", 10, 0.24), sfx("badge", W("s8", 42), 0.25), sfx("pop", W("s8", 78), 0.25)],
  },
  {
    id: "scene-09-costo-infraestructura-per-capita",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration:
      "Esta asimetría tiene un precio oculto gigantesco: el costo de la infraestructura per cápita. Para que la soja, la celulosa, la carne y los lácteos salgan de cada rincón del interior, y para que cada pueblo tenga carreteras asfaltadas, fibra óptica, agua potable, hospitales y escuelas públicas, el Estado tiene que tender miles de kilómetros de redes físicas a través de tierras casi deshabitadas. En un país denso, un kilómetro de carretera o de tendido eléctrico es financiado por miles de contribuyentes. En el interior de Uruguay, ese mismo kilómetro recae sobre las espaldas de muy pocas personas.",
    camera: {
      projection: "perspective",
      movement: "dolly-in",
      keys: [
        key(0, P.gridRoutes),
        key(s(16), orbit([0.1, 0.2, 0.8], 17, -14, 24), "soft"),
        key(end(8), P.portScale, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "infra-network", type: "rutas-redes-electricas", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "world.nightMode", startFrame: 0, endFrame: 50, from: 1, to: 0, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "infra.grow", startFrame: W("s9", 14), endFrame: W("s9", 62), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "spring", target: "cost.perCapita", startFrame: W("s9", 66), endFrame: end(8) - 25, from: 0, to: 1, damping: 10, unit: "0-1" },
    ],
    badges: [
      { text: "INFRAESTRUCTURA EXTENSA", variant: "info", appearAt: W("s9", 26), disappearAt: W("s9", 64), subtitle: "Rutas, energía, fibra óptica y escuelas" },
      { text: "ALTO COSTO PER CÁPITA", variant: "negative", appearAt: W("s9", 68), disappearAt: end(8) - 8, subtitle: "Muchos kilómetros entre pocos contribuyentes" },
    ],
    highlights: ["INFRAESTRUCTURA", "CARRETERAS", "FIBRA", "CONTRIBUYENTES", "POCAS"],
    captions: [{ text: "Conectar 176.000 km² entre solo 3,5 millones de personas encarece cada ruta y servicio público.", from: voLocal("s9"), to: end(8) }],
    audioCues: [narration("s9"), sfx("hydraulic", W("s9", 26), 0.23), sfx("pressure", W("s9", 68), 0.24)],
  },

  // =========================================================================
  // CAPÍTULO 3: EL PRECIO DE SER POCOS — ECONOMÍA Y SOCIEDAD
  // =========================================================================
  {
    id: "scene-10-problema-de-escala-costo-de-vida",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration:
      "Y eso nos lleva directo al bolsillo de la gente: ¿por qué Uruguay es consistentemente uno de los países más caros de toda América Latina? La respuesta, en gran medida, es un problema de escala. Un mercado interno de tres millones y medio de consumidores es diminuto para los estándares industriales modernos. Producir localmente manufacturas tiene costos unitarios altísimos porque no hay volumen para diluir los costos fijos. E importar tampoco es barato: cuando un barco llega con productos, el mercado es tan pequeño que suele quedar en manos de unos pocos importadores y distribuidores con poca competencia, sumado a altos impuestos al consumo y combustibles para sostener aquel Estado e infraestructura. Cualquier emprendimiento local que triunfa en Uruguay choca contra el techo de su propio mercado en cuestión de meses: o nace pensando en exportar al mundo, o se estanca.",
    camera: {
      projection: "perspective",
      movement: "orbit",
      keys: [
        key(0, P.portScale),
        key(s(22), orbit([0.7, -0.2, 1.8], 12, -12, 14), "soft"),
        key(end(9), P.pyramid3D, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "port-containers", type: "puerto-importacion-3d", visible: true },
      { id: "market-ceiling", type: "domo-limite-escala", visible: true },
    ],
    animations: [
      { type: "spring", target: "containers.stack", startFrame: W("s10", 20), endFrame: W("s10", 55), from: 0, to: 1, damping: 11, unit: "0-1" },
      { type: "interpolate", target: "ceiling.press", startFrame: W("s10", 60), endFrame: end(9) - 35, from: 0, to: 1, easing: "inOut", unit: "0-1" },
    ],
    badges: [
      { text: "FALTA DE ECONOMÍA DE ESCALA", variant: "negative", appearAt: W("s10", 24), disappearAt: W("s10", 68), subtitle: "Mercado interno de solo 3,5M" },
      { text: "ALTO COSTO DE VIDA", variant: "warning", appearAt: W("s10", 72), disappearAt: W("s10", 112), subtitle: "Pocos importadores + costos fijos altos" },
      { text: "EXPORTAR O ESTANCARSE", variant: "info", appearAt: W("s10", 116), disappearAt: end(9) - 8 },
    ],
    highlights: ["CAROS", "ESCALA", "MERCADO", "IMPORTADORES", "TECHO", "EXPORTAR"],
    captions: [{ text: "Sin economías de escala y con pocos importadores, el mercado pequeño encarece el costo de vida.", from: voLocal("s10"), to: end(9) }],
    audioCues: [narration("s10"), sfx("thud", W("s10", 24), 0.26), sfx("badge", W("s10", 72), 0.25)],
  },
  {
    id: "scene-11-invierno-demografico",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration:
      "Pero hay un desafío todavía más profundo corriendo bajo la superficie: el invierno demográfico. A diferencia del resto de Sudamérica, Uruguay vivió su transición demográfica a mediados del siglo veinte, al mismo ritmo que Europa. Se urbanizó temprano, educó a su población y creó el primer Estado de bienestar de la región. El resultado es que Uruguay envejeció antes de volverse plenamente rico. Entre dos mil quince y dos mil veintitrés, los nacimientos se desplomaron de cuarenta y ocho mil a apenas treinta y un mil por año. La tasa de fecundidad cayó a cerca de uno coma tres hijos por mujer, muy por debajo del dos coma uno necesario para reemplazar a la población. Desde dos mil veintiuno, en Uruguay mueren más personas de las que nacen. Con una pirámide invertida donde cada vez hay más jubilados y menos trabajadores activos, financiar las pensiones y la salud se vuelve el mayor rompecabezas fiscal del siglo.",
    camera: {
      projection: "perspective",
      movement: "dolly-in",
      keys: [
        key(0, P.pyramid3D),
        key(s(24), orbit([-1.6, 0.7, 0.9], 12.5, 8, 15), "soft"),
        key(end(10), P.airportFlow, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "demographic-pyramid", type: "piramide-3d-animada", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "pyramid.morph1950to2026", startFrame: W("s11", 10), endFrame: W("s11", 105), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "spring", target: "pension.weight", startFrame: W("s11", 110), endFrame: end(10) - 30, from: 0, to: 1, damping: 10, unit: "0-1" },
    ],
    badges: [
      { text: "FECUNDIDAD ~1,3 HIJOS/MUJER", variant: "negative", appearAt: W("s11", 82), disappearAt: W("s11", 116), subtitle: "Nivel de reemplazo = 2,1 · Censo INE 2023" },
      { text: "MÁS DEFUNCIONES QUE NACIMIENTOS", variant: "warning", appearAt: W("s11", 120), disappearAt: end(10) - 8, subtitle: "Presión sobre jubilaciones y salud" },
    ],
    highlights: ["INVIERNO", "ENVEJECIÓ", "NACIMIENTOS", "FECUNDIDAD", "MUEREN", "JUBILADOS"],
    captions: [{ text: "Con 1,3 hijos por mujer, hoy en Uruguay mueren más personas de las que nacen.", from: voLocal("s11"), to: end(10) }],
    audioCues: [narration("s11"), sfx("pressure", W("s11", 82), 0.25), sfx("buzz", W("s11", 120), 0.24)],
  },
  {
    id: "scene-12-fuga-cerebros-pais-chico",
    startFrame: sc(11).from,
    durationInFrames: sc(11).durationInFrames,
    voKey: "s12",
    narration:
      "A esa baja natalidad se suma una herida histórica recurrente: la emigración. Desde la crisis económica y política de los años sesenta y setenta hasta el colapso financiero de dos mil dos, oleadas enteras de jóvenes hicieron las maletas hacia España, Estados Unidos, Argentina o Australia. Se estima que más de medio millón de uruguayos —el equivalente a una sexta parte del país— vive en el exterior. Y aunque hoy Uruguay tiene la democracia más sólida, el mayor ingreso per cápita y los salarios en dólares más altos de Sudamérica, muchos jóvenes profesionales siguen sintiendo el síndrome del país chico: nichos laborales reducidos, costos elevados y poca rotación. La única válvula de escape que encontró la nueva generación fue trabajar desde Uruguay para el mundo, convirtiendo a Montevideo en un polo exportador de software y servicios globales.",
    camera: {
      projection: "perspective",
      movement: "tracking",
      keys: [
        key(0, P.airportFlow),
        key(s(22), orbit([0.5, 0.3, 1.5], 16, -16, 22), "soft"),
        key(end(11), orbit([0.2, 0.2, 1.2], 17, -4, 20), "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "diaspora-arcs", type: "arcos-emigracion-3d", visible: true },
      { id: "software-beams", type: "haces-digitales-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "diaspora.outflow", startFrame: W("s12", 12), endFrame: W("s12", 75), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "software.export", startFrame: W("s12", 102), endFrame: end(11) - 25, from: 0, to: 1, easing: "inOut", unit: "0-1" },
    ],
    badges: [
      { text: "> 500.000 URUGUAYOS EN EL EXTERIOR", variant: "negative", appearAt: W("s12", 42), disappearAt: W("s12", 98), subtitle: "Diáspora histórica acumulada" },
      { text: "HUB EXPORTADOR DE SOFTWARE", variant: "positive", appearAt: W("s12", 108), disappearAt: end(11) - 8, subtitle: "Trabajar desde Uruguay para el mundo" },
    ],
    highlights: ["EMIGRACIÓN", "JÓVENES", "EXTERIOR", "CHICO", "SOFTWARE", "MUNDO"],
    captions: [{ text: "Con medio millón de uruguayos en el exterior, la salida moderna fue exportar software y servicios globales.", from: voLocal("s12"), to: end(11) }],
    audioCues: [narration("s12"), sfx("whoosh-soft", W("s12", 12), 0.24), sfx("shimmer", W("s12", 108), 0.26)],
  },

  // =========================================================================
  // CONCLUSIÓN: ¿MALDICIÓN O REFUGIO EN EL SIGLO XXI?
  // =========================================================================
  {
    id: "scene-13-acuifero-guarani-energia-verde",
    startFrame: sc(12).from,
    durationInFrames: sc(12).durationInFrames,
    voKey: "s13",
    narration:
      "Pero detengámonos un segundo e invirtamos por completo el telescopio. Durante dos siglos, tener poca gente fue visto como una debilidad geopolítica. Sin embargo, en pleno siglo veintiuno, en un planeta que supera los ocho mil millones de habitantes, golpeado por el estrés hídrico, la crisis climática y la inseguridad alimentaria, la ecuación cambia radicalmente. Si cortamos transversalmente el subsuelo uruguayo, descubrimos que el país descansa sobre el Acuífero Guaraní, una de las mayores reservas subterráneas de agua dulce del mundo. Y en la superficie, más del noventa y cinco por ciento de su electricidad ya se genera con energías renovables: viento, agua y biomasa.",
    camera: {
      projection: "perspective",
      movement: "vertical",
      keys: [
        key(0, orbit([0.2, 0.2, 1.2], 17, -4, 20)),
        key(s(18), P.undergroundDive, "soft"),
        key(end(12), P.agroTech, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "guarani-aquifer", type: "capa-acuifero-3d", visible: true },
      { id: "wind-turbines", type: "parques-eolicos-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "crossSection.reveal", startFrame: 15, endFrame: W("s13", 62), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "aquifer.glow", startFrame: W("s13", 58), endFrame: W("s13", 92), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "spring", target: "wind.turbines", startFrame: W("s13", 86), endFrame: end(12) - 25, from: 0, to: 1, damping: 11, unit: "0-1" },
    ],
    badges: [
      { text: "ACUÍFERO GUARANÍ", variant: "positive", appearAt: W("s13", 64), disappearAt: W("s13", 88), subtitle: "Reserva estratégica subterránea de agua dulce" },
      { text: "> 95% MATRIZ ELÉCTRICA RENOVABLE", variant: "positive", appearAt: W("s13", 92), disappearAt: end(12) - 8, subtitle: "Eólica + Hidráulica + Biomasa" },
    ],
    highlights: ["SIGLO", "AGUA", "ACUÍFERO", "GUARANÍ", "RENOVABLES", "VIENTO"],
    captions: [{ text: "En un siglo de escasez, Uruguay reposa sobre el Acuífero Guaraní y genera +95% de electricidad renovable.", from: voLocal("s13"), to: end(12) }],
    audioCues: [narration("s13"), sfx("dive", 15, 0.26), sfx("water-rise", W("s13", 64), 0.25), sfx("ding", W("s13", 92), 0.24)],
  },
  {
    id: "scene-14-productor-alimentos-30-millones",
    startFrame: sc(13).from,
    durationInFrames: sc(13).durationInFrames,
    voKey: "s14",
    narration:
      "Gracias a que su campo no fue devorado por megalópolis contaminantes ni fragmentado hasta el agotamiento, Uruguay produce hoy alimentos para entre treinta y cuarenta millones de personas: diez veces su propia población. Cada vaca tiene trazabilidad electrónica individual desde que nace, los bosques plantados alimentan plantas de celulosa de escala mundial y su estabilidad institucional atrae capitales e inmigrantes regionales que buscan paz y previsibilidad. Aquella pradera vacía que el siglo diecinueve dejó sin poblar se ha convertido, paradójicamente, en su mayor seguro de vida para el futuro.",
    camera: {
      projection: "perspective",
      movement: "orbit",
      keys: [
        key(0, P.agroTech),
        key(s(15), orbit([-0.5, 0.4, 1.0], 18, 20, 22), "soft"),
        key(end(13), P.finalDiorama, "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "cattle-herd", type: "ganado-instanciado", visible: true },
      { id: "wind-turbines", type: "parques-eolicos-3d", visible: true },
      { id: "global-food-arcs", type: "arcos-exportacion-alimentos", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "crossSection.reveal", startFrame: 0, endFrame: 45, from: 1, to: 0, easing: "inOut", unit: "0-1" },
      { type: "spring", target: "traceability.tag", startFrame: W("s14", 31), endFrame: W("s14", 62), from: 0, to: 1, damping: 11, unit: "0-1" },
      { type: "interpolate", target: "foodArcs.launch", startFrame: W("s14", 16), endFrame: end(13) - 25, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "ALIMENTA A ~30–40M DE PERSONAS", variant: "positive", appearAt: W("s14", 18), disappearAt: W("s14", 44), subtitle: "10 veces su propia población" },
      { text: "100% TRAZABILIDAD BOVINA", variant: "info", appearAt: W("s14", 46), disappearAt: end(13) - 8, subtitle: "Agroindustria sostenible de alto valor" },
    ],
    highlights: ["ALIMENTOS", "TREINTA", "TRAZABILIDAD", "ESTABILIDAD", "SEGURO", "FUTURO"],
    captions: [{ text: "Con solo 3,5 millones de habitantes, Uruguay produce alimentos trazables para más de 30 millones de personas.", from: voLocal("s14"), to: end(13) }],
    audioCues: [narration("s14"), sfx("pop-high", W("s14", 18), 0.25), sfx("shimmer", W("s14", 46), 0.24)],
  },
  {
    id: "scene-15-cierre-reflexivo-destino",
    startFrame: sc(14).from,
    durationInFrames: sc(14).durationInFrames,
    voKey: "s15",
    narration:
      "El dilema de Uruguay para las próximas décadas ya no es cómo llenar sus campos como en el siglo diecinueve, sino cómo sostener un Estado moderno, bajar su costo de vida y rejuvenecer su sociedad sin perder el equilibrio único de su territorio. Porque tal vez la verdadera riqueza del siglo veintiuno ya no se mida en cuántos millones de personas caben en un mapa... sino en cuánto horizonte abierto, cuánta agua limpia y cuánta calma le quedan a un país cuando el resto del mundo se haya quedado sin espacio.",
    camera: {
      projection: "perspective",
      movement: "dolly-out",
      keys: [
        key(0, P.finalDiorama),
        key(end(14) - 90, orbit([0, -0.4, 0], 42, 42, 28), "soft"),
        key(end(14), orbit([0, -0.4, 0], 44, 45, 29), "soft"),
      ],
    },
    objects: [
      { id: "uruguay-terrain", type: "diorama-relieve", visible: true },
      { id: "guarani-aquifer", type: "capa-acuifero-3d", visible: true },
      { id: "wind-turbines", type: "parques-eolicos-3d", visible: true },
      { id: "montevideo-spire", type: "columna-densidad-3d", visible: true },
      { id: "rivers-network", type: "rios-3d", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "final.labels", startFrame: 30, endFrame: W("s15", 50), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "fade", startFrame: end(14) - 45, endFrame: end(14), from: 0, to: 1, easing: "in", unit: "0-1" },
    ],
    badges: [
      {
        text: "POR QUÉ EL PAÍS MÁS HABITABLE ESTÁ CASI VACÍO",
        variant: "info",
        size: "large",
        appearAt: 35,
        disappearAt: end(14) - 55,
        subtitle: "3,49M hab. · 176.215 km² · Acuífero Guaraní · 95% Renovable",
      },
    ],
    highlights: ["DILEMA", "EQUILIBRIO", "RIQUEZA", "HORIZONTE", "AGUA", "ESPACIO"],
    captions: [{ text: "Quizás la mayor riqueza del siglo XXI sea tener horizonte abierto y agua limpia cuando el mundo se quede sin espacio.", from: voLocal("s15"), to: end(14) }],
    audioCues: [narration("s15"), sfx("final", 35, 0.28), sfx("whoosh-soft", end(14) - 60, 0.22)],
  },
];

export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);

export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (frame >= scenes[i].startFrame) return scenes[i];
  }
  return scenes[0];
};

export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) {
    throw new Error(`Hueco/superposición entre ${prev.id} y ${cur.id}`);
  }
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) {
  throw new Error(`Las escenas suman ${total} fotogramas (esperado ${DURATION})`);
}
