import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { CatmullRomCurve3, ExtrudeGeometry, Shape, Vector3 } from "three";
import { isVisible, track } from "../data/scenes";
import { MATTE, PALETTE } from "../theme";
import { clamp, lerp, pulse, type Vec3 } from "../utils/animation";
import { Arrow3D } from "./Arrow3D";

// Diorama geopolítico y demográfico persistente de Uruguay y la Cuenca del Plata (1920x1080).
// Incluye contexto geográfico real: Océano Atlántico y Río de la Plata al sur/este,
// masa continental de Argentina al oeste y Brasil (Rio Grande do Sul) al norte/noreste,
// corte geológico frontal macizo del Acuífero Guaraní (sin capas flotantes) y ríos curvos continuos.

// En Shape 2D (x, y) rotado -PI/2 en X: x = Este(+), y = Norte(+) -> z_mundo = -y (Norte = -Z, Sur = +Z)
const URUGUAY_OUTLINE: [number, number][] = [
  [-2.65, 4.85],  // Bella Unión (Artigas NO)
  [-1.65, 4.75],  // Artigas Norte (Río Cuareim)
  [-0.75, 4.45],  // Cuchilla Negra
  [0.15, 3.85],   // Santana do Livramento / Rivera
  [1.05, 3.25],   // Rivera Este
  [1.85, 2.55],   // Aceguá
  [2.65, 1.85],   // Río Yaguarón / Cerro Largo
  [3.65, 0.95],   // Río Branco / Laguna Merín Norte
  [3.85, 0.15],   // Laguna Merín Sur
  [3.48, -0.95],  // Chuy / Barra del Chuy
  [3.05, -1.75],  // Cabo Polonio / Castillos
  [2.45, -2.45],  // La Paloma
  [1.62, -3.18],  // Punta del Este (Maldonado)
  [0.95, -3.28],  // Piriápolis / Costa de Oro
  [0.45, -3.38],  // Bahía de Montevideo
  [-0.15, -3.18], // Delta del Tigre / San José
  [-0.85, -2.98], // Boca del Cufré
  [-1.65, -2.58], // Juan Lacaze / Rosario
  [-2.25, -2.22], // Colonia del Sacramento
  [-2.85, -1.55], // Carmelo
  [-3.02, -0.85], // Nueva Palmira / Dolores
  [-2.92, 0.15],  // Fray Bentos (Río Negro)
  [-2.82, 1.15],  // Concepción del Uruguay / Paysandú Sur
  [-2.78, 2.05],  // Paysandú Norte
  [-2.72, 3.25],  // Salto / Concordia
  [-2.68, 4.15],  // Constitución / Belén
];

// Masa continental de Argentina (Entre Ríos / Corrientes / Buenos Aires) con costa real orgánica sobre el Río de la Plata y el Atlántico
const ARGENTINA_OUTLINE: [number, number][] = [
  [-60.0, 60.0],
  [-3.25, 60.0],
  [-3.22, 6.8],
  [-3.12, 4.8],
  [-3.18, 3.2],
  [-3.25, 1.8],
  [-3.38, 0.2],
  [-3.45, -1.0],
  [-3.25, -1.85],  // Delta del Paraná / Tigre
  [-2.75, -2.55],  // Ciudad de Buenos Aires
  [-1.95, -3.18],  // Quilmes / La Plata
  [-1.35, -3.72],  // Punta Indio
  [-1.12, -4.25],  // Bahía de Samborombón Norte
  [-1.28, -4.85],  // Bahía de Samborombón Centro
  [-0.95, -5.45],  // Punta Rasa / San Clemente del Tuyú (Cabo San Antonio)
  [-0.88, -6.15],  // Pinamar / Villa Gesell
  [-1.18, -6.95],  // Mar del Plata (Cabo Corrientes)
  [-1.78, -7.65],  // Miramar / Necochea
  [-2.65, -8.35],  // Tres Arroyos / Claromecó
  [-3.85, -9.15],  // Monte Hermoso
  [-5.25, -9.95],  // Bahía Blanca
  [-6.85, -11.2],  // Punta Alta / Sur de Buenos Aires
  [-9.5, -13.5],   // Viedma / Costa Patagónica Norte
  [-16.0, -22.0],
  [-30.0, -45.0],
  [-60.0, -60.0],
];

// Masa continental de Brasil (Rio Grande do Sul, Laguna dos Patos y costa atlántica hacia Santa Catarina)
const BRAZIL_OUTLINE: [number, number][] = [
  [-2.85, 60.0],
  [60.0, 60.0],
  [60.0, 18.0],
  [16.5, 12.5],
  [11.8, 8.8],     // Florianópolis / Santa Catarina
  [8.6, 6.2],      // Criciúma / Torres
  [6.6, 4.4],      // Capão da Canoa / Osório
  [5.45, 2.95],    // Mostardas (Península de la Laguna dos Patos)
  [4.65, 1.55],    // Rio Grande / Cassino
  [4.12, 0.35],    // Santa Vitória do Palmar (Costa Atlántica)
  [3.68, -0.78],   // Barra do Chuí (Frontera costera con Uruguay)
  [3.52, -0.82],   // Chuy terrestre
  [3.92, 0.18],    // Orilla oeste Laguna Merín
  [3.74, 1.02],    // Jaguarão / Río Branco
  [2.74, 1.94],    // Aceguá / Bagé
  [1.94, 2.64],    // Santana do Livramento
  [1.14, 3.34],    // Rivera / Quaraí
  [0.22, 3.94],    // Cuchilla Negra
  [-0.65, 4.54],   // Artigas / Quaraí
  [-1.6, 4.86],    // Río Cuareim
  [-2.65, 5.02],   // Bella Unión / Barra do Quaraí
];

const UK_OUTLINE: [number, number][] = [
  [-0.6, 2.7],
  [0.3, 2.5],
  [0.7, 1.3],
  [1.1, 0.2],
  [1.3, -1.1],
  [0.8, -2.1],
  [-0.4, -2.4],
  [-1.2, -1.9],
  [-0.9, -0.8],
  [-1.1, 0.4],
  [-0.8, 1.6],
];

const KR_OUTLINE: [number, number][] = [
  [-0.5, 1.8],
  [0.6, 1.6],
  [1.0, 0.5],
  [0.9, -0.9],
  [0.3, -1.8],
  [-0.6, -1.7],
  [-0.9, -0.6],
  [-0.7, 0.7],
];

const makeShape = (pts: [number, number][]) => {
  const s = new Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    s.lineTo(pts[i][0], pts[i][1]);
  }
  s.closePath();
  return s;
};

const seeded = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const insideUruguay = (x: number, z: number) => {
  const y = -z;
  if (y < -2.9 || y > 4.1 || x < -2.45 || x > 3.1) return false;
  if (y < -2.1 && x < -1.7) return false;
  if (y < -2.4 && x > 1.8) return false;
  if (y > 2.0 && x > 1.6) return false;
  if (y > 3.1 && x > 0.3) return false;
  return true;
};

const CATTLE_POSITIONS: [number, number, number][] = (() => {
  const list: [number, number, number][] = [];
  for (let i = 1; i <= 150; i++) {
    const x = -2.3 + seeded(i * 3) * 5.1;
    const z = -2.3 + seeded(i * 7 + 11) * 5.8;
    const rot = seeded(i * 13 + 5) * Math.PI * 2;
    if (insideUruguay(x, z)) {
      list.push([x, z, rot]);
    }
    if (list.length >= 46) break;
  }
  return list;
})();

// Vaca Hereford/Angus realista (nunca blanca entera: lomo marrón rojizo Hereford o negro Angus,
// cara blanca característica Hereford, hocico rosado/oscuro y cuernos/orejas)
const LowPolyCow: React.FC<{
  position: Vec3;
  rotationY?: number;
  scale?: number;
  showTag?: number;
  breed?: "hereford" | "angus";
}> = ({ position, rotationY = 0, scale = 1, showTag = 0, breed = "hereford" }) => {
  if (scale <= 0.01) return null;
  const coatColor = breed === "hereford" ? "#8b3216" : "#1e1b18"; // Marrón rojizo Hereford o Negro Angus
  const whiteCrest = "#f8fafc";
  const muzzleColor = breed === "hereford" ? "#f4b8a4" : "#292524";

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Cuerpo principal (marrón rojizo o negro, nunca blanco entero) */}
      <mesh position={[0, 0.17, 0]} castShadow>
        <boxGeometry args={[0.28, 0.16, 0.14]} />
        <meshStandardMaterial {...MATTE} color={coatColor} />
      </mesh>
      {/* Pecho y franja ventral blanca típica Hereford */}
      {breed === "hereford" ? (
        <mesh position={[0.04, 0.11, 0]}>
          <boxGeometry args={[0.22, 0.05, 0.144]} />
          <meshStandardMaterial {...MATTE} color={whiteCrest} />
        </mesh>
      ) : null}
      {/* Cuello marrón */}
      <mesh position={[0.13, 0.2, 0]} castShadow>
        <boxGeometry args={[0.08, 0.13, 0.11]} />
        <meshStandardMaterial {...MATTE} color={coatColor} />
      </mesh>
      {/* Cabeza (blanca en Hereford, negra en Angus) */}
      <mesh position={[0.18, 0.22, 0]} castShadow>
        <boxGeometry args={[0.1, 0.11, 0.1]} />
        <meshStandardMaterial {...MATTE} color={breed === "hereford" ? whiteCrest : coatColor} />
      </mesh>
      {/* Hocico */}
      <mesh position={[0.235, 0.195, 0]}>
        <boxGeometry args={[0.03, 0.055, 0.075]} />
        <meshStandardMaterial {...MATTE} color={muzzleColor} />
      </mesh>
      {/* Orejas marrones */}
      <mesh position={[0.16, 0.25, 0.065]}>
        <boxGeometry args={[0.03, 0.03, 0.035]} />
        <meshStandardMaterial {...MATTE} color={coatColor} />
      </mesh>
      <mesh position={[0.16, 0.25, -0.065]}>
        <boxGeometry args={[0.03, 0.03, 0.035]} />
        <meshStandardMaterial {...MATTE} color={coatColor} />
      </mesh>
      {/* 4 Patas */}
      {[
        [0.09, 0.05, 0.045],
        [0.09, 0.05, -0.045],
        [-0.09, 0.05, 0.045],
        [-0.09, 0.05, -0.045],
      ].map(([px, py, pz], idx) => (
        <mesh key={idx} position={[px, py, pz]}>
          <boxGeometry args={[0.04, 0.1, 0.04]} />
          <meshStandardMaterial {...MATTE} color={coatColor} />
        </mesh>
      ))}
      {/* Caravana electrónica de trazabilidad (Escena 14) */}
      {showTag > 0.01 ? (
        <mesh position={[0.18, 0.34, 0]} scale={showTag}>
          <octahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} flatShading />
        </mesh>
      ) : null}
    </group>
  );
};

const LowPolyHuman: React.FC<{
  position: Vec3;
  color?: string;
  scale?: number;
  emissive?: number;
  hat?: boolean;
}> = ({ position, color = "#38bdf8", scale = 1, emissive = 0.25, hat = false }) => {
  if (scale <= 0.01) return null;
  const pantsColor = "#1e293b";
  const skinColor = "#fde68a";
  const hairColor = "#451a03";
  return (
    <group position={position} scale={scale}>
      {/* Pierna izquierda y zapato */}
      <mesh position={[-0.042, 0.09, 0]} castShadow>
        <boxGeometry args={[0.055, 0.18, 0.06]} />
        <meshStandardMaterial {...MATTE} color={pantsColor} />
      </mesh>
      <mesh position={[-0.042, 0.018, 0.015]}>
        <boxGeometry args={[0.058, 0.035, 0.085]} />
        <meshStandardMaterial {...MATTE} color="#0f172a" />
      </mesh>
      {/* Pierna derecha y zapato */}
      <mesh position={[0.042, 0.09, 0]} castShadow>
        <boxGeometry args={[0.055, 0.18, 0.06]} />
        <meshStandardMaterial {...MATTE} color={pantsColor} />
      </mesh>
      <mesh position={[0.042, 0.018, 0.015]}>
        <boxGeometry args={[0.058, 0.035, 0.085]} />
        <meshStandardMaterial {...MATTE} color="#0f172a" />
      </mesh>
      {/* Torso / Campera */}
      <mesh position={[0, 0.27, 0]} castShadow>
        <boxGeometry args={[0.16, 0.2, 0.095]} />
        <meshStandardMaterial {...MATTE} color={color} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Pañuelo / cuello */}
      <mesh position={[0, 0.375, 0.01]}>
        <boxGeometry args={[0.1, 0.03, 0.085]} />
        <meshStandardMaterial {...MATTE} color={hat ? "#dc2626" : "#f8fafc"} />
      </mesh>
      {/* Brazo izquierdo + mano */}
      <group position={[-0.11, 0.34, 0]} rotation={[0, 0, 0.16]}>
        <mesh position={[0, -0.075, 0]} castShadow>
          <boxGeometry args={[0.048, 0.16, 0.052]} />
          <meshStandardMaterial {...MATTE} color={color} emissive={color} emissiveIntensity={emissive * 0.8} />
        </mesh>
        <mesh position={[0, -0.165, 0]}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial {...MATTE} color={skinColor} />
        </mesh>
      </group>
      {/* Brazo derecho + mano */}
      <group position={[0.11, 0.34, 0]} rotation={[0, 0, -0.16]}>
        <mesh position={[0, -0.075, 0]} castShadow>
          <boxGeometry args={[0.048, 0.16, 0.052]} />
          <meshStandardMaterial {...MATTE} color={color} emissive={color} emissiveIntensity={emissive * 0.8} />
        </mesh>
        <mesh position={[0, -0.165, 0]}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial {...MATTE} color={skinColor} />
        </mesh>
      </group>
      {/* Cabeza */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.115, 0.12, 0.11]} />
        <meshStandardMaterial {...MATTE} color={skinColor} />
      </mesh>
      {/* Ojos orientados al frente (+Z) */}
      <mesh position={[-0.026, 0.455, 0.057]}>
        <boxGeometry args={[0.016, 0.018, 0.01]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.026, 0.455, 0.057]}>
        <boxGeometry args={[0.016, 0.018, 0.01]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Cabello o Sombrero criollo de ala ancha */}
      {hat ? (
        <group position={[0, 0.515, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.135, 0.135, 0.018, 12]} />
            <meshStandardMaterial {...MATTE} color={hairColor} />
          </mesh>
          <mesh position={[0, 0.032, 0]} castShadow>
            <cylinderGeometry args={[0.068, 0.078, 0.055, 10]} />
            <meshStandardMaterial {...MATTE} color={hairColor} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, 0.505, -0.005]} castShadow>
          <boxGeometry args={[0.122, 0.042, 0.118]} />
          <meshStandardMaterial {...MATTE} color={hairColor} />
        </mesh>
      )}
    </group>
  );
};

const WindTurbine: React.FC<{ position: Vec3; scale: number; frame: number; phase?: number }> = ({
  position,
  scale,
  frame,
  phase = 0,
}) => {
  if (scale <= 0.01) return null;
  const angle = frame * 0.09 + phase;
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.042, 1.1, 8]} />
        <meshStandardMaterial {...MATTE} color="#f8fafc" />
      </mesh>
      <mesh position={[0, 1.1, 0.04]}>
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial {...MATTE} color="#e2e8f0" />
      </mesh>
      <group position={[0, 1.1, 0.11]} rotation={[0, 0, angle]}>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rot, idx) => (
          <group key={idx} rotation={[0, 0, rot]}>
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.028, 0.52, 0.012]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.35} flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

const Arc3D: React.FC<{
  from: Vec3;
  to: Vec3;
  height: number;
  progressValue: number;
  color: string;
  radius?: number;
}> = ({ from, to, height, progressValue, color, radius = 0.035 }) => {
  const p = clamp(progressValue, 0, 1);
  const geo = useMemo(() => {
    const mid: Vec3 = [
      (from[0] + to[0]) * 0.5,
      Math.max(from[1], to[1]) + height,
      (from[2] + to[2]) * 0.5,
    ];
    const curve = new CatmullRomCurve3([
      new Vector3(...from),
      new Vector3(...mid),
      new Vector3(...to),
    ]);
    return curve.getPoints(32);
  }, [from, to, height]);

  if (p <= 0.01) return null;
  const maxIdx = Math.max(2, Math.floor(geo.length * p));
  const subPoints = geo.slice(0, maxIdx);
  const subCurve = new CatmullRomCurve3(subPoints);
  const tip = subPoints[subPoints.length - 1];

  return (
    <group>
      <mesh>
        <tubeGeometry args={[subCurve, 20, radius, 8, false]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} roughness={0.3} flatShading />
      </mesh>
      <mesh position={[tip.x, tip.y, tip.z]}>
        <sphereGeometry args={[radius * 2.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.95} />
      </mesh>
    </group>
  );
};

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  const terrainScale = track("terrain.scale", frame, 1);
  const ukScale = track("silhouette.uk", frame, 0);
  const krScale = track("silhouette.kr", frame, 0);
  const barsHeight = track("bars.height", frame, 0);
  const hazardsCross = track("hazards.cross", frame, 0);
  const riversGlow = track("rivers.glow", frame, 0.35);
  const soilFertility = track("soil.fertility", frame, 0.5);
  const humanPop = track("human.pop", frame, 1);
  const cattleRatio = track("cattle.ratio", frame, 0);
  const herdScatter = track("herd.scatter", frame, 0);
  const shipArrive = track("ship.arrive", frame, 0);
  const cattleExpansion = track("cattle.expansion", frame, 0.7);
  const fencesGrow = track("fences.grow", frame, 0);
  const workersCount = track("workers.count", frame, 1);
  const exodusFlow = track("exodus.flow", frame, 0);
  const montevideoGrowth = track("montevideo.growth", frame, 0.55);
  const railConverge = track("rail.converge", frame, 0);
  const nightMode = track("world.nightMode", frame, 0);
  const infraGrow = track("infra.grow", frame, 0);
  const costPerCapita = track("cost.perCapita", frame, 0);
  const containersStack = track("containers.stack", frame, 0);
  const ceilingPress = track("ceiling.press", frame, 0);
  const pyramidMorph = track("pyramid.morph1950to2026", frame, 0);
  const pensionWeight = track("pension.weight", frame, 0);
  const diasporaOutflow = track("diaspora.outflow", frame, 0);
  const softwareExport = track("software.export", frame, 0);
  const crossSectionReveal = track("crossSection.reveal", frame, 0);
  const aquiferGlow = track("aquifer.glow", frame, 0.4);
  const windTurbines = track("wind.turbines", frame, 0);
  const traceabilityTag = track("traceability.tag", frame, 0);
  const foodArcsLaunch = track("foodArcs.launch", frame, 0);

  // Geometrías extruidas en memoria
  const { uruguayGeo, argentinaGeo, brazilGeo, ukGeo, krGeo, rioNegroCurve, rioUruguayCurve, rioYiCurve } = useMemo(() => {
    const uShape = makeShape(URUGUAY_OUTLINE);
    const argShape = makeShape(ARGENTINA_OUTLINE);
    const braShape = makeShape(BRAZIL_OUTLINE);
    const ukShape = makeShape(UK_OUTLINE);
    const krShape = makeShape(KR_OUTLINE);

    // Curvas continuas orgánicas para los ríos (elevadas limpiamente sobre Y=0.145 sin Z-fighting)
    const rNegro = new CatmullRomCurve3([
      new Vector3(2.15, 0.155, -2.05),  // Naciente en Brasil / Cerro Largo
      new Vector3(1.15, 0.155, -1.25),  // Paso Mazangano
      new Vector3(0.15, 0.155, -0.65),  // Rincón del Bonete (San Gregorio de Polanco)
      new Vector3(-0.75, 0.155, -0.45), // Paso de los Toros / Baygorria
      new Vector3(-1.75, 0.155, -0.25), // Mercedes
      new Vector3(-2.92, 0.155, -0.12), // Desembocadura en el Río Uruguay (Soriano/Río Negro)
    ]);

    const rUruguay = new CatmullRomCurve3([
      new Vector3(-2.72, 0.155, -4.85), // Bella Unión
      new Vector3(-2.78, 0.155, -3.35), // Salto
      new Vector3(-2.85, 0.155, -1.95), // Paysandú
      new Vector3(-2.95, 0.155, -0.25), // Fray Bentos
      new Vector3(-3.05, 0.155, 0.95),  // Nueva Palmira
      new Vector3(-2.35, 0.155, 2.25),  // Confluencia Río de la Plata (Colonia)
    ]);

    const rYi = new CatmullRomCurve3([
      new Vector3(0.95, 0.152, 0.55),   // Cerro Chato / Cuchilla Grande
      new Vector3(0.05, 0.152, 0.35),   // Durazno
      new Vector3(-0.85, 0.152, -0.35), // Desembocadura en el Río Negro
    ]);

    return {
      uruguayGeo: new ExtrudeGeometry(uShape, {
        depth: 0.72,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.05,
        bevelSegments: 2,
      }),
      argentinaGeo: new ExtrudeGeometry(argShape, {
        depth: 0.55,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 1,
      }),
      brazilGeo: new ExtrudeGeometry(braShape, {
        depth: 0.58,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 1,
      }),
      ukGeo: new ExtrudeGeometry(ukShape, { depth: 0.18, bevelEnabled: false }),
      krGeo: new ExtrudeGeometry(krShape, { depth: 0.18, bevelEnabled: false }),
      rioNegroCurve: rNegro,
      rioUruguayCurve: rUruguay,
      rioYiCurve: rYi,
    };
  }, []);

  const grassColor = nightMode > 0.5 ? "#0b192c" : soilFertility > 0.7 ? "#2f9e5b" : PALETTE.ground;
  const neighborColor = nightMode > 0.5 ? "#08111e" : "#1e293b";
  const oceanColor = nightMode > 0.5 ? "#040d1a" : "#0a2742";

  return (
    <group scale={clamp(terrainScale, 0.001, 1)}>
      {/* =================================================================== */}
      {/* 1. GEOGRAFÍA DE LA CUENCA DEL PLATA (OCÉANO, ARGENTINA, BRASIL, UY) */}
      {/* =================================================================== */}
      {isVisible("uruguay-terrain", frame) ? (
        <group>
          {/* Gran bloque oceánico infinito (Océano Atlántico Sur y Estuario del Río de la Plata, sin bordes visibles en cámara) */}
          <mesh position={[0, -0.52, 0]} receiveShadow>
            <boxGeometry args={[90.0, 0.55, 90.0]} />
            <meshStandardMaterial {...MATTE} color={oceanColor} roughness={0.35} />
          </mesh>

          {/* Masa continental vecina: ARGENTINA al Oeste (separada por el Río Uruguay y el Río de la Plata) */}
          <group position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh geometry={argentinaGeo} position={[0, 0, -0.55]} receiveShadow>
              <meshStandardMaterial {...MATTE} color={neighborColor} roughness={0.85} />
            </mesh>
          </group>

          {/* Masa continental vecina: BRASIL (Rio Grande do Sul) al Norte y Noreste */}
          <group position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh geometry={brazilGeo} position={[0, 0, -0.58]} receiveShadow>
              <meshStandardMaterial {...MATTE} color={neighborColor} roughness={0.85} />
            </mesh>
          </group>

          {/* =============================================================== */}
          {/* CORTE HIDROGEOLÓGICO FRONTAL DEL ACUÍFERO GUARANÍ               */}
          {/* (En Escena 13 el bloque de Uruguay se eleva 0.9u revelando      */}
          {/* debajo la reserva gigante de agua dulce iluminada en azul cian) */}
          {/* =============================================================== */}
          {(isVisible("guarani-aquifer", frame) || crossSectionReveal > 0.01) ? (
            <group position={[0, 0.02, 0]}>
              {/* Estrato luminoso del Acuífero Guaraní con la silueta exacta de Uruguay emergiendo bajo el suelo */}
              <group position={[0, -0.58 + 0.48 * crossSectionReveal, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh geometry={uruguayGeo} position={[0, 0, -0.55]}>
                  <meshStandardMaterial
                    color="#0ea5e9"
                    emissive="#0284c7"
                    emissiveIntensity={0.65 + aquiferGlow * 0.75 * (0.7 + 0.3 * pulse(frame, 24))}
                    roughness={0.18}
                  />
                </mesh>
              </group>
              {/* Columnas hidrotermales / manantiales conectando el acuífero con la superficie elevada */}
              {[
                [-2.1, -2.2],
                [-1.1, -1.0],
                [0.2, -1.6],
                [1.1, -0.4],
                [-0.3, 0.8],
              ].map(([wx, wz], idx) => (
                <mesh key={idx} position={[wx, 0.35 * crossSectionReveal, wz]} scale={[1, crossSectionReveal, 1]}>
                  <cylinderGeometry args={[0.08, 0.11, 0.95, 10]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.1} />
                </mesh>
              ))}
            </group>
          ) : null}

          {/* Territorio de URUGUAY en relieve destacado (se eleva en vista explotada durante la Escena 13 para mostrar el Acuífero Guaraní debajo) */}
          <group position={[0, 0.08 + crossSectionReveal * 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh geometry={uruguayGeo} position={[0, 0, -0.72]} receiveShadow castShadow>
              <meshStandardMaterial {...MATTE} color={grassColor} />
            </mesh>
          </group>
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 2. RED HIDROGRÁFICA ORGÁNICA (Río Uruguay, Río Negro y Río Yí)      */}
      {/* =================================================================== */}
      {isVisible("rivers-network", frame) ? (
        <group position={[0, crossSectionReveal * 0.82, 0]}>
          {/* Río Negro (cruza de Noreste a Suroeste sin interrupciones ni glitches) */}
          <mesh>
            <tubeGeometry args={[rioNegroCurve, 44, 0.065, 10, false]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.3 + riversGlow * 0.65}
              roughness={0.2}
            />
          </mesh>
          {/* Embalse de Rincón del Bonete en el centro del país */}
          <mesh position={[0.05, 0.145, -0.62]} scale={[1.35, 0.04, 0.75]}>
            <cylinderGeometry args={[0.42, 0.42, 1, 20]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0ea5e9"
              emissiveIntensity={0.35 + riversGlow * 0.6}
              roughness={0.2}
            />
          </mesh>
          {/* Río Uruguay (frontera oeste con Argentina) */}
          <mesh>
            <tubeGeometry args={[rioUruguayCurve, 44, 0.085, 10, false]} />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0284c7"
              emissiveIntensity={0.35 + riversGlow * 0.55}
              roughness={0.2}
            />
          </mesh>
          {/* Río Yí (afluente principal) */}
          <mesh>
            <tubeGeometry args={[rioYiCurve, 28, 0.042, 8, false]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.25 + riversGlow * 0.55}
              roughness={0.2}
            />
          </mesh>
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 3. ESCENA 1: SILUETAS COMPARADAS (UK / COREA) Y BARRAS DEMOGRÁFICAS */}
      {/* =================================================================== */}
      {isVisible("silhouette-uk", frame) && ukScale > 0.01 ? (
        <group position={[-4.8, 0.4 + (1 - ukScale) * 1.4, -0.3]} scale={ukScale} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={ukGeo} castShadow>
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.45}
              transparent
              opacity={0.88}
              flatShading
            />
          </mesh>
        </group>
      ) : null}

      {isVisible("silhouette-kr", frame) && krScale > 0.01 ? (
        <group position={[4.8, 0.4 + (1 - krScale) * 1.4, -0.2]} scale={krScale} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={krGeo} castShadow>
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#d97706"
              emissiveIntensity={0.45}
              transparent
              opacity={0.88}
              flatShading
            />
          </mesh>
        </group>
      ) : null}

      {isVisible("pop-bars-compare", frame) && barsHeight > 0.01 ? (
        <group position={[0, 0.15, 0]}>
          {/* Columna estilizada de Inglaterra + Gales (57,1M hab.) */}
          <group position={[-4.8, 0.35, -0.3]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.26, 0.3, 0.04, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.45} />
            </mesh>
            <mesh position={[0, (3.2 * barsHeight) / 2, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.14, Math.max(0.05, 3.2 * barsHeight), 12]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.45} flatShading />
            </mesh>
            <mesh position={[0, 3.2 * barsHeight, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.85} />
            </mesh>
          </group>
          {/* Columna estilizada de Corea del Sur (51,7M hab.) */}
          <group position={[4.8, 0.35, -0.2]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.26, 0.3, 0.04, 16]} />
              <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.45} />
            </mesh>
            <mesh position={[0, (2.9 * barsHeight) / 2, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.14, Math.max(0.05, 2.9 * barsHeight), 12]} />
              <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.45} flatShading />
            </mesh>
            <mesh position={[0, 2.9 * barsHeight, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.85} />
            </mesh>
          </group>
          {/* Columna baja proporcional de Uruguay (3,49M hab.) */}
          <group position={[0.2, 0.15, 1.2]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.26, 0.3, 0.04, 16]} />
              <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, (0.36 * barsHeight) / 2, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.15, Math.max(0.05, 0.36 * barsHeight), 12]} />
              <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.55} flatShading />
            </mesh>
            <mesh position={[0, 0.36 * barsHeight, 0]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color="#dcfce7" emissive="#22c55e" emissiveIntensity={0.85} />
            </mesh>
          </group>
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 4. ESCENA 2: ICONOS DE OBSTÁCULOS GEOGRÁFICOS DESCARTADOS           */}
      {/* =================================================================== */}
      {isVisible("climate-hazards", frame) && hazardsCross > 0.01 ? (
        <group position={[0, 0.9, -0.4]} scale={hazardsCross}>
          <group position={[-3.8, 0.4, 0]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <coneGeometry args={[0.75, 1.3, 6]} />
              <meshStandardMaterial {...MATTE} color="#64748b" />
            </mesh>
            <mesh position={[0, 0.65, 0.5]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[1.5, 0.16, 0.16]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 0.65, 0.5]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[1.5, 0.16, 0.16]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
          </group>
          <group position={[4.0, 0.4, 0]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <dodecahedronGeometry args={[0.68, 0]} />
              <meshStandardMaterial {...MATTE} color="#d97706" />
            </mesh>
            <mesh position={[0, 0.5, 0.5]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[1.5, 0.16, 0.16]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 0.5, 0.5]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[1.5, 0.16, 0.16]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
          </group>
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 5. ESCENA 3: 1 HUMANO VS. 4 VACAS (HEREFORD Y ANGUS REALISTAS)      */}
      {/* =================================================================== */}
      {isVisible("human-figure", frame) ? (
        <group position={[0.1, 0.15, 1.05]}>
          <LowPolyHuman position={[0, 0, 0]} scale={humanPop * 1.45} color="#38bdf8" emissive={0.45} />
          {/* 4 vacas Hereford y Angus rodeando al habitante (marrón rojizo con cara blanca y negro Angus) */}
          {[
            [-0.68, 0, 0.28, 0.5, "hereford"],
            [0.68, 0, 0.28, 2.6, "angus"],
            [-0.48, 0, -0.52, -0.6, "hereford"],
            [0.48, 0, -0.52, -2.4, "hereford"],
          ].map(([cx, cy, cz, rot, br], idx) => (
            <LowPolyCow
              key={idx}
              position={[cx as number, cy as number, cz as number]}
              rotationY={rot as number}
              scale={cattleRatio * 1.35}
              breed={br as "hereford" | "angus"}
            />
          ))}
        </group>
      ) : null}

      {isVisible("cattle-herd", frame) ? (
        <group position={[0, 0.15 + crossSectionReveal * 0.82, 0]}>
          {CATTLE_POSITIONS.map(([x, z, rot], idx) => {
            const threshold = idx / CATTLE_POSITIONS.length;
            const activeFactor = Math.max(herdScatter, cattleExpansion, traceabilityTag > 0 ? 0.9 : 0);
            const cowScale = clamp((activeFactor - threshold * 0.75) * 3.2, 0, 1);
            return (
              <LowPolyCow
                key={idx}
                position={[x, 0, z]}
                rotationY={rot}
                scale={cowScale * 0.92}
                showTag={traceabilityTag}
                breed={idx % 3 === 0 ? "angus" : "hereford"}
              />
            );
          })}
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 6. ESCENA 4: GALEÓN COLONIAL DE HERNANDARIAS (1611)                 */}
      {/* =================================================================== */}
      {isVisible("colonial-ship", frame) && shipArrive > 0.01 ? (
        <group
          position={[
            lerp(-4.8, -2.55, shipArrive),
            -0.18 + 0.025 * Math.sin(frame * 0.08),
            lerp(3.2, 2.05, shipArrive),
          ]}
          rotation={[0, 0.65, 0.03 * Math.sin(frame * 0.07)]}
          scale={clamp(shipArrive * 2, 0, 1.15)}
        >
          {/* Quilla y obra viva sumergida */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.86, 0.12, 0.32]} />
            <meshStandardMaterial {...MATTE} color="#451a03" />
          </mesh>
          {/* Casco principal de madera */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.98, 0.18, 0.42]} />
            <meshStandardMaterial {...MATTE} color="#78350f" />
          </mesh>
          {/* Proa afilada triangular (+X) y bauprés */}
          <mesh position={[0.62, 0.21, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.21, 0.34, 4]} />
            <meshStandardMaterial {...MATTE} color="#78350f" />
          </mesh>
          <mesh position={[0.82, 0.3, 0]} rotation={[0, 0, -1.18]}>
            <cylinderGeometry args={[0.015, 0.024, 0.48, 6]} />
            <meshStandardMaterial {...MATTE} color="#451a03" />
          </mesh>
          {/* Cubierta clara y castillo de popa elevado (-X) */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.92, 0.03, 0.38]} />
            <meshStandardMaterial {...MATTE} color="#d97706" />
          </mesh>
          <mesh position={[-0.34, 0.36, 0]} castShadow>
            <boxGeometry args={[0.32, 0.18, 0.4]} />
            <meshStandardMaterial {...MATTE} color="#92400e" />
          </mesh>
          {/* Palo mayor + vela mayor henchida + cofa y banderín */}
          <mesh position={[0.06, 0.72, 0]}>
            <cylinderGeometry args={[0.022, 0.03, 0.96, 8]} />
            <meshStandardMaterial {...MATTE} color="#451a03" />
          </mesh>
          <mesh position={[0.13, 0.72, 0]} rotation={[0, 0, -0.06]} castShadow>
            <boxGeometry args={[0.05, 0.56, 0.62]} />
            <meshStandardMaterial {...MATTE} color="#fef3c7" />
          </mesh>
          <mesh position={[0.06, 1.22, 0]}>
            <boxGeometry args={[0.18, 0.07, 0.02]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.4} />
          </mesh>
          {/* Palo de trinquete en proa + segunda vela */}
          <mesh position={[0.38, 0.58, 0]}>
            <cylinderGeometry args={[0.018, 0.024, 0.68, 8]} />
            <meshStandardMaterial {...MATTE} color="#451a03" />
          </mesh>
          <mesh position={[0.44, 0.6, 0]} rotation={[0, 0, -0.06]} castShadow>
            <boxGeometry args={[0.04, 0.38, 0.44]} />
            <meshStandardMaterial {...MATTE} color="#fef3c7" />
          </mesh>
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 7. ESCENAS 5 Y 6: ALAMBRAMIENTO DE ESTANCIAS (FINO Y REALISTA)      */}
      {/* =================================================================== */}
      {isVisible("wire-fences", frame) && fencesGrow > 0.01 ? (
        <group position={[0, 0.15, 0]}>
          {[-1.5, -0.5, 0.5, 1.5].map((x, xi) => (
            <group key={`fx-${xi}`} position={[x, 0, 0.2]} scale={[1, fencesGrow, 1]}>
              {/* 3 hilos finos de alambre de acero */}
              {[0.08, 0.14, 0.2].map((hy, hi) => (
                <mesh key={hi} position={[0, hy, 0]}>
                  <boxGeometry args={[0.012, 0.012, 3.4 * fencesGrow]} />
                  <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.4} />
                </mesh>
              ))}
              {/* Postes de quebracho */}
              {[-1.5, -0.75, 0, 0.75, 1.5].map((z, zi) => (
                <mesh key={zi} position={[0, 0.12, z]} castShadow>
                  <cylinderGeometry args={[0.024, 0.028, 0.26, 6]} />
                  <meshStandardMaterial {...MATTE} color="#5c2808" />
                </mesh>
              ))}
            </group>
          ))}
          {[-1.0, 0.0, 1.0, 1.7].map((z, zi) => (
            <group key={`fz-${zi}`} position={[0, 0, z]} scale={[1, fencesGrow, 1]}>
              {[0.08, 0.14, 0.2].map((hy, hi) => (
                <mesh key={hi} position={[0, hy, 0]}>
                  <boxGeometry args={[3.2 * fencesGrow, 0.012, 0.012]} />
                  <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.4} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ) : null}

      {isVisible("gaucho-workers", frame) ? (
        <group position={[0, 0.16, 0]}>
          {[
            [-1.2, 0, 0.6],
            [-0.2, 0, 1.3],
            [0.8, 0, 0.5],
            [1.1, 0, 1.4],
            [-0.9, 0, -0.4],
            [0.3, 0, -0.5],
            [1.4, 0, -0.2],
          ].map(([gx, gy, gz], idx) => {
            const keep = idx === 0 ? 1 : clamp((workersCount - idx * 0.13) * 4, 0, 1);
            return (
              <LowPolyHuman
                key={idx}
                position={[gx, gy, gz]}
                scale={keep * 0.95}
                color={idx === 0 ? "#22c55e" : "#f59e0b"}
                hat={true}
              />
            );
          })}
        </group>
      ) : null}

      {isVisible("rancherios-edge", frame) ? (
        <group position={[0, 0.16, 0]}>
          {[
            [-1.7, 0.08, 0.95],
            [-1.55, 0.08, 1.05],
            [1.55, 0.08, 0.85],
            [1.7, 0.08, 0.95],
            [-0.4, 0.08, -1.3],
          ].map(([rx, ry, rz], i) => (
            <mesh key={i} position={[rx, ry, rz]} castShadow>
              <boxGeometry args={[0.16, 0.14, 0.16]} />
              <meshStandardMaterial {...MATTE} color="#9a3412" />
            </mesh>
          ))}
        </group>
      ) : null}

      {isVisible("exodus-arrows", frame) && exodusFlow > 0.01 ? (
        <group position={[0, 0.28, 0]}>
          <Arrow3D from={[-1.4, 0.1, -0.8]} dir={[0.45, 0, 0.89]} length={2.9 * exodusFlow} color="#ef4444" radius={0.065} />
          <Arrow3D from={[0.1, 0.1, -1.2]} dir={[0.12, 0, 0.99]} length={3.2 * exodusFlow} color="#ef4444" radius={0.065} />
          <Arrow3D from={[1.6, 0.1, -0.4]} dir={[-0.36, 0, 0.93]} length={2.7 * exodusFlow} color="#ef4444" radius={0.065} />
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 8. ESCENAS 6, 7, 8, 15: MACROCEFALIA DE MONTEVIDEO Y RED RADIAL     */}
      {/* =================================================================== */}
      {isVisible("rail-fan", frame) && railConverge > 0.01 ? (
        <group position={[0, 0.18, 0]}>
          {[
            [-2.2, 0, -2.5],
            [-0.6, 0, -2.8],
            [1.1, 0, -1.8],
            [2.1, 0, -0.6],
            [-1.9, 0, 1.4],
          ].map(([tx, ty, tz], i) => (
            <Arc3D
              key={i}
              from={[tx, ty, tz]}
              to={[0.45, 0.1, 2.85]}
              height={0.12}
              progressValue={railConverge}
              color="#f59e0b"
              radius={0.032}
            />
          ))}
        </group>
      ) : null}

      {isVisible("montevideo-spire", frame) ? (
        <group position={[0.45, 0.15, 2.85]}>
          <mesh position={[0, 0.03, -0.1]} receiveShadow>
            <cylinderGeometry args={[0.95, 1.15, 0.06, 24]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.45 + 0.35 * nightMode}
              transparent
              opacity={0.75}
            />
          </mesh>
          <mesh position={[0, (2.5 * montevideoGrowth) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.38, Math.max(0.1, 2.5 * montevideoGrowth), 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.55 + 0.35 * pulse(frame, 22)}
              roughness={0.25}
              flatShading
            />
          </mesh>
          {[
            [-0.38, -0.18, 0.9],
            [0.38, -0.15, 0.85],
            [-0.25, 0.25, 0.7],
            [0.3, 0.2, 0.75],
          ].map(([bx, bz, h], idx) => (
            <mesh key={idx} position={[bx, (h * montevideoGrowth) / 2, bz]} castShadow>
              <boxGeometry args={[0.18, Math.max(0.06, h * montevideoGrowth), 0.18]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.45}
                flatShading
              />
            </mesh>
          ))}
        </group>
      ) : null}

      {isVisible("night-lights", frame) && nightMode > 0.05 ? (
        <group position={[0, 0.18, 0]}>
          <mesh position={[0.45, 0.04, 2.85]}>
            <sphereGeometry args={[0.55 * nightMode, 16, 16]} />
            <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.2 * nightMode} />
          </mesh>
          {[
            [-2.3, -2.1],
            [-2.4, -0.8],
            [0.6, -2.6],
            [1.6, 2.4],
            [-1.7, 1.8],
            [-0.2, 0.4],
          ].map(([lx, lz], idx) => (
            <mesh key={idx} position={[lx, 0.04, lz]}>
              <sphereGeometry args={[0.075 * nightMode, 8, 8]} />
              <meshStandardMaterial color="#fde047" emissive="#eab308" emissiveIntensity={0.85 * nightMode} />
            </mesh>
          ))}
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 9. ESCENA 9: INFRAESTRUCTURA PER CÁPITA                             */}
      {/* =================================================================== */}
      {isVisible("infra-network", frame) && infraGrow > 0.01 ? (
        <group position={[0, 0.18, 0]}>
          {[
            [-2.1, 0, -2.2],
            [-0.4, 0, -2.5],
            [1.4, 0, -1.4],
            [2.0, 0, 0.3],
            [-1.8, 0, 0.8],
          ].map(([nx, ny, nz], idx) => (
            <Arc3D
              key={idx}
              from={[0.45, 0.08, 2.8]}
              to={[nx, ny + 0.05, nz]}
              height={0.08}
              progressValue={infraGrow}
              color={costPerCapita > 0.4 ? "#ef4444" : "#38bdf8"}
              radius={0.036}
            />
          ))}
          {[
            [-1.5, -1.4],
            [-0.3, -1.6],
            [0.9, -0.8],
            [1.2, 0.4],
            [-1.1, 0.5],
          ].map(([px, pz], idx) => (
            <group key={idx} position={[px, 0, pz]} scale={infraGrow}>
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
                <meshStandardMaterial
                  color={costPerCapita > 0.4 ? "#f59e0b" : "#38bdf8"}
                  emissive={costPerCapita > 0.4 ? "#ef4444" : "#0284c7"}
                  emissiveIntensity={0.55}
                />
              </mesh>
            </group>
          ))}
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 10. ESCENA 10: TERMINAL PORTUARIA DE MONTEVIDEO Y TECHO DE ESCALA   */}
      {/* =================================================================== */}
      {isVisible("port-containers", frame) && containersStack > 0.01 ? (
        <group position={[0.45, 0.14, 2.95]} scale={containersStack}>
          {/* Muelle de hormigón sobre la bahía de Montevideo */}
          <mesh position={[0, -0.02, 0.35]} receiveShadow>
            <boxGeometry args={[1.95, 0.12, 1.35]} />
            <meshStandardMaterial {...MATTE} color="#475569" />
          </mesh>
          {/* Buque portacontenedores atracado al sur del muelle (casco oscuro, obra viva roja y puente blanco) */}
          <group position={[0, 0.02, 1.32]}>
            <mesh position={[0, 0.02, 0]} castShadow>
              <boxGeometry args={[2.1, 0.24, 0.56]} />
              <meshStandardMaterial {...MATTE} color="#0f172a" />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[2.14, 0.1, 0.58]} />
              <meshStandardMaterial {...MATTE} color="#991b1b" />
            </mesh>
            <mesh position={[0.72, 0.26, 0]} castShadow>
              <boxGeometry args={[0.36, 0.32, 0.46]} />
              <meshStandardMaterial {...MATTE} color="#f8fafc" />
            </mesh>
            {[
              [-0.55, 0.22, 0, "#ef4444"],
              [-0.18, 0.22, 0, "#38bdf8"],
              [0.18, 0.22, 0, "#f59e0b"],
            ].map(([bx, by, bz, bcol], bi) => (
              <mesh key={bi} position={[bx as number, by as number, bz as number]} castShadow>
                <boxGeometry args={[0.3, 0.18, 0.42]} />
                <meshStandardMaterial {...MATTE} color={bcol as string} />
              </mesh>
            ))}
          </group>
          {/* Pilas de contenedores sobre el muelle */}
          {[
            [-0.45, 0.14, 0.2, "#ef4444"],
            [-0.45, 0.36, 0.2, "#f59e0b"],
            [-0.1, 0.14, 0.25, "#38bdf8"],
            [-0.1, 0.36, 0.25, "#ef4444"],
            [0.25, 0.14, 0.2, "#22c55e"],
            [0.25, 0.36, 0.2, "#38bdf8"],
          ].map(([cx, cy, cz, col], i) => (
            <mesh key={i} position={[cx as number, cy as number, cz as number]} castShadow>
              <boxGeometry args={[0.28, 0.2, 0.48]} />
              <meshStandardMaterial {...MATTE} color={col as string} />
            </mesh>
          ))}
        </group>
      ) : null}

      {isVisible("market-ceiling", frame) && ceilingPress > 0.01 ? (
        <group position={[0.45, 1.45 - ceilingPress * 0.4, 2.85]}>
          <mesh>
            <cylinderGeometry args={[1.45, 1.45, 0.09, 24]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
              emissiveIntensity={0.45}
              transparent
              opacity={0.55 * ceilingPress}
            />
          </mesh>
          <Arrow3D from={[0, 0.85, 0]} dir={[0, -1, 0]} length={0.7} color="#ef4444" scale={ceilingPress} />
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 11. ESCENA 11: PIRÁMIDE DEMOGRÁFICA 3D (1950 -> 2026 INVERTIDA)     */}
      {/* =================================================================== */}
      {isVisible("demographic-pyramid", frame) ? (
        <group position={[-1.4, 0.2, 0.85]} rotation={[0, 0.28, 0]}>
          {[0, 1, 2, 3, 4, 5, 6].map((tier) => {
            const w1950 = 2.0 - tier * 0.25;
            const w2026 = 0.72 + tier * 0.2;
            const widthTier = lerp(w1950, w2026, pyramidMorph);
            const isSenior = tier >= 4;
            const barColor = isSenior
              ? pyramidMorph > 0.5
                ? "#ef4444"
                : "#f59e0b"
              : "#38bdf8";
            return (
              <mesh
                key={tier}
                position={[0, tier * 0.25 + 0.13 - (isSenior ? pensionWeight * 0.05 : 0), 0]}
                castShadow
              >
                <boxGeometry args={[widthTier, 0.2, 0.34]} />
                <meshStandardMaterial
                  color={barColor}
                  emissive={barColor}
                  emissiveIntensity={0.3}
                  flatShading
                />
              </mesh>
            );
          })}
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 12. ESCENA 12: ARCOS DE EMIGRACIÓN Y HACES DIGITALES DE SOFTWARE    */}
      {/* =================================================================== */}
      {isVisible("diaspora-arcs", frame) && diasporaOutflow > 0.01 ? (
        <group>
          <Arc3D from={[0.45, 0.3, 2.85]} to={[4.8, 1.8, -3.2]} height={2.2} progressValue={diasporaOutflow} color="#ef4444" radius={0.045} />
          <Arc3D from={[0.45, 0.3, 2.85]} to={[-4.6, 1.9, -2.8]} height={2.0} progressValue={diasporaOutflow} color="#f59e0b" radius={0.045} />
          <Arc3D from={[0.45, 0.3, 2.85]} to={[-3.8, 0.8, 3.6]} height={1.4} progressValue={diasporaOutflow} color="#ef4444" radius={0.04} />
        </group>
      ) : null}

      {isVisible("software-beams", frame) && softwareExport > 0.01 ? (
        <group>
          <Arc3D from={[0.45, 0.5, 2.85]} to={[-4.2, 2.4, -2.5]} height={2.5} progressValue={softwareExport} color="#38bdf8" radius={0.05} />
          <Arc3D from={[0.45, 0.5, 2.85]} to={[4.5, 2.3, -2.6]} height={2.5} progressValue={softwareExport} color="#22c55e" radius={0.05} />
          <Arc3D from={[0.45, 0.5, 2.85]} to={[4.2, 1.6, 2.2]} height={1.9} progressValue={softwareExport} color="#38bdf8" radius={0.045} />
        </group>
      ) : null}

      {/* =================================================================== */}
      {/* 13. ESCENAS 13, 14, 15: PARQUES EÓLICOS Y EXPORTACIÓN DE ALIMENTOS  */}
      {/* (Sube y baja solidariamente con el terreno de Uruguay en Escena 13) */}
      {/* =================================================================== */}
      {isVisible("wind-turbines", frame) ? (
        <group position={[0, 0.16 + crossSectionReveal * 0.82, 0]}>
          {[
            [-0.8, 0, -1.5, 0],
            [0.6, 0, -1.2, 1.1],
            [1.5, 0, 0.2, 2.2],
            [1.2, 0, 1.6, 3.3],
            [-1.3, 0, 0.7, 4.4],
            [0.1, 0, 0.5, 5.5],
          ].map(([wx, wy, wz, ph], idx) => (
            <WindTurbine
              key={idx}
              position={[wx, wy, wz]}
              scale={clamp(windTurbines || 0.85, 0, 1)}
              frame={frame}
              phase={ph}
            />
          ))}
        </group>
      ) : null}

      {isVisible("global-food-arcs", frame) && foodArcsLaunch > 0.01 ? (
        <group>
          <Arc3D from={[0.2, 0.25, 0.4]} to={[-5.0, 2.1, -2.2]} height={2.4} progressValue={foodArcsLaunch} color="#22c55e" radius={0.055} />
          <Arc3D from={[-0.6, 0.25, -0.8]} to={[5.1, 2.2, -2.4]} height={2.6} progressValue={foodArcsLaunch} color="#22c55e" radius={0.055} />
          <Arc3D from={[1.1, 0.25, 0.9]} to={[4.8, 1.7, 2.5]} height={2.1} progressValue={foodArcsLaunch} color="#4ade80" radius={0.05} />
          <Arc3D from={[-1.2, 0.25, 0.6]} to={[-4.5, 1.5, 2.6]} height={1.9} progressValue={foodArcsLaunch} color="#4ade80" radius={0.05} />
        </group>
      ) : null}
    </group>
  );
};
