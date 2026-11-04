import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Soundtrack } from "./audio/Soundtrack";
import { AnimatedCaptions } from "./components/AnimatedCaptions";
import { Background } from "./components/Background";
import { CameraController } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { BadgeLayer } from "./components/TechnicalBadge";
import { World } from "./components/World";
import { scenes, track } from "./data/scenes";
import { URUGUAY_SCENE_MODULES } from "./scenes/ExampleScenes";
import { CAMERA } from "./theme";

// Orquesta el videoensayo documental a partir del arreglo tipado de 15 escenas (src/data/scenes.ts):
// un único canvas 3D con el diorama persistente de Uruguay + extras 3D de cada escena,
// y por encima las capas 2D de cada escena (WorldLabel, cabeceras de capítulo), insignias, subtítulos y audio.

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = track("fade", frame);
  if (fade <= 0.001) return null;
  return <AbsoluteFill style={{ background: "#050b14", opacity: fade }} />;
};

export const MainSequence: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0e2036" }}>
      <Background />
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ antialias: true }}
        shadows="percentage"
        flat
        camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [8, 6, 30] }}
      >
        <CameraController />
        <Lighting shadowExtent={12} />
        <World />
        {scenes.map((sc) => {
          const Stage = URUGUAY_SCENE_MODULES[sc.id]?.Stage;
          return Stage ? (
            <Sequence key={sc.id} name={`3D · ${sc.id}`} from={sc.startFrame} durationInFrames={sc.durationInFrames} layout="none">
              <Stage scene={sc} />
            </Sequence>
          ) : null;
        })}
      </ThreeCanvas>
      {scenes.map((sc) => {
        const Overlay = URUGUAY_SCENE_MODULES[sc.id]?.Overlay;
        return (
          <Sequence key={sc.id} name={sc.id} from={sc.startFrame} durationInFrames={sc.durationInFrames}>
            {Overlay ? <Overlay scene={sc} /> : null}
            <BadgeLayer badges={sc.badges} />
          </Sequence>
        );
      })}
      <AnimatedCaptions />
      <FadeOut />
      <Soundtrack />
    </AbsoluteFill>
  );
};
