import { Composition } from "remotion";
import { MainSequence } from "./MainSequence";
import { ThumbnailConcept1 } from "./scenes/ThumbnailConcept1";
import { DURATION, FPS, HEIGHT, WIDTH } from "./utils/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UruguayPaisVacio"
        component={MainSequence}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ThumbnailConcept1"
        component={ThumbnailConcept1}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
