import type { ScenePlan } from "../data/scenes";

/** Cada escena provee extras 3D (dentro del canvas del diorama) y/o una capa 2D. */
export type SceneProps = { scene: ScenePlan };

export type SceneModule = {
  Stage?: React.FC<SceneProps>;
  Overlay?: React.FC<SceneProps>;
};
