import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Path, G, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTesla } from '../../context/TeslaContext';

export const TeslaSvgCarCanvas: React.FC = () => {
  const { state, viewMode, toggleDoor, toggleFrunk, toggleTrunk, toggleLock } = useTesla();

  const isTopDown = viewMode === 'controls' || viewMode === 'climate';
  const isHeating = state.isHeating;

  return (
    <View style={styles.container}>
      <Svg height="280" width="100%" viewBox="0 0 400 280">
        <Defs>
          <LinearGradient id="carBody" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={state.carColor} stopOpacity="1" />
            <Stop offset="100%" stopColor="#8A92A0" stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="glassRoof" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1E293B" stopOpacity={viewMode === 'climate' ? 0.1 : 0.85} />
            <Stop offset="100%" stopColor="#0F172A" stopOpacity={viewMode === 'climate' ? 0.1 : 0.9} />
          </LinearGradient>

          <LinearGradient id="coolBreeze" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#4FACFE" stopOpacity="0.0" />
          </LinearGradient>

          <LinearGradient id="heatBreeze" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FF3B30" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#FF9500" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {!isTopDown ? (
          /* ================= MODE 1: 3/4 ISOMETRIC VIEW ================= */
          <G transform="translate(40, 20) scale(0.85)">
            {/* Wheels */}
            <Circle cx="100" cy="180" r="28" fill="#1E293B" stroke="#64748B" strokeWidth="4" />
            <Circle cx="280" cy="180" r="28" fill="#1E293B" stroke="#64748B" strokeWidth="4" />

            {/* Main Chassis Silhouette */}
            <Path
              d="M 50 160 Q 70 110 120 90 Q 200 65 270 90 Q 320 110 340 160 Z"
              fill="url(#carBody)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />

            {/* Glass Cabin Roof */}
            <Path
              d="M 120 90 Q 180 60 250 80 Q 270 90 260 115 H 125 Z"
              fill="url(#glassRoof)"
            />

            {/* Hinged Front Left Driver Door */}
            <G
              transform={
                state.doors.frontLeft
                  ? 'rotate(-25, 130, 115) translate(-15, 5)'
                  : 'rotate(0)'
              }
            >
              <Path
                d="M 130 115 L 210 115 L 200 160 L 125 160 Z"
                fill="url(#carBody)"
                stroke="#000000"
                strokeWidth="2"
                onPress={() => toggleDoor('frontLeft')}
              />
              <Rect x="185" y="130" width="12" height="4" rx="2" fill="#E2E8F0" />
            </G>

            {/* Headlight Illumination */}
            {state.headlightsOn && (
              <Path
                d="M 335 150 Q 370 145 390 155 Q 370 165 335 160 Z"
                fill="#E0F2FE"
                opacity="0.85"
              />
            )}
          </G>
        ) : (
          /* ================= MODE 2 & 3: TOP-DOWN VIEW ================= */
          <G transform="translate(110, 15) scale(0.9)">
            {/* Top-Down Chassis Outer Silhouette */}
            <Rect x="30" y="20" width="120" height="240" rx="35" fill="url(#carBody)" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Glass Roof / Interior Container */}
            <Rect x="42" y="55" width="96" height="155" rx="18" fill="url(#glassRoof)" />

            {/* Climate Mode Interior Seats & Airflow Overlays */}
            {viewMode === 'climate' && (
              <G>
                {/* Front Seats */}
                <Rect x="50" y="75" width="34" height="38" rx="8" fill="#334155" />
                <Rect x="96" y="75" width="34" height="38" rx="8" fill="#334155" />

                {/* Rear Bench */}
                <Rect x="50" y="145" width="80" height="34" rx="8" fill="#334155" />

                {/* Animated HVAC Airflow Plumes from Vents over seats */}
                <Path
                  d="M 52 60 Q 67 90 67 115 M 113 60 Q 113 90 113 115"
                  stroke={isHeating ? 'url(#heatBreeze)' : 'url(#coolBreeze)'}
                  strokeWidth="22"
                  strokeLinecap="round"
                  opacity="0.8"
                />

                {/* Windshield Defrost Indicator */}
                {state.defrostActive && (
                  <Path d="M 65 35 Q 90 30 115 35" stroke="#FF3B30" strokeWidth="3" fill="none" />
                )}
              </G>
            )}

            {/* Sliding Frunk Hood */}
            <G transform={state.frunkOpen ? 'translate(0, -22)' : 'translate(0, 0)'}>
              <Path d="M 35 25 Q 90 10 145 25 L 145 55 L 35 55 Z" fill="url(#carBody)" stroke="#475569" strokeWidth="1" />
            </G>

            {/* Sliding Rear Trunk Hatch */}
            <G transform={state.trunkOpen ? 'translate(0, 22)' : 'translate(0, 0)'}>
              <Path d="M 35 210 L 145 210 Q 90 255 35 255 Z" fill="url(#carBody)" stroke="#475569" strokeWidth="1" />
            </G>
          </G>
        )}
      </Svg>

      {/* Touch Action Pills for Top-Down Controls View */}
      {viewMode === 'controls' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableOpacity style={[styles.actionPill, styles.frunkPill]} onPress={toggleFrunk}>
            <Text style={styles.pillText}>{state.frunkOpen ? 'Close' : 'Open'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.lockPill} onPress={toggleLock}>
            <Text style={styles.lockText}>{state.isLocked ? '🔒' : '🔓'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionPill, styles.trunkPill]} onPress={toggleTrunk}>
            <Text style={styles.pillText}>{state.trunkOpen ? 'Close' : 'Open'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: '100%',
    backgroundColor: '#121214',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionPill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  frunkPill: {
    top: 25,
  },
  trunkPill: {
    bottom: 25,
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  lockPill: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lockText: {
    fontSize: 20,
  },
});
