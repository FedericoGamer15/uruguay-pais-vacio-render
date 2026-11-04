import { FONT, PALETTE } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { HEIGHT, WIDTH } from "../utils/timing";
import { projectPoint, type CameraPose } from "./CameraController";

// Etiqueta 2D nítida anclada a un punto 3D (proyectado con la misma pose de la cámara del fotograma).

export type WorldLabelProps = {
  pose: CameraPose;
  point: Vec3;
  text: string;
  /** 0→1 entrada. */
  appear: number;
  /** desplazamiento de la etiqueta en relación al punto, en px. */
  offset?: [number, number];
  accent?: string;
  size?: number;
  viewport?: { width: number; height: number };
};

export const WorldLabel: React.FC<WorldLabelProps> = ({ pose, point, text, appear, offset = [0, -90], accent = PALETTE.accent, size = 32, viewport = { width: WIDTH, height: HEIGHT } }) => {
  if (appear <= 0.001) return null;
  const p = projectPoint(pose, point, viewport.width, viewport.height);
  if (!p.visible) return null;
  const a = clamp(appear, 0, 1);
  // Clamping automático de zona segura: evita que la etiqueta choque con la insignia superior (Y < 168),
  // con los subtítulos inferiores (Y > viewport.height - 190) o se corte en los bordes laterales.
  const rawLx = p.x + offset[0] * a;
  const rawLy = p.y + offset[1] * a;
  const lx = clamp(rawLx, 230, viewport.width - 230);
  const ly = clamp(rawLy, 172, viewport.height - 195);
  const len = Math.hypot(lx - p.x, ly - p.y);
  const ang = (Math.atan2(ly - p.y, lx - p.x) * 180) / Math.PI;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: viewport.width, height: viewport.height, pointerEvents: "none", opacity: clamp(appear * 1.5, 0, 1) }}>
      <div
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          width: len,
          height: 4,
          background: "rgba(255,255,255,0.92)",
          transformOrigin: "0 50%",
          rotate: `${ang}deg`,
          translate: "0px -2px",
          boxShadow: "0 0 0 2px rgba(10,20,32,0.55)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: p.x - 9,
          top: p.y - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          background: accent,
          border: "3px solid #ffffff",
          boxShadow: "0 0 0 2px rgba(10,20,32,0.6)",
          scale: String(clamp(appear * 1.4, 0, 1.15)),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: lx,
          top: ly,
          translate: "-50% -50%",
          scale: String(0.7 + 0.3 * a),
          padding: `${size * 0.28}px ${size * 0.55}px`,
          borderRadius: size * 0.5,
          background: "rgba(10, 20, 32, 0.86)",
          border: `3px solid ${accent}`,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.08,
          color: "#ffffff",
          whiteSpace: "pre",
          textAlign: "center",
          boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
          letterSpacing: 0.4,
        }}
      >
        {text}
      </div>
    </div>
  );
};
