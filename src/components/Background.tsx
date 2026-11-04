import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { SKY } from "../theme";
import { clamp } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";

// Fondo atmosférico detrás del diorama 3D: se oscurece cuando la cámara desciende al subsuelo
// o cuando la escena activa el modo satelital nocturno (world.nightMode).
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const camY = cameraPoseAt(frame).position[1];
  const night = track("world.nightMode", frame, 0);
  const diveT = clamp((1.5 - camY) / 4.0, 0, 1);
  const t = clamp(Math.max(diveT, night), 0, 1);
  const c = SKY.surface.map((top, i) => interpolateColors(t, [0, 1], [top, SKY.underground[i]]));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${c[0]} 0%, ${c[1]} 52%, ${c[2]} 100%)` }} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 50%, rgba(56,232,255,0.08) 0%, rgba(0,0,0,0) 58%, rgba(2,6,14,0.48) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
