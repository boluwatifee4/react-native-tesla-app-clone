import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { Tesla3DCarModel } from './Tesla3DCarModel';
import { CabinAirflowOverlay } from './CabinAirflowOverlay';
import { CabinAnchorProbe } from './CabinAnchorProbe';
import type { AirflowGeom } from './CabinAnchorProbe';
import { CarAnchorProbe } from './CarAnchorProbe';
import type { CarPillAnchors } from './CarAnchorProbe';
import { TeslaSvgCarCanvas } from './TeslaSvgCarCanvas';
import { Lock, Unlock } from 'lucide-react-native';
import { useTesla } from '../../context/TeslaContext';
import { canvasHeightFor } from '../../utils/layout';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeJSErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ThreeJS canvas fallback triggered:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const HOME_POS = new THREE.Vector3(-3.6, 2.2, -5.85);
const HOME_LOOK = new THREE.Vector3(0, 0.6, 0);
// Top-down full view: car fills ~67% of the canvas (≈52% of screen height,
// i.e. 25% smaller than the previous pass). Look target shifted toward the
// tail so the car sits a bit higher, leaving room for the bottom sheet.
const TOP_POS = new THREE.Vector3(0, 11.75, 0.001);
const TOP_LOOK = new THREE.Vector3(0, 0, 0.65);
const DRIVE_POS = new THREE.Vector3(-3.5, 1.5, -6.5);
const DRIVE_LOOK = new THREE.Vector3(0, 0.7, -1);
const UP_Y = new THREE.Vector3(0, 1, 0);
const UP_Z = new THREE.Vector3(0, 0, -1);
const scratchPos = new THREE.Vector3();
const scratchLook = new THREE.Vector3();
const scratchUp = new THREE.Vector3();

// Frame-rate independent, always-bounded smoothing (factor is always < 1, no clamp needed)
const smoothFactor = (delta: number, rate: number) => 1 - Math.exp(-rate * delta);

// Camera Rig that smoothly lerps position based on active screen mode
const CameraRig: React.FC = () => {
  const { viewMode } = useTesla();
  const { camera } = useThree();

  useEffect(() => {
    console.log(
      'TESLA3DDEBUG cam',
      camera.position.toArray().map((v) => v.toFixed(2)).join(','),
      'fov',
      (camera as any).fov
    );
  }, [camera]);

  useFrame((_, delta) => {
    scratchPos.copy(HOME_POS);
    scratchLook.copy(HOME_LOOK);
    scratchUp.copy(UP_Y);

    if (viewMode === 'controls' || viewMode === 'climate') {
      scratchPos.copy(TOP_POS); // Top-down sky view, nose pointing up
      scratchLook.copy(TOP_LOOK);
      scratchUp.copy(UP_Z);
    } else if (viewMode === 'driving') {
      scratchPos.copy(DRIVE_POS); // Driving simulator perspective
      scratchLook.copy(DRIVE_LOOK);
    }

    const t = smoothFactor(delta, 5);
    camera.position.lerp(scratchPos, t);
    camera.up.lerp(scratchUp, t).normalize();
    camera.lookAt(scratchLook);
  });

  return null;
};

const ThreeJSCanvasContent: React.FC = () => {
  const { state, viewMode, toggleFrunk, toggleTrunk, toggleLock } = useTesla();
  const [airflowGeom, setAirflowGeom] = useState<AirflowGeom | null>(null);
  const [pillAnchors, setPillAnchors] = useState<CarPillAnchors | null>(null);
  const airflowActive = viewMode === 'home' && state.climateActive;
  const { height: windowH } = useWindowDimensions();
  const canvasHeight = canvasHeightFor(viewMode, windowH);
  const pillsActive = viewMode === 'controls';

  return (
    <View style={[styles.canvasContainer, { height: canvasHeight }]}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [-3.6, 2.2, -5.85], fov: 35 }}
      >
        <color attach="background" args={['#121214']} />
        <CameraRig />
        <React.Suspense fallback={null}>
          <Tesla3DCarModel />
        </React.Suspense>
        <CabinAnchorProbe active={airflowActive} onChange={setAirflowGeom} />
        <CarAnchorProbe active={pillsActive} onChange={setPillAnchors} />
      </Canvas>

      {/* Climate airflow, clipped to the projected cabin interior */}
      {airflowActive && airflowGeom && (
        <CabinAirflowOverlay
          geom={airflowGeom}
          heating={state.isHeating}
          speed={state.fanSpeed}
        />
      )}

      {/* Pills anchored on the frunk / trunk / roof of the car itself */}
      {pillsActive && pillAnchors && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View
            style={[
              styles.pillAnchor,
              { left: pillAnchors.frunk.x, top: pillAnchors.frunk.y, marginLeft: -44, marginTop: -17 },
            ]}
          >
            <TouchableOpacity style={styles.actionPill} onPress={toggleFrunk}>
              <Text style={styles.pillText}>{state.frunkOpen ? 'Close' : 'Open'}</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.pillAnchor,
              { left: pillAnchors.trunk.x, top: pillAnchors.trunk.y, marginLeft: -44, marginTop: -17 },
            ]}
          >
            <TouchableOpacity style={styles.actionPill} onPress={toggleTrunk}>
              <Text style={styles.pillText}>{state.trunkOpen ? 'Close' : 'Open'}</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.pillAnchor,
              { left: pillAnchors.lock.x, top: pillAnchors.lock.y, marginLeft: -22, marginTop: -22 },
            ]}
          >
            <TouchableOpacity style={styles.lockOverlayPill} onPress={toggleLock}>
              {state.isLocked ? (
                <Lock color="#FFFFFF" size={20} strokeWidth={1.8} />
              ) : (
                <Unlock color="#FFFFFF" size={20} strokeWidth={1.8} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export const Tesla3DCanvas: React.FC = () => {
  return (
    <ThreeJSErrorBoundary fallback={<TeslaSvgCarCanvas />}>
      <ThreeJSCanvasContent />
    </ThreeJSErrorBoundary>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    height: 300,
    width: '100%',
    backgroundColor: '#121214',
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  pillAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPill: {
    width: 88,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  lockOverlayPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
