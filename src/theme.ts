import { loadFont } from "@remotion/google-fonts/Montserrat";

// Configuración visual central del videoensayo geopolítico 16:9 (1920x1080):
// paleta documental de alto contraste, materiales low-poly, luz, cámara y áreas seguras.

export const { fontFamily: FONT } = loadFont("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin", "latin-ext"],
});

export const PALETTE = {
  // Estados didácticos (siempre con ícono + texto)
  positive: "#1db954",
  negative: "#e63946",
  info: "#2a7de1",
  warning: "#f4b400",
  // Interfaz
  text: "#ffffff",
  outline: "#08101a",
  accent: "#38e8ff",
  // Mundo 3D (Diorama de Uruguay)
  ground: "#5c9e57",
  groundFertile: "#48b868",
  groundSide: "#7d6043",
  aquifer: "#00b4d8",
  rock: "#3c4654",
  pedestal: "#161f2c",
  river: "#2ec4ff",
  cityGold: "#ffbe0b",
  cattleBrown: "#b5532b",
  cattleWhite: "#f2efe9",
  metal: "#b8c4d0",
} as const;

/** Acabado mate low-poly para todo el diorama. */
export const MATTE = { roughness: 0.86, metalness: 0.04, flatShading: true } as const;
export const METAL = { roughness: 0.35, metalness: 0.62, flatShading: true } as const;

export const LIGHTING = {
  ambient: 0.58,
  hemisphere: { sky: "#d8f0ff", ground: "#4f4639", intensity: 1.08 },
  key: { position: [12, 18, 14] as [number, number, number], intensity: 2.55, color: "#fff5e4" },
  fill: { position: [-14, 8, 10] as [number, number, number], intensity: 0.78, color: "#c8e4ff" },
  rim: { position: [-5, 10, -14] as [number, number, number], intensity: 0.65, color: "#ffffff" },
  shadowMapSize: 2048,
} as const;

/** Perspectiva suave estilo maqueta estratégica. */
export const CAMERA = { fov: 24, near: 0.5, far: 400 } as const;

/** Franjas seguras para formato horizontal 16:9 (px en una pantalla 1920x1080). */
export const SAFE = {
  top: 48,
  bottom: 1020,
  side: 110,
  badgeTop: 54,
  captionCenterY: 948,
} as const;

/** Fondo: atmósfera documental que se oscurece en modo nocturno o al sumergirse al Acuífero Guaraní. */
export const SKY = {
  surface: ["#10253e", "#1b3b5c", "#0d1b2a"],
  underground: ["#050b14", "#091526", "#03070e"],
} as const;

/** Colores de las palabras clave en los subtítulos. */
export const KEYWORD_COLOR: Record<string, string> = {
  URUGUAY: "#38e8ff",
  INGLATERRA: "#ffd166",
  COREA: "#ffd166",
  MILLONES: "#ffbe0b",
  HABITANTES: "#38e8ff",
  DESIERTOS: "#ff595e",
  CORDILLERAS: "#ff595e",
  PENILLANURA: "#48b868",
  NOVENTA: "#20c997",
  HABITABLES: "#20c997",
  VACAS: "#ffbe0b",
  DOCE: "#ffbe0b",
  CUATRO: "#ffbe0b",
  VACÍO: "#ff595e",
  DESTINO: "#38e8ff",
  HERNANDARIAS: "#ffd166",
  PRADERA: "#48b868",
  ALAMBRAMIENTO: "#ff595e",
  PEONES: "#ffd166",
  EXPULSADOS: "#ff595e",
  MONTEVIDEO: "#ffbe0b",
  LATIFUNDIO: "#ff595e",
  MACROCEFALIA: "#ffbe0b",
  SESENTA: "#38e8ff",
  DENSIDAD: "#ff595e",
  PARADOJA: "#ffbe0b",
  INFRAESTRUCTURA: "#38e8ff",
  CAROS: "#ff595e",
  ESCALA: "#ffbe0b",
  EXPORTAR: "#20c997",
  INVIERNO: "#ff595e",
  ENVEJECIÓ: "#ffbe0b",
  FECUNDIDAD: "#ff595e",
  EMIGRACIÓN: "#ff595e",
  SOFTWARE: "#38e8ff",
  ACUÍFERO: "#00b4d8",
  GUARANÍ: "#00b4d8",
  RENOVABLES: "#20c997",
  ALIMENTOS: "#20c997",
  TRAZABILIDAD: "#38e8ff",
  FUTURO: "#20c997",
  HORIZONTE: "#38e8ff",
  AGUA: "#00b4d8",
};
export const KEYWORD_DEFAULT = "#38e8ff";
