import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTesla } from '../../context/TeslaContext';
import { ChevronLeft, User } from 'lucide-react-native';

export const Header: React.FC = () => {
  const { state, viewMode, setViewMode } = useTesla();

  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'controls':
        return 'Controls';
      case 'climate':
        return 'Climate';
      case 'driving':
        return 'Driving Simulator';
      default:
        return state.carName;
    }
  };

  return (
    <View style={styles.headerContainer}>
      {viewMode !== 'home' ? (
        <TouchableOpacity style={styles.backButton} onPress={() => setViewMode('home')}>
          <ChevronLeft color="#FFFFFF" size={26} />
        </TouchableOpacity>
      ) : (
        <View style={styles.vehicleInfo}>
          <Text style={styles.carName}>{state.carName}</Text>
          <View style={styles.batteryRow}>
            <View style={styles.batteryPill}>
              <View style={[styles.batteryFill, { width: `${state.batteryPercentage}%` }]} />
            </View>
            <Text style={styles.batteryText}>{state.batteryPercentage}%</Text>
          </View>
          <Text style={styles.parkedText}>Parked</Text>
        </View>
      )}

      {viewMode !== 'home' ? (
        <Text style={styles.subScreenTitle}>{getHeaderTitle()}</Text>
      ) : null}

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.avatarBtn}>
          <User color="#A0A0A0" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 78,
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121214',
    zIndex: 10,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
  },
  subScreenTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  vehicleInfo: {
    flexDirection: 'column',
  },
  carName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  batteryPill: {
    width: 22,
    height: 10,
    borderWidth: 1.5,
    borderColor: '#666666',
    borderRadius: 3,
    padding: 1,
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 1,
  },
  batteryText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  parkedText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
