import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { useCurrentFrame } from "remotion";
import { scenes } from "../data/scenes";
import { CAMERA } from "../theme";
import { EASE, lerp, progress, type EaseName, type Vec3 } from "../utils/animation";
import { HEIGHT, WIDTH } from "../utils/timing";

// Cámara única del diorama. Las poses clave de todas las escenas forman una pista global;
// entre dos claves la cámara interpola en coordenadas orbitales (objetivo, distancia, acimut,
// elevación), de modo que dollies y órbitas describen arcos suaves en lugar de cortar camino.

export type CameraPose = { position: Vec3; target: Vec3; fov: number };

type Spherical = { target: Vec3; distance: number; azimuth: number; elevation: number; zoom: number };

const toSpherical = (position: Vec3, target: Vec3, zoom: number): Spherical => {
  const dx = position[0] - target[0];
  const dy = position[1] - target[1];
  const dz = position[2] - target[2];
  const distance = Math.hypot(dx, dy, dz);
  return { target, distance, azimuth: Math.atan2(dx, dz), elevation: Math.asin(dy / distance), zoom };
};

const KEYS = scenes
  .flatMap((sc) => sc.camera.keys.map((k) => ({ frame: sc.startFrame + k.at, easing: (k.easing ?? "inOut") as EaseName, ...toSpherical(k.position, k.target, k.zoom ?? 1) })))
  .sort((a, b) => a.frame - b.frame);

const fovFor = (zoom: number) => (2 * Math.atan(Math.tan(((CAMERA.fov / 2) * Math.PI) / 180) / zoom) * 180) / Math.PI;

/** Pose de la cámara en el fotograma global (función pura — también usada para anclar etiquetas 2D). */
export const cameraPoseAt = (frame: number): CameraPose => {
  let a = KEYS[0];
  let b = KEYS[0];
  for (let i = 0; i < KEYS.length; i++) {
    if (KEYS[i].frame <= frame) a = KEYS[i];
    if (KEYS[i].frame > frame) {
      b = KEYS[i];
      break;
    }
    b = KEYS[i];
  }
  const t = b.frame > a.frame ? progress(frame, a.frame, b.frame, EASE[b.easing]) : 1;
  const target: Vec3 = [lerp(a.target[0], b.target[0], t), lerp(a.target[1], b.target[1], t), lerp(a.target[2], b.target[2], t)];
  const distance = Math.exp(lerp(Math.log(a.distance), Math.log(b.distance), t));
  // deriva lenta y continua: la cámara nunca queda totalmente estática
  const azimuth = lerp(a.azimuth, b.azimuth, t) + 0.012 * Math.sin(frame / 41);
  const elevation = lerp(a.elevation, b.elevation, t) + 0.006 * Math.sin(frame / 33 + 1.3);
  const zoom = lerp(a.zoom, b.zoom, t);
  return { position: sphericalToPosition(target, distance, azimuth, elevation), target, fov: fovFor(zoom) };
};

export const sphericalToPosition = (target: Vec3, distance: number, azimuth: number, elevation: number): Vec3 => [
  target[0] + distance * Math.sin(azimuth) * Math.cos(elevation),
  target[1] + distance * Math.sin(elevation),
  target[2] + distance * Math.cos(azimuth) * Math.cos(elevation),
];

const scratch = new PerspectiveCamera();
const v = new Vector3();

/** Proyecta un punto del mundo a píxeles de la pantalla, dada una pose y el tamaño del viewport. */
export const projectPoint = (pose: CameraPose, point: Vec3, width = WIDTH, height = HEIGHT) => {
  scratch.fov = pose.fov;
  scratch.aspect = width / height;
  scratch.near = CAMERA.near;
  scratch.far = CAMERA.far;
  scratch.position.set(...pose.position);
  scratch.lookAt(...pose.target);
  scratch.updateProjectionMatrix();
  scratch.updateMatrixWorld(true);
  v.set(...point).project(scratch);
  return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height, visible: v.z < 1 };
};

/** Aplica una pose a la cámara del canvas antes de que el fotograma sea dibujado. */
export const usePose = (pose: CameraPose) => {
  const camera = useThree((st) => st.camera) as PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pose.position);
    camera.fov = pose.fov;
    camera.near = CAMERA.near;
    camera.far = CAMERA.far;
    camera.lookAt(...pose.target);
    camera.updateProjectionMatrix();
  }, [camera, pose]);
};

export const CameraController: React.FC = () => {
  const frame = useCurrentFrame();
  usePose(cameraPoseAt(frame));
  return null;
};
