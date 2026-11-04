// Renderiza fotogramas específicos como PNG para revisión (un único bundle, GPU vía ANGLE).
// Ejecuta desde la raíz del proyecto Remotion:
//   node scripts/stills.mjs 0 60 150 ...            -> out/stills/f0000.png ...
// Variables opcionales: COMP=<id de la composición> (por defecto: la primera), SCALE=0.5, ENTRY=src/index.ts
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const frames = process.argv.slice(2).map(Number);
const outDir = path.resolve("out/stills");
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY ?? "src/index.ts") });
// Puerto propio para no colisionar con el Studio; "angle" usa la GPU (Three.js no renderiza en el GL por defecto).
const port = Number(process.env.PORT ?? 3124);
const chromiumOptions = { gl: "angle" };
const comps = await getCompositions(serveUrl, { port, chromiumOptions });
const composition = process.env.COMP ? comps.find((c) => c.id === process.env.COMP) : comps[0];
if (!composition) throw new Error(`Composición no encontrada: ${process.env.COMP}`);

for (const fr of frames) {
  const frame = Math.min(composition.durationInFrames - 1, fr);
  const output = path.join(outDir, `f${String(frame).padStart(5, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale: Number(process.env.SCALE ?? 0.5), port, chromiumOptions });
  console.log(output);
}
