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
const BOX_X = 0.55;
const BOX_Y_MIN = 0.98;
const BOX_Y_MAX = 1.26;
const BOX_Z_MIN = -0.15;
const BOX_Z_MAX = 1.15;

const DASH = new THREE.Vector3(0, 1.08, -0.05);
const CABIN = new THREE.Vector3(0, 1.02, 1.0);
const SPREAD_A = new THREE.Vector3(0, 1.06, -0.05);
const SPREAD_B = new THREE.Vector3(0.5, 1.06, -0.05);

const CORNERS: THREE.Vector3[] = [];
for (const x of [-BOX_X, BOX_X]) {
  for (const y of [BOX_Y_MIN, BOX_Y_MAX]) {
    for (const z of [BOX_Z_MIN, BOX_Z_MAX]) {
      CORNERS.push(new THREE.Vector3(x, y, z));
    }
  }
}

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
  onChange: (geom: AirflowGeom | null) => void;
}

// Lives INSIDE the R3F canvas: projects the cabin interior volume through the
// live camera and reports its screen-space region (px within the canvas).
export const CabinAnchorProbe: React.FC<CabinAnchorProbeProps> = ({ active, onChange }) => {
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

    const projected = CORNERS.map(toScreen);
    const hull = convexHull(projected);
    const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
    const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
    const polygon = hull.map((p) => ({
      x: cx + (p.x - cx) * INSET,
      y: cy + (p.y - cy) * INSET,
    }));

    const dash = toScreen(DASH);
    const cabin = toScreen(CABIN);
    const spread = Math.hypot(
      toScreen(SPREAD_B).x - toScreen(SPREAD_A).x,
      toScreen(SPREAD_B).y - toScreen(SPREAD_A).y
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
