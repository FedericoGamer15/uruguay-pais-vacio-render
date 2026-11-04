import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ExtrudeGeometry, Shape } from "three";
import { useMemo } from "react";
import { Lighting } from "../components/Lighting";
import { FONT, MATTE } from "../theme";

// Composición dedicada para la Miniatura de YouTube elegida por el usuario:
// Concepto 1 — "El Fuego Solitario en la Oscuridad (Estilo RealLifeLore / NASA Night Lights)"
// Título: "Por qué el país más habitable de Sudamérica está casi vacío"

const URUGUAY_OUTLINE: [number, number][] = [
  [-2.6, 4.9],
  [-0.8, 4.5],
  [0.9, 3.3],
  [2.5, 1.9],
  [3.9, 0.6],
  [3.5, -1.0],
  [2.6, -2.3],
  [1.6, -3.2],
  [0.5, -3.35],
  [-0.7, -3.0],
  [-2.1, -2.3],
  [-3.0, -1.3],
  [-2.9, 0.3],
  [-2.8, 1.9],
  [-2.7, 3.4],
];

const makeShape = (pts: [number, number][]) => {
  const s = new Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
};

export const ThumbnailConcept1: React.FC = () => {
  const { width, height } = useVideoConfig();
  const geo = useMemo(
    () =>
      new ExtrudeGeometry(makeShape(URUGUAY_OUTLINE), {
        depth: 0.85,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2,
      }),
    [],
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(1200px 800px at 64% 58%, #102a45 0%, #050d1a 55%, #02060d 100%)",
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      {/* Mapa 3D nocturno estilo NASA Black Marble */}
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ antialias: true }}
        shadows="percentage"
        flat
        camera={{ fov: 32, near: 0.1, far: 150, position: [4.2, 11.5, 13.8] }}
      >
        <Lighting shadowExtent={14} />
        <group position={[2.1, -0.3, 0.2]} rotation={[0.18, -0.25, 0]}>
          {/* Silueta oscura de Uruguay en relieve 3D */}
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh geometry={geo} position={[0, 0, -0.85]} receiveShadow castShadow>
              <meshStandardMaterial {...MATTE} color="#0b192e" roughness={0.65} />
            </mesh>
          </group>

          {/* Contorno luminoso cian/dorado de la frontera */}
          <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} scale={1.025}>
            <mesh geometry={geo} position={[0, 0, -0.88]}>
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.75}
                transparent
                opacity={0.35}
              />
            </mesh>
          </group>

          {/* Foco incandescente masivo en Montevideo (Sur) */}
          <group position={[0.48, 0.15, 2.85]}>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.35, 1.55, 0.08, 32]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={1.2}
                transparent
                opacity={0.55}
              />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <cylinderGeometry args={[0.32, 0.55, 1.7, 24]} />
              <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.6} />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.65, 24, 24]} />
              <meshStandardMaterial color="#ffffff" emissive="#fde047" emissiveIntensity={2.0} />
            </mesh>
          </group>

          {/* Pequeños destellos casi invisibles en el interior */}
          {[
            [-2.3, -2.1],
            [-2.4, -0.8],
            [0.6, -2.6],
            [1.6, 2.4],
          ].map(([lx, lz], i) => (
            <mesh key={i} position={[lx, 0.14, lz]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshStandardMaterial color="#fde047" emissive="#eab308" emissiveIntensity={0.9} />
            </mesh>
          ))}
        </group>
      </ThreeCanvas>

      {/* Tipografía de alto impacto (Izquierda) */}
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 96,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 920,
        }}
      >
        <div
          style={{
             alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: 999,
            background: "rgba(239, 68, 68, 0.92)",
            border: "3px solid #fecaca",
            color: "#ffffff",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 1.5,
            boxShadow: "0 12px 30px rgba(239,68,68,0.45)",
          }}
        >
          LA ANOMALÍA DE SUDAMÉRICA
        </div>

        <div
          style={{
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 0.94,
            color: "#ffffff",
            letterSpacing: -2,
            textShadow: "0 12px 36px rgba(0,0,0,0.85)",
          }}
        >
          ¿POR QUÉ ESTÁ
          <br />
          <span style={{ color: "#facc15" }}>CASI VACÍO?</span>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxWidth: 640,
          }}
        >
          <div
            style={{
              padding: "18px 26px",
              borderRadius: 18,
              background: "rgba(9, 20, 36, 0.88)",
              border: "3px solid #38bdf8",
              color: "#f8fafc",
              fontSize: 34,
              fontWeight: 800,
              boxShadow: "0 14px 32px rgba(0,0,0,0.55)",
            }}
          >
            90% TIERRA FÉRTIL · <span style={{ color: "#38bdf8" }}>SOLO 3,49M HAB.</span>
          </div>
          <div
            style={{
              padding: "18px 26px",
              borderRadius: 18,
              background: "rgba(9, 20, 36, 0.88)",
              border: "3px solid #f59e0b",
              color: "#f8fafc",
              fontSize: 34,
              fontWeight: 800,
              boxShadow: "0 14px 32px rgba(0,0,0,0.55)",
            }}
          >
            <span style={{ color: "#facc15" }}>4 VACAS</span> POR CADA PERSONA
          </div>
        </div>
      </div>

      {/* Etiquetas señalando el mapa 3D nocturno (Derecha) */}
      <div
        style={{
          position: "absolute",
          right: 110,
          top: 170,
          padding: "18px 28px",
          borderRadius: 18,
          background: "rgba(15, 23, 42, 0.92)",
          border: "4px solid #ef4444",
          color: "#ffffff",
          fontSize: 34,
          fontWeight: 900,
          textAlign: "center",
          boxShadow: "0 16px 36px rgba(0,0,0,0.7)",
        }}
      >
        95% DEL TERRITORIO
        <div style={{ fontSize: 24, color: "#fca5a5", fontWeight: 800, marginTop: 4 }}>
          CASI DESHABITADO (&lt; 5 HAB/KM²)
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 120,
          bottom: 115,
          padding: "18px 28px",
          borderRadius: 18,
          background: "rgba(15, 23, 42, 0.92)",
          border: "4px solid #facc15",
          color: "#ffffff",
          fontSize: 34,
          fontWeight: 900,
          textAlign: "center",
          boxShadow: "0 16px 36px rgba(250, 204, 21, 0.35)",
        }}
      >
        MONTEVIDEO (~60%)
        <div style={{ fontSize: 24, color: "#fde047", fontWeight: 800, marginTop: 4 }}>
          HIPERCONCENTRACIÓN URBANA
        </div>
      </div>
    </AbsoluteFill>
  );
};
