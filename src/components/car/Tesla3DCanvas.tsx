import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { Tesla3DCarModel } from './Tesla3DCarModel';
import { TeslaSvgCarCanvas } from './TeslaSvgCarCanvas';
import { useTesla } from '../../context/TeslaContext';

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
const TOP_POS = new THREE.Vector3(0, 11.5, 0.001);
const TOP_LOOK = new THREE.Vector3(0, 0, 0);
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

  return (
    <View style={styles.canvasContainer}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [-3.6, 2.2, -5.85], fov: 35 }}
      >
        <color attach="background" args={['#121214']} />
        <CameraRig />
        <React.Suspense fallback={null}>
          <Tesla3DCarModel />
        </React.Suspense>
      </Canvas>

      {/* Touch Overlays for Top-Down Controls View */}
      {viewMode === 'controls' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableOpacity style={[styles.actionPill, styles.frunkPill]} onPress={toggleFrunk}>
            <Text style={styles.pillText}>{state.frunkOpen ? 'Close' : 'Open'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.lockOverlayPill} onPress={toggleLock}>
            <Text style={styles.lockIconText}>{state.isLocked ? '🔒' : '🔓'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionPill, styles.trunkPill]} onPress={toggleTrunk}>
            <Text style={styles.pillText}>{state.trunkOpen ? 'Close' : 'Open'}</Text>
          </TouchableOpacity>
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
  actionPill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  frunkPill: {
    top: 30,
  },
  trunkPill: {
    bottom: 30,
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  lockOverlayPill: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lockIconText: {
    fontSize: 20,
  },
});
