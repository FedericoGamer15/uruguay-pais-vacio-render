import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { track } from "../data/scenes";
import { FONT, PALETTE, SAFE } from "../theme";
import { clamp, progress } from "../utils/animation";
import { s } from "../utils/timing";
import type { SceneModule, SceneProps } from "./types";

// Capas 2D nítidas ancladas a coordenadas 3D (WorldLabel) y cabeceras de capítulo documentales
// para cada una de las 15 escenas del videoensayo (1920x1080).
// Cada escena garantiza separación espacial de etiquetas e insignias (sin superposición).

const ChapterRibbon: React.FC<{ chapter: string; title: string; localFrame: number }> = ({
  chapter,
  title,
  localFrame,
}) => {
  const enter = progress(localFrame, 8, 30);
  const exit = 1 - progress(localFrame, s(8.5), s(9.5));
  const vis = clamp(Math.min(enter, exit), 0, 1);
  if (vis <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.side,
        bottom: 245,
        opacity: vis,
        transform: `translateX(${(1 - vis) * -28}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "12px 22px",
        borderRadius: 14,
        background: "rgba(7, 15, 28, 0.88)",
        borderLeft: `6px solid ${PALETTE.accent}`,
        boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
        fontFamily: FONT,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, color: PALETTE.accent, letterSpacing: 1.8 }}>
        {chapter}
      </div>
      <div style={{ fontSize: 25, fontWeight: 900, color: "#f8fafc", letterSpacing: 0.4 }}>
        {title}
      </div>
    </div>
  );
};

// Escena 1: Siluetas comparadas (Inglaterra, Corea del Sur, Uruguay)
const Scene01Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const ukVis = clamp(track("silhouette.uk", frame), 0, 1);
  const krVis = clamp(track("silhouette.kr", frame), 0, 1);
  const barsH = clamp(track("bars.height", frame), 0, 1);
  const uyVis = progress(local, s(12), s(13.2));
  return (
    <>
      <ChapterRibbon chapter="PRÓLOGO · LA ANOMALÍA DEMOGRÁFICA" title="EL PAÍS MÁS HABITABLE Y CASI VACÍO" localFrame={local} />
      <WorldLabel pose={pose} point={[-4.8, 0.45 + 3.2 * barsH, -0.3]} text={"INGLATERRA + GALES\n57,1 MILLONES HAB."} appear={ukVis} offset={[-245, -35]} accent="#38bdf8" size={25} />
      <WorldLabel pose={pose} point={[4.8, 0.45 + 2.9 * barsH, -0.2]} text={"COREA DEL SUR\n51,7 MILLONES HAB."} appear={krVis} offset={[245, -35]} accent="#f59e0b" size={25} />
      <WorldLabel pose={pose} point={[0.2, 0.25 + 0.36 * barsH, 1.2]} text={"URUGUAY (176.215 KM²)\n3,49 MILLONES HAB."} appear={uyVis} offset={[0, -95]} accent="#22c55e" size={27} />
    </>
  );
};

// Escena 2: Geografía amable
const Scene02Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const haz = clamp(track("hazards.cross", frame), 0, 1);
  const soil = clamp(track("soil.fertility", frame), 0, 1);
  return (
    <>
      <WorldLabel pose={pose} point={[-4.4, 2.35, -0.4]} text="0% CORDILLERAS EXTREMAS" appear={haz} offset={[-175, -65]} accent="#ef4444" size={24} />
      <WorldLabel pose={pose} point={[4.6, 2.3, -0.4]} text="0% DESIERTOS ÁRIDOS" appear={haz} offset={[175, -65]} accent="#ef4444" size={24} />
      <WorldLabel pose={pose} point={[-0.2, 0.35, -0.4]} text={"PENILLANURA TEMPLADA\n~90% TIERRA AGROPRODUCTIVA"} appear={soil} offset={[0, -85]} accent="#22c55e" size={26} />
    </>
  );
};

// Escena 3: 4 vacas Hereford/Angus por habitante
const Scene03Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const hVis = clamp(track("human.pop", frame), 0, 1);
  const cVis = clamp(track("cattle.ratio", frame), 0, 1);
  return (
    <>
      <WorldLabel pose={pose} point={[-0.2, 0.65, 0.9]} text="1 HABITANTE URUGUAYO" appear={hVis} offset={[-240, -75]} accent="#38bdf8" size={25} />
      <WorldLabel pose={pose} point={[0.85, 0.4, 1.2]} text={"~3,8 VACUNOS POR PERSONA\n(12 MILLONES DE CABEZAS)"} appear={cVis} offset={[240, 45]} accent="#f59e0b" size={25} />
    </>
  );
};

// Escena 4: Hernandarias y la Banda Oriental (1611)
const Scene04Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const shipVis = clamp(track("ship.arrive", frame), 0, 1);
  const expVis = progress(local, s(26), s(28));
  return (
    <>
      <ChapterRibbon chapter="CAPÍTULO I · GÉNESIS TERRITORIAL" title="CUANDO LAS VACAS LLEGARON ANTES QUE LAS PERSONAS" localFrame={local} />
      <WorldLabel pose={pose} point={[-2.55, 0.55, 2.05]} text={"1611–1617 · HERNANDARIAS\nINTRODUCCIÓN DEL GANADO"} appear={shipVis} offset={[-210, -70]} accent="#f59e0b" size={24} />
      <WorldLabel pose={pose} point={[0.8, 0.35, -0.5]} text={"VAQUERÍA DEL MAR\nGANADO MULTIPLICADO SIN CIUDADES"} appear={expVis} offset={[210, -70]} accent="#22c55e" size={24} />
    </>
  );
};

// Escena 5: El alambramiento de los campos (1870s) — etiquetas separadas a izquierda y derecha
const Scene05Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const fVis = clamp(track("fences.grow", frame), 0, 1);
  const wVis = progress(local, s(24), s(26));
  return (
    <>
      <WorldLabel pose={pose} point={[-1.4, 0.35, 0.2]} text={"DÉCADA DE 1870 · ALAMBRAMIENTO\nCERCAMIENTO DE ESTANCIAS"} appear={fVis} offset={[-250, -75]} accent="#f59e0b" size={24} />
      <WorldLabel pose={pose} point={[1.2, 0.35, 0.8]} text={"1 CAPATAZ + POTREROS FIJOS\nDESPLAZAN A DECENAS DE PEONES"} appear={wVis} offset={[250, 55]} accent="#ef4444" size={24} />
    </>
  );
};

// Escena 6: Expulsión rural y éxodo hacia Montevideo
const Scene06Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const exVis = clamp(track("exodus.flow", frame), 0, 1);
  const mvdVis = progress(local, s(18), s(20));
  return (
    <>
      <WorldLabel pose={pose} point={[-1.6, 0.35, 0.9]} text={"RANCHERÍOS MARGINALES\n(\"PUEBLOS DE RATAS\")"} appear={exVis} offset={[-230, -70]} accent="#ef4444" size={24} />
      <WorldLabel pose={pose} point={[0.45, 1.4, 2.85]} text={"CONCENTRACIÓN EN MONTEVIDEO\nPUERTO EXPORTADOR"} appear={mvdVis} offset={[240, 45]} accent="#f59e0b" size={25} />
    </>
  );
};

// Escena 7: Macrocefalia urbana (~60% en el Área Metropolitana)
const Scene07Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const rVis = clamp(track("rail.converge", frame), 0, 1);
  const mVis = progress(local, s(20), s(22));
  return (
    <>
      <ChapterRibbon chapter="CAPÍTULO II · EL ENANO GIGANTE" title="MONTEVIDEO FRENTE AL INTERIOR PROFUNDO" localFrame={local} />
      <WorldLabel pose={pose} point={[-1.2, 0.35, -0.8]} text="RED FERROVIARIA Y VIAL EN EMBUDO" appear={rVis} offset={[-230, -65]} accent="#f59e0b" size={24} />
      <WorldLabel pose={pose} point={[0.45, 1.9, 2.85]} text={"ÁREA METROPOLITANA (~2,0M)\n~60% DE LA POBLACIÓN NACIONAL"} appear={mVis} offset={[250, 40]} accent="#38bdf8" size={25} />
    </>
  );
};

// Escena 8: Luz nocturna NASA y la paradoja 96% urbana vs Interior <5 hab/km²
const Scene08Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const night = clamp(track("world.nightMode", frame), 0, 1);
  return (
    <>
      <WorldLabel pose={pose} point={[0.45, 1.5, 2.85]} text={"SUR METROPOLITANO\n96% POBLACIÓN URBANA"} appear={night} offset={[240, 45]} accent="#facc15" size={24} />
      <WorldLabel pose={pose} point={[-0.6, 0.35, -1.2]} text={"INTERIOR PROFUNDO (95% DEL MAPA)\n< 5 HAB/KM² (NIVEL PATAGONIA)"} appear={night} offset={[-230, -60]} accent="#ef4444" size={24} />
    </>
  );
};

// Escena 9: Costo de infraestructura per cápita — etiquetas separadas abajo a la izquierda y derecha
const Scene09Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const inf = clamp(track("infra.grow", frame), 0, 1);
  const cost = clamp(track("cost.perCapita", frame), 0, 1);
  return (
    <>
      <WorldLabel pose={pose} point={[-1.4, 0.35, -1.2]} text={"RUTAS, UTE, FIBRA ANTEL Y SALUD\nEN 176.215 KM²"} appear={inf} offset={[-240, -55]} accent="#38bdf8" size={24} />
      <WorldLabel pose={pose} point={[1.2, 0.35, 0.4]} text={"COSTO FIJO DIVIDIDO ENTRE\nMUY POCOS CONTRIBUYENTES"} appear={cost} offset={[240, 55]} accent="#ef4444" size={24} />
    </>
  );
};

// Escena 10: Problema de escala y alto costo de vida
const Scene10Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const cont = clamp(track("containers.stack", frame), 0, 1);
  const ceil = clamp(track("ceiling.press", frame), 0, 1);
  return (
    <>
      <ChapterRibbon chapter="CAPÍTULO III · EL PRECIO DE SER POCOS" title="ESCALA DE MERCADO, INVIERNO DEMOGRÁFICO Y DIÁSPORA" localFrame={local} />
      <WorldLabel pose={pose} point={[-0.25, 0.35, 3.15]} text={"PUERTO DE MONTEVIDEO\nIMPORTACIÓN EN ESCALA PEQUEÑA"} appear={cont} offset={[-340, 75]} accent="#f59e0b" size={24} />
      <WorldLabel pose={pose} point={[0.85, 1.1, 2.85]} text={"TECHO DEL MERCADO INTERNO (3,5M)\nSIN ECONOMÍAS DE ESCALA"} appear={ceil} offset={[270, -60]} accent="#ef4444" size={24} />
    </>
  );
};

// Escena 11: Invierno demográfico y pirámide poblacional 1950 -> 2026
const Scene11Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const morph = clamp(track("pyramid.morph1950to2026", frame), 0, 1);
  const pen = clamp(track("pension.weight", frame), 0, 1);
  const year = Math.round(1950 + morph * 76);
  return (
    <>
      <WorldLabel pose={pose} point={[-1.4, 1.45, 0.85]} text={`PIRÁMIDE DEMOGRÁFICA · ${year}\nENVEJECIMIENTO POBLACIONAL`} appear={clamp(morph * 3, 0, 1)} offset={[-250, 20]} accent="#f59e0b" size={25} />
      <WorldLabel pose={pose} point={[-1.4, 0.35, 0.85]} text={"BASE ANGOSTA: 1,3 HIJOS/MUJER\n31.000 NACIMIENTOS/AÑO"} appear={pen} offset={[250, 65]} accent="#ef4444" size={24} />
    </>
  );
};

// Escena 12: Emigración histórica vs Exportación global de software
const Scene12Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const dia = clamp(track("diaspora.outflow", frame), 0, 1);
  const sw = clamp(track("software.export", frame), 0, 1);
  return (
    <>
      <WorldLabel pose={pose} point={[-1.8, 0.9, 0.5]} text={"DIÁSPORA: >500.000 URUGUAYOS\nEN EE.UU., ESPAÑA Y REGIÓN"} appear={dia} offset={[-220, 45]} accent="#ef4444" size={24} />
      <WorldLabel pose={pose} point={[1.8, 0.9, 0.5]} text={"EXPORTACIÓN DE SOFTWARE Y SERVICIOS\nDESDE URUGUAY AL MUNDO"} appear={sw} offset={[220, 45]} accent="#22c55e" size={24} />
    </>
  );
};

// Escena 13: Acuífero Guaraní y Matriz Renovable >95%
const Scene13Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const aq = clamp(track("crossSection.reveal", frame), 0, 1);
  const wt = clamp(track("wind.turbines", frame), 0, 1);
  return (
    <>
      <ChapterRibbon chapter="CONCLUSIÓN · EL SIGLO XXI" title="¿MALDICIÓN HISTÓRICA O REFUGIO ESTRATÉGICO?" localFrame={local} />
      <WorldLabel pose={pose} point={[-1.2, 0.15, 0.8]} text={"ACUÍFERO GUARANÍ SUBTERRÁNEO\nRESERVA MUNDIAL DE AGUA DULCE"} appear={aq} offset={[-240, 55]} accent="#38bdf8" size={25} />
      <WorldLabel pose={pose} point={[1.2, 1.6 + aq * 0.82, 0.8]} text={">95% ELECTRICIDAD RENOVABLE\nEÓLICA + HIDRÁULICA + BIOMASA"} appear={wt} offset={[230, -55]} accent="#22c55e" size={25} />
    </>
  );
};

// Escena 14: Productor de alimentos para 30-40 millones de personas
const Scene14Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const tag = clamp(track("traceability.tag", frame), 0, 1);
  const arcs = clamp(track("foodArcs.launch", frame), 0, 1);
  return (
    <>
      <WorldLabel pose={pose} point={[-0.8, 0.45, 0.6]} text={"100% TRAZABILIDAD ELECTRÓNICA\nGANADERÍA Y CELULOSA SOSTENIBLE"} appear={tag} offset={[-230, 50]} accent="#38bdf8" size={24} />
      <WorldLabel pose={pose} point={[1.8, 1.2, -0.4]} text={"ALIMENTOS PARA 30–40 MILLONES\n10 VECES SU POBLACIÓN"} appear={arcs} offset={[220, -45]} accent="#22c55e" size={25} />
    </>
  );
};

// Escena 15: Cierre reflexivo final
const Scene15Overlay: React.FC<SceneProps> = ({ scene }) => {
  const local = useCurrentFrame();
  const frame = local + scene.startFrame;
  const pose = cameraPoseAt(frame);
  const fin = clamp(track("final.labels", frame), 0, 1);
  const fade = clamp(track("fade", frame), 0, 1);
  const vis = fin * (1 - fade);
  return (
    <>
      <WorldLabel pose={pose} point={[-1.2, 0.5, -0.8]} text={"176.215 KM² · HORIZONTE ABIERTO\nTIERRA FÉRTIL Y AGUA LIMPIA"} appear={vis} offset={[-230, -45]} accent="#22c55e" size={25} />
      <WorldLabel pose={pose} point={[0.45, 1.5, 2.85]} text={"3,49 MILLONES DE HABITANTES\nEL REFUGIO DEL SUR"} appear={vis} offset={[230, 45]} accent="#38bdf8" size={25} />
    </>
  );
};

export const URUGUAY_SCENE_MODULES: Record<string, SceneModule> = {
  "scene-01-silueta-comparada": { Overlay: Scene01Overlay },
  "scene-02-geografia-amable": { Overlay: Scene02Overlay },
  "scene-03-cuatro-vacas-por-persona": { Overlay: Scene03Overlay },
  "scene-04-banda-oriental-hernandarias": { Overlay: Scene04Overlay },
  "scene-05-alambramiento-campos": { Overlay: Scene05Overlay },
  "scene-06-expulsion-rural-pueblos-de-ratas": { Overlay: Scene06Overlay },
  "scene-07-macrocefalia-urbana": { Overlay: Scene07Overlay },
  "scene-08-paradoja-96-urbano-interior-siberiano": { Overlay: Scene08Overlay },
  "scene-09-costo-infraestructura-per-capita": { Overlay: Scene09Overlay },
  "scene-10-problema-de-escala-costo-de-vida": { Overlay: Scene10Overlay },
  "scene-11-invierno-demografico": { Overlay: Scene11Overlay },
  "scene-12-fuga-cerebros-pais-chico": { Overlay: Scene12Overlay },
  "scene-13-acuifero-guarani-energia-verde": { Overlay: Scene13Overlay },
  "scene-14-productor-alimentos-30-millones": { Overlay: Scene14Overlay },
  "scene-15-cierre-reflexivo-destino": { Overlay: Scene15Overlay },
};
