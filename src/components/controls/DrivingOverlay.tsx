import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTesla } from '../../context/TeslaContext';
import { Gauge, Palette, Sun, Lightbulb } from 'lucide-react-native';

export const DrivingOverlay: React.FC = () => {
  const { state, setSpeed, setCarColor, toggleHeadlights } = useTesla();

  const colors = [
    { label: 'Silver', hex: '#d1d5db' },
    { label: 'Cyan Wrap', hex: '#00F2FE' },
    { label: 'Black', hex: '#1F2937' },
    { label: 'Deep Blue', hex: '#1D4ED8' },
    { label: 'Ultra Red', hex: '#DC2626' },
  ];

  return (
    <View style={styles.container}>
      {/* Live Speedometer Display */}
      <View style={styles.speedDisplay}>
        <Text style={styles.speedValue}>{state.speed}</Text>
        <Text style={styles.speedUnit}>MPH</Text>
      </View>

      {/* Speed Control Buttons */}
      <View style={styles.speedControls}>
        <TouchableOpacity
          style={styles.speedBtn}
          onPress={() => setSpeed(Math.max(0, state.speed - 15))}
        >
          <Text style={styles.speedBtnText}>- 15 MPH</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.speedBtn, styles.accentBtn]}
          onPress={() => setSpeed(state.speed > 0 ? 0 : 45)}
        >
          <Text style={styles.accentBtnText}>
            {state.speed > 0 ? 'STOP' : 'DRIVE (45 MPH)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.speedBtn}
          onPress={() => setSpeed(Math.min(120, state.speed + 15))}
        >
          <Text style={styles.speedBtnText}>+ 15 MPH</Text>
        </TouchableOpacity>
      </View>

      {/* Paint Wrap Color Picker */}
      <Text style={styles.sectionTitle}>Custom Paint Wrap (Virtual Studio)</Text>
      <View style={styles.colorRow}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c.hex}
            style={[
              styles.colorSwatch,
              { backgroundColor: c.hex },
              state.carColor === c.hex && styles.selectedSwatch,
            ]}
            onPress={() => setCarColor(c.hex)}
          />
        ))}
      </View>

      {/* Headlights Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Lightbulb color={state.headlightsOn ? '#FBBF24' : '#8E8E93'} size={20} />
          <Text style={styles.toggleLabel}>Headlights Illumination</Text>
        </View>

        <TouchableOpacity
          style={[styles.togglePill, state.headlightsOn && styles.togglePillActive]}
          onPress={toggleHeadlights}
        >
          <Text style={styles.togglePillText}>
            {state.headlightsOn ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#121214',
  },
  speedDisplay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  speedValue: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1,
  },
  speedUnit: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -4,
  },
  speedControls: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  speedBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  speedBtnText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 13,
  },
  accentBtn: {
    backgroundColor: '#0F2C1A',
    borderColor: '#34C759',
  },
  accentBtnText: {
    color: '#34C759',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSwatch: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    padding: 14,
    borderRadius: 14,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  togglePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
  },
  togglePillActive: {
    backgroundColor: '#34C759',
  },
  togglePillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
