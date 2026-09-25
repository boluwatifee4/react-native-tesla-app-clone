import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';
import { useTesla } from '../../context/TeslaContext';

import { Asset } from 'expo-asset';

// Resolve the GLB model asset URI for Expo / React Native
const rawModel = require('../../../assets/models/tesla_model_3.glb');
const asset = Asset.fromModule(rawModel);
const assetUri = asset.localUri || asset.uri || rawModel;

useGLTF.preload(assetUri);

const TARGET_LENGTH = 5.0;

type DoorKey = 'frontLeft' | 'frontRight' | 'rearLeft' | 'rearRight';

const DOOR_PIVOTS: Record<DoorKey, { nodeName: string; sign: number }> = {
  frontLeft: { nodeName: 'door_lf_dummy', sign: -1 },
  frontRight: { nodeName: 'door_rf_dummy', sign: 1 },
  rearLeft: { nodeName: 'door_lr_dummy', sign: -1 },
  rearRight: { nodeName: 'door_rr_dummy', sign: 1 },
};

const DOOR_OPEN_ANGLE = 0.7;

const LID_OPEN_ANGLE = 0.85;

const SEAT_WARM_TINT = new THREE.Color('#FF4A2E');
const SEAT_GLOW_BACKUP = new WeakMap<THREE.Material, THREE.Color>();

type TapAction =
  | { type: 'door'; key: DoorKey }
  | { type: 'frunk' }
  | { type: 'trunk' };

const findTapAction = (obj: THREE.Object3D | null, scene: THREE.Object3D): TapAction | null => {
  let current: THREE.Object3D | null = obj;
  while (current) {
    const name = current.name || '';
    if (name.includes('door_lf')) return { type: 'door', key: 'frontLeft' };
    if (name.includes('door_rf')) return { type: 'door', key: 'frontRight' };
    if (name.includes('door_lr')) return { type: 'door', key: 'rearLeft' };
    if (name.includes('door_rr')) return { type: 'door', key: 'rearRight' };
    if (name.includes('bonnet')) return { type: 'frunk' };
    if (name.includes('boot')) return { type: 'trunk' };
    if (current === scene) break;
    current = current.parent;
  }
  return null;
};

const createShadowTexture = (): THREE.DataTexture => {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  const coreHalfWidth = 0.55;
  const coreHalfLength = 0.78;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = ((x + 0.5) / size) * 2 - 1;
      const v = ((y + 0.5) / size) * 2 - 1;
      const dc = Math.pow(
        Math.pow(Math.abs(u) / coreHalfWidth, 4) + Math.pow(Math.abs(v) / coreHalfLength, 4),
        0.25
      );
      const core = Math.pow(Math.max(0, 1 - dc), 0.45);
      const db = Math.sqrt(u * u + v * v);
      const broad = Math.pow(Math.max(0, 1 - db), 2.4) * 0.55;
      const alpha = Math.min(1, 0.68 * core + broad);
      const i = (y * size + x) * 4;
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = Math.round(alpha * 255);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
};

export const Tesla3DCarModel: React.FC = () => {
  const { state, viewMode, toggleDoor, toggleFrunk, toggleTrunk } = useTesla();
  const gltf = useGLTF(assetUri) as any;
  const scene = gltf.scene;
  const carGroupRef = useRef<THREE.Group>(null);

  const fit = useMemo(() => {
    try {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = size.z > 0 ? TARGET_LENGTH / size.z : 0.01;
      return { center, size, scale, lift: (size.y / 2) * scale };
    } catch (e) {
      console.log('TESLA3DDEBUG fit error', String(e));
      return {
        center: new THREE.Vector3(),
        size: new THREE.Vector3(),
        scale: 0.01,
        lift: 0.7,
      };
    }
  }, [scene]);

  const shadowTexture = useMemo(() => createShadowTexture(), []);

  const pivotsRef = useRef<{
    doors: Partial<Record<DoorKey, THREE.Object3D>>;
    frunk?: THREE.Object3D;
    trunk?: THREE.Object3D;
  }>({ doors: {} });

  useEffect(() => {
    const doors: Partial<Record<DoorKey, THREE.Object3D>> = {};
    (Object.keys(DOOR_PIVOTS) as DoorKey[]).forEach((key) => {
      const node = scene?.getObjectByName(DOOR_PIVOTS[key].nodeName);
      if (node) doors[key] = node;
    });
    pivotsRef.current = {
      doors,
      frunk: scene?.getObjectByName('bonnet_dummy'),
      trunk: scene?.getObjectByName('boot_dummy'),
    };
  }, [scene]);

  useEffect(() => {
    console.log('TESLA3DDEBUG scene?', !!scene, 'children', scene?.children?.length);
    console.log(
      'TESLA3DDEBUG size',
      fit.size.x.toFixed(2),
      fit.size.y.toFixed(2),
      fit.size.z.toFixed(2),
      'center',
      fit.center.x.toFixed(2),
      fit.center.y.toFixed(2),
      fit.center.z.toFixed(2),
      'scale',
      fit.scale.toFixed(3),
      'lift',
      fit.lift.toFixed(3)
    );
  }, [fit]);


  // Apply custom paint color dynamically to all body meshes in the 3D model
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const matName = (mesh.material as THREE.Material).name.toLowerCase();
          // Check for paint/body material names in GLTF
          if (
            matName.includes('paint') ||
            matName.includes('body') ||
            matName.includes('car_paint') ||
            matName.includes('primary')
          ) {
            (mesh.material as THREE.MeshStandardMaterial).color.set(state.carColor);
          }
        }
      }
    });
  }, [scene, state.carColor]);

  // Heated seats: warm tint + emissive glow on the seat leather, scaled by
  // the highest seat level (0 restores the original color).
  useEffect(() => {
    if (!scene) return;
    const levels = state.seatHeaters;
    const maxLevel = Math.max(
      levels.driver,
      levels.passenger,
      levels.rearLeft,
      levels.rearCenter,
      levels.rearRight
    );
    let matched = 0;
    scene.traverse((child: any) => {
      if (!child.isMesh || !child.material) return;
      const materials: any[] = Array.isArray(child.material)
        ? child.material
        : [child.material];
      for (const mat of materials) {
        if (!mat || !mat.color || !('emissive' in mat)) continue;
        const label = `${mat.name || ''} ${child.name || ''}`.toLowerCase();
        if (!label.includes('seat') && !label.includes('leather')) continue;
        matched += 1;
        if (!SEAT_GLOW_BACKUP.has(mat)) {
          SEAT_GLOW_BACKUP.set(mat, mat.color.clone());
        }
        const base = SEAT_GLOW_BACKUP.get(mat) as THREE.Color;
        if (maxLevel > 0) {
          mat.color.copy(base).lerp(SEAT_WARM_TINT, maxLevel * 0.18);
          mat.emissive.set('#FF3B30');
          mat.emissiveIntensity = maxLevel * 0.28;
        } else {
          mat.color.copy(base);
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
        }
      }
    });
    console.log('[TESLA3DDEBUG] seat glow level', maxLevel, 'matched', matched);
  }, [scene, state.seatHeaters]);

  // Smooth door swing / driving tilt animation
  useFrame((_, delta) => {
    const pivots = pivotsRef.current;
    const doorT = 1 - Math.exp(-12 * delta);
    (Object.keys(DOOR_PIVOTS) as DoorKey[]).forEach((key) => {
      const pivot = pivots.doors[key];
      if (!pivot) return;
      const target = state.doors[key] ? DOOR_OPEN_ANGLE * DOOR_PIVOTS[key].sign : 0;
      pivot.rotation.z = THREE.MathUtils.lerp(pivot.rotation.z, target, doorT);
    });

    if (pivots.frunk) {
      const target = state.frunkOpen ? LID_OPEN_ANGLE : 0;
      pivots.frunk.rotation.x = THREE.MathUtils.lerp(
        pivots.frunk.rotation.x,
        target,
        doorT
      );
    }
    if (pivots.trunk) {
      const target = state.trunkOpen ? -LID_OPEN_ANGLE : 0;
      pivots.trunk.rotation.x = THREE.MathUtils.lerp(
        pivots.trunk.rotation.x,
        target,
        doorT
      );
    }

    if (carGroupRef.current) {
      const t = 1 - Math.exp(-4 * delta);
      if (viewMode === 'driving') {
        // Slight dynamic pitch tilt during movement
        carGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          carGroupRef.current.rotation.x,
          Math.sin(Date.now() * 0.005) * 0.02,
          t
        );
      } else {
        carGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          carGroupRef.current.rotation.x,
          0,
          t
        );
      }
    }
  });

  return (
    <>
      <group ref={carGroupRef} name="tesla-car-root">
        {/* Lighting setup */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 15, 10]} intensity={2.5} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={1.2} />
        <pointLight position={[0, 5, 0]} intensity={1.0} />

        <group position={[0, fit.lift, 0]} scale={fit.scale}>
          <group position={[-fit.center.x, -fit.center.y, -fit.center.z]}>
            {/* Render the full 3D Tesla Model 3 GLTF scene */}
            <primitive
              object={scene}
              onPointerDown={(e: any) => {
                e.stopPropagation();
                const hit = (e.object as THREE.Object3D | undefined) ?? null;
                const action = findTapAction(hit, scene);
                console.log(
                  'TESLA3DDEBUG tap',
                  hit?.name,
                  '->',
                  action
                    ? action.type === 'door'
                      ? `door:${action.key}`
                      : action.type
                    : 'none'
                );
                if (!action) return;
                if (action.type === 'door') toggleDoor(action.key);
                else if (action.type === 'frunk') toggleFrunk();
                else toggleTrunk();
              }}
            />
          </group>
        </group>
      </group>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 7.0]} />
        <meshBasicMaterial map={shadowTexture} transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </>
  );
};
