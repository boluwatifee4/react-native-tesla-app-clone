import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Mask,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import type { AirflowGeom } from './CabinAnchorProbe';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const RIPPLE_PERIOD = 60;
const RIPPLE_DASH = '26 34';
const RIPPLE_OPACITY = 0.1;

// Spec colors: frosted silver-white for cooling, crimson/copper for heating.
const COOL = { core: '#EBF0FF', edge: '#FFFFFF', coreOpacity: 0.36 };
const WARM = { core: '#DC3228', edge: '#B41E14', coreOpacity: 0.4 };

// Dual-column lobes: one over each front seat, recessed gap on the console.
const LOBE_RY = 0.38;
const RIPPLE_OFFSETS = [-0.1, 0.1];

interface LobeTune {
  lobeOffset: number;
  lobeRxScale: number;
  maskAxial: boolean;
}

// Home keeps the approved ambient look; climate follows the spec exactly:
// full vent-to-headrest span, lobes centered over the seat cushions, and the
// axial 0/15/60/100% opacity profile masked over the plumes.
const HOME_TUNE: LobeTune = { lobeOffset: 0.5, lobeRxScale: 0.44, maskAxial: false };
const CLIMATE_TUNE: LobeTune = { lobeOffset: 0.56, lobeRxScale: 0.5, maskAxial: true };
const DEFROST_TUNE: LobeTune = { lobeOffset: 0.5, lobeRxScale: 0.5, maskAxial: true };

interface CabinAirflowOverlayProps {
  geom: AirflowGeom;
  heating: boolean;
  speed: number;
  variant?: 'home' | 'climate' | 'defrost';
}

export const CabinAirflowOverlay: React.FC<CabinAirflowOverlayProps> = ({
  geom,
  heating,
  speed,
  variant = 'home',
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: Math.round(7000 / Math.max(1, speed)),
        easing: Easing.linear,
      }),
      -1,
      false
    );
    return () => cancelAnimation(progress);
  }, [speed, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: -RIPPLE_PERIOD * progress.value,
  }));

  const scene = useMemo(() => {
    const tune =
      variant === 'climate'
        ? CLIMATE_TUNE
        : variant === 'defrost'
          ? DEFROST_TUNE
          : HOME_TUNE;
    const ax = geom.cabin.x - geom.dash.x;
    const ay = geom.cabin.y - geom.dash.y;
    const length = Math.max(32, Math.hypot(ax, ay));
    const angle = (Math.atan2(ay, ax) * 180) / Math.PI;
    const half = Math.max(8, geom.spread / 2);

    const lobeRx = length * tune.lobeRxScale;
    const lobeRy = half * LOBE_RY;
    const lobeCys = [-half * tune.lobeOffset, half * tune.lobeOffset];
    const ripples = lobeCys.flatMap((cy) =>
      RIPPLE_OFFSETS.map((dy) => ({ y: cy + dy * half, x: lobeRx * 0.9 }))
    );

    return {
      length,
      angle,
      half,
      lobeRx,
      lobeRy,
      lobeCys,
      ripples,
      maskAxial: tune.maskAxial,
      origin: { x: (geom.dash.x + geom.cabin.x) / 2, y: (geom.dash.y + geom.cabin.y) / 2 },
      vent: { x: -lobeRx * 0.78, rx: length * 0.1, ry: half * 0.5 },
      polygon: geom.polygon.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
    };
  }, [geom, variant]);

  const palette = heating ? WARM : COOL;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" fill="none">
        <Defs>
          <ClipPath id="cabinClip">
            <Polygon points={scene.polygon} />
          </ClipPath>
          <RadialGradient id="lobeGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={palette.core} stopOpacity={palette.coreOpacity} />
            <Stop
              offset="0.55"
              stopColor={palette.core}
              stopOpacity={palette.coreOpacity * 0.45}
            />
            <Stop offset="1" stopColor={palette.edge} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="ventGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={palette.core} stopOpacity={palette.coreOpacity * 1.15} />
            <Stop offset="0.6" stopColor={palette.core} stopOpacity={palette.coreOpacity * 0.4} />
            <Stop offset="1" stopColor={palette.edge} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient
            id="axisFade"
            gradientUnits="userSpaceOnUse"
            x1={-scene.length / 2}
            y1="0"
            x2={scene.length / 2}
            y2="0"
          >
            <Stop offset="0" stopColor={palette.core} stopOpacity="0" />
            <Stop offset="0.15" stopColor={palette.core} stopOpacity="1" />
            <Stop offset="0.6" stopColor={palette.core} stopOpacity="1" />
            <Stop offset="1" stopColor={palette.core} stopOpacity="0" />
          </LinearGradient>
          {/* Axial opacity profile for the plumes: ramp 0-15%, dense to 60%, fade out */}
          <LinearGradient
            id="axialMaskGrad"
            gradientUnits="userSpaceOnUse"
            x1={-scene.length / 2}
            y1="0"
            x2={scene.length / 2}
            y2="0"
          >
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="0.15" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
          <Mask
            id="axialMask"
            maskUnits="userSpaceOnUse"
            x={-scene.length}
            y={-scene.half * 1.6}
            width={scene.length * 2}
            height={scene.half * 3.2}
          >
            <Rect
              x={-scene.length / 2}
              y={-scene.half * 1.6}
              width={scene.length}
              height={scene.half * 3.2}
              fill="url(#axialMaskGrad)"
            />
          </Mask>
        </Defs>

        <G clipPath="url(#cabinClip)">
          <G
            transform={`translate(${scene.origin.x} ${scene.origin.y}) rotate(${scene.angle})`}
          >
            <G mask={scene.maskAxial ? 'url(#axialMask)' : undefined}>
              {/* Fixed volumetric mask: two feathered plumes over the seats */}
              {scene.lobeCys.map((cy, i) => (
                <Ellipse
                  key={`lobe-${i}`}
                  cx={0}
                  cy={cy}
                  rx={scene.lobeRx}
                  ry={scene.lobeRy}
                  fill="url(#lobeGrad)"
                />
              ))}

              {/* Quick ramp at the vent slot */}
              <Ellipse
                cx={scene.vent.x}
                cy={0}
                rx={scene.vent.rx}
                ry={scene.vent.ry}
                fill="url(#ventGrad)"
              />
            </G>

            {/* Moving breeze texture inside the fixed mask */}
            {scene.ripples.map((r, i) => (
              <AnimatedPath
                key={`ripple-${i}`}
                d={`M${-r.x},${r.y} L${r.x},${r.y}`}
                stroke="url(#axisFade)"
                strokeWidth={scene.half * 0.4}
                strokeLinecap="round"
                strokeOpacity={RIPPLE_OPACITY}
                strokeDasharray={RIPPLE_DASH}
                animatedProps={animatedProps}
              />
            ))}
          </G>
        </G>
      </Svg>
    </View>
  );
};
