import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber/native';
import type { Point2D } from './CabinAnchorProbe';

export interface CarPillAnchors {
  frunk: Point2D;
  trunk: Point2D;
  lock: Point2D;
}

// World-space anchor points on the car body (length 5.0, nose at z -2.5).
const FRUNK = new THREE.Vector3(0, 0.95, -1.7);
const TRUNK = new THREE.Vector3(0, 1.1, 2.1);
const LOCK = new THREE.Vector3(0, 1.5, 0.35);

const RECOMPUTE_INTERVAL = 0.15;
const MOVE_EPSILON = 0.75;

interface CarAnchorProbeProps {
  active: boolean;
  onChange: (anchors: CarPillAnchors | null) => void;
}

// Lives INSIDE the R3F canvas: projects frunk/trunk/lock points through the
// live camera so overlay pills can sit on the car itself.
export const CarAnchorProbe: React.FC<CarAnchorProbeProps> = ({ active, onChange }) => {
  const { camera, size, scene } = useThree();
  const accRef = useRef(0);
  const lastRef = useRef<CarPillAnchors | null>(null);
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

    const next: CarPillAnchors = {
      frunk: toScreen(FRUNK),
      trunk: toScreen(TRUNK),
      lock: toScreen(LOCK),
    };

    const last = lastRef.current;
    if (
      last &&
      Math.hypot(last.frunk.x - next.frunk.x, last.frunk.y - next.frunk.y) < MOVE_EPSILON &&
      Math.hypot(last.trunk.x - next.trunk.x, last.trunk.y - next.trunk.y) < MOVE_EPSILON &&
      Math.hypot(last.lock.x - next.lock.x, last.lock.y - next.lock.y) < MOVE_EPSILON
    ) {
      return;
    }
    lastRef.current = next;
    onChange(next);
  });

  return null;
};
