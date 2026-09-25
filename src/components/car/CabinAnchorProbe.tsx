import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber/native';

export interface Point2D {
  x: number;
  y: number;
}

export interface AirflowGeom {
  polygon: Point2D[];
  dash: Point2D;
  cabin: Point2D;
  spread: number;
}

// Interior cabin volume in world space (car auto-fitted to length 5.0, roof 1.5).
// Kept low: dashboard/infotainment height down to seat-belt line — the airflow
// band runs from the screen to stomach level of the front seat, never the roof.
interface ProbeConfig {
  box: { x: number; yMin: number; yMax: number; zMin: number; zMax: number };
  dash: THREE.Vector3;
  cabin: THREE.Vector3;
  spreadA: THREE.Vector3;
  spreadB: THREE.Vector3;
}

// Home: approved ambient band from the screen line back through the cabin.
const HOME_CONFIG: ProbeConfig = {
  box: { x: 0.55, yMin: 0.98, yMax: 1.26, zMin: -0.15, zMax: 1.15 },
  dash: new THREE.Vector3(0, 1.08, -0.05),
  cabin: new THREE.Vector3(0, 1.02, 1.0),
  spreadA: new THREE.Vector3(0, 1.06, -0.05),
  spreadB: new THREE.Vector3(0.5, 1.06, -0.05),
};

// Climate full view (spec): vent slot behind wheel/screen (steering z -0.75..-0.51,
// windscreen rear edge z -0.22) flowing to the front headrests.
const CLIMATE_CONFIG: ProbeConfig = {
  box: { x: 0.78, yMin: 0.95, yMax: 1.3, zMin: -0.55, zMax: 0.55 },
  dash: new THREE.Vector3(0, 1.02, -0.38),
  cabin: new THREE.Vector3(0, 1.08, 0.42),
  spreadA: new THREE.Vector3(-0.78, 1.05, -0.38),
  spreadB: new THREE.Vector3(0.78, 1.05, -0.38),
};

// Defrost: same vent origin, streams aimed forward at the windshield
// (windscreen spans z -1.46..-0.22, y 0.88..1.41).
const DEFROST_CONFIG: ProbeConfig = {
  box: { x: 0.7, yMin: 0.95, yMax: 1.35, zMin: -1.3, zMax: -0.25 },
  dash: new THREE.Vector3(0, 1.02, -0.38),
  cabin: new THREE.Vector3(0, 1.12, -1.0),
  spreadA: new THREE.Vector3(-0.7, 1.05, -0.38),
  spreadB: new THREE.Vector3(0.7, 1.05, -0.38),
};

const buildCorners = (cfg: ProbeConfig): THREE.Vector3[] => {
  const corners: THREE.Vector3[] = [];
  for (const x of [-cfg.box.x, cfg.box.x]) {
    for (const y of [cfg.box.yMin, cfg.box.yMax]) {
      for (const z of [cfg.box.zMin, cfg.box.zMax]) {
        corners.push(new THREE.Vector3(x, y, z));
      }
    }
  }
  return corners;
};

const HOME_CORNERS = buildCorners(HOME_CONFIG);
const CLIMATE_CORNERS = buildCorners(CLIMATE_CONFIG);
const DEFROST_CORNERS = buildCorners(DEFROST_CONFIG);

const RECOMPUTE_INTERVAL = 0.15;
const MOVE_EPSILON = 0.6;
const INSET = 0.88;

const convexHull = (points: Point2D[]): Point2D[] => {
  const pts = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  const cross = (o: Point2D, a: Point2D, b: Point2D) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point2D[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point2D[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
};

interface CabinAnchorProbeProps {
  active: boolean;
  variant: 'home' | 'climate' | 'defrost';
  onChange: (geom: AirflowGeom | null) => void;
}

// Lives INSIDE the R3F canvas: projects the cabin interior volume through the
// live camera and reports its screen-space region (px within the canvas).
export const CabinAnchorProbe: React.FC<CabinAnchorProbeProps> = ({
  active,
  variant,
  onChange,
}) => {
  const { camera, size, scene } = useThree();
  const accRef = useRef(0);
  const lastRef = useRef<AirflowGeom | null>(null);
  const scratch = useRef(new THREE.Vector3()).current;
  const root = useRef(new THREE.Object3D()).current;

  const toScreen = (world: THREE.Vector3): Point2D => {
    scratch.copy(world).applyMatrix4(root.matrixWorld).project(camera);
    return {
      x: ((scratch.x + 1) / 2) * size.width,
      y: ((1 - scratch.y) / 2) * size.height,
    };
  };

  useFrame((_, delta) => {
    if (!active) return;
    accRef.current += delta;
    if (accRef.current < RECOMPUTE_INTERVAL) return;
    accRef.current = 0;

    const car = scene.getObjectByName('tesla-car-root');
    if (!car) return;
    root.matrixWorld.copy(car.matrixWorld);

    const cfg =
      variant === 'climate'
        ? CLIMATE_CONFIG
        : variant === 'defrost'
          ? DEFROST_CONFIG
          : HOME_CONFIG;
    const corners =
      variant === 'climate'
        ? CLIMATE_CORNERS
        : variant === 'defrost'
          ? DEFROST_CORNERS
          : HOME_CORNERS;

    const projected = corners.map(toScreen);
    const hull = convexHull(projected);
    const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
    const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
    const polygon = hull.map((p) => ({
      x: cx + (p.x - cx) * INSET,
      y: cy + (p.y - cy) * INSET,
    }));

    const dash = toScreen(cfg.dash);
    const cabin = toScreen(cfg.cabin);
    const spread = Math.hypot(
      toScreen(cfg.spreadB).x - toScreen(cfg.spreadA).x,
      toScreen(cfg.spreadB).y - toScreen(cfg.spreadA).y
    );

    const next: AirflowGeom = { polygon, dash, cabin, spread };

    const last = lastRef.current;
    if (last && sameGeom(last, next)) return;
    lastRef.current = next;
    onChange(next);
  });

  return null;
};

const sameGeom = (a: AirflowGeom, b: AirflowGeom) => {
  if (a.polygon.length !== b.polygon.length) return false;
  for (let i = 0; i < a.polygon.length; i++) {
    if (
      Math.abs(a.polygon[i].x - b.polygon[i].x) > MOVE_EPSILON ||
      Math.abs(a.polygon[i].y - b.polygon[i].y) > MOVE_EPSILON
    )
      return false;
  }
  return (
    Math.hypot(a.dash.x - b.dash.x, a.dash.y - b.dash.y) < MOVE_EPSILON &&
    Math.hypot(a.cabin.x - b.cabin.x, a.cabin.y - b.cabin.y) < MOVE_EPSILON &&
    Math.abs(a.spread - b.spread) < MOVE_EPSILON
  );
};
