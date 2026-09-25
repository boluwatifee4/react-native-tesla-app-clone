import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTesla } from '../../context/TeslaContext';
import { Power, Flame, Snowflake, ChevronLeft, ChevronRight, Wind } from 'lucide-react-native';

export const ClimateDrawer: React.FC = () => {
  const { state, toggleClimate, setTargetTemp, toggleDefrost, cycleSeatHeater } = useTesla();

  const handleTempDown = () => setTargetTemp(state.targetTemp - 1);
  const handleTempUp = () => setTargetTemp(state.targetTemp + 1);

  const getSeatHeatColor = (level: number) => {
    switch (level) {
      case 1:
        return '#FF9500';
      case 2:
        return '#FF5E3A';
      case 3:
        return '#FF3B30';
      default:
        return '#48484A';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Temp & Status Bar */}
      <View style={styles.tempHeader}>
        <TouchableOpacity style={styles.tempBtn} onPress={handleTempDown}>
          <ChevronLeft color="#A0A0A0" size={28} />
        </TouchableOpacity>

        <View style={styles.tempDisplay}>
          <Text style={styles.tempText}>{state.targetTemp}°</Text>
          <Text style={styles.statusSubText}>
            Interior {state.interiorTemp}°F · Exterior {state.exteriorTemp}°F
          </Text>
        </View>

        <TouchableOpacity style={styles.tempBtn} onPress={handleTempUp}>
          <ChevronRight color="#A0A0A0" size={28} />
        </TouchableOpacity>
      </View>

      {/* Climate Airflow Thermal State Indicator */}
      <View style={styles.thermalStateBar}>
        <View
          style={[
            styles.thermalPill,
            state.isHeating ? styles.heatingPill : styles.coolingPill,
          ]}
        >
          {state.isHeating ? (
            <>
              <Flame color="#FF3B30" size={18} />
              <Text style={styles.heatingText}>Heating Active</Text>
            </>
          ) : (
            <>
              <Snowflake color="#00F2FE" size={18} />
              <Text style={styles.coolingText}>Cooling Active</Text>
            </>
          )}
        </View>
      </View>

      {/* Seat Heating Grid (5 Seat Selectors) */}
      <Text style={styles.sectionTitle}>Seat Heating (SSS)</Text>
      <View style={styles.seatGrid}>
        {/* Front Seats Row */}
        <View style={styles.seatRow}>
          <TouchableOpacity
            style={[
              styles.seatCard,
              { borderColor: getSeatHeatColor(state.seatHeaters.driver) },
            ]}
            onPress={() => cycleSeatHeater('driver')}
          >
            <Text
              style={[
                styles.seatIcon,
                { color: getSeatHeatColor(state.seatHeaters.driver) },
              ]}
            >
              SSS
            </Text>
            <Text style={styles.seatLabel}>Driver</Text>
            {state.seatHeaters.driver > 0 && (
              <Text style={styles.heatLevel}>Level {state.seatHeaters.driver}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.seatCard,
              { borderColor: getSeatHeatColor(state.seatHeaters.passenger) },
            ]}
            onPress={() => cycleSeatHeater('passenger')}
          >
            <Text
              style={[
                styles.seatIcon,
                { color: getSeatHeatColor(state.seatHeaters.passenger) },
              ]}
            >
              SSS
            </Text>
            <Text style={styles.seatLabel}>Passenger</Text>
            {state.seatHeaters.passenger > 0 && (
              <Text style={styles.heatLevel}>Level {state.seatHeaters.passenger}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Rear Seats Row */}
        <View style={styles.seatRow}>
          <TouchableOpacity
            style={[
              styles.seatCardSmall,
              { borderColor: getSeatHeatColor(state.seatHeaters.rearLeft) },
            ]}
            onPress={() => cycleSeatHeater('rearLeft')}
          >
            <Text
              style={[
                styles.seatIconSmall,
                { color: getSeatHeatColor(state.seatHeaters.rearLeft) },
              ]}
            >
              SSS
            </Text>
            <Text style={styles.seatLabelSmall}>Rear L</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.seatCardSmall,
              { borderColor: getSeatHeatColor(state.seatHeaters.rearCenter) },
            ]}
            onPress={() => cycleSeatHeater('rearCenter')}
          >
            <Text
              style={[
                styles.seatIconSmall,
                { color: getSeatHeatColor(state.seatHeaters.rearCenter) },
              ]}
            >
              SSS
            </Text>
            <Text style={styles.seatLabelSmall}>Rear C</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.seatCardSmall,
              { borderColor: getSeatHeatColor(state.seatHeaters.rearRight) },
            ]}
            onPress={() => cycleSeatHeater('rearRight')}
          >
            <Text
              style={[
                styles.seatIconSmall,
                { color: getSeatHeatColor(state.seatHeaters.rearRight) },
              ]}
            >
              SSS
            </Text>
            <Text style={styles.seatLabelSmall}>Rear R</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Climate Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.powerBtn, state.climateActive && styles.powerBtnActive]}
          onPress={toggleClimate}
        >
          <Power color={state.climateActive ? '#34C759' : '#8E8E93'} size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.defrostBtn, state.defrostActive && styles.defrostBtnActive]}
          onPress={toggleDefrost}
        >
          <Wind color={state.defrostActive ? '#FF3B30' : '#8E8E93'} size={24} />
          <Text style={[styles.defrostText, state.defrostActive && styles.defrostTextActive]}>
            Defrost
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
  tempHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  tempBtn: {
    padding: 10,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
  },
  tempDisplay: {
    alignItems: 'center',
  },
  tempText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statusSubText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 4,
  },
  thermalStateBar: {
    alignItems: 'center',
    marginVertical: 10,
  },
  thermalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  coolingPill: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderColor: '#00F2FE',
  },
  coolingText: {
    color: '#00F2FE',
    fontWeight: '700',
    fontSize: 14,
  },
  heatingPill: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
  },
  heatingText: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 14,
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
  seatGrid: {
    gap: 10,
  },
  seatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  seatCard: {
    flex: 1,
    height: 75,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatCardSmall: {
    flex: 1,
    height: 60,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatIcon: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  seatIconSmall: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  seatLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  seatLabelSmall: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  heatLevel: {
    color: '#FF9500',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 15,
  },
  powerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  powerBtnActive: {
    backgroundColor: '#0F2C1A',
    borderColor: '#34C759',
  },
  defrostBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  defrostBtnActive: {
    backgroundColor: '#2C0F10',
    borderColor: '#FF3B30',
  },
  defrostText: {
    color: '#8E8E93',
    fontWeight: '700',
    fontSize: 16,
  },
  defrostTextActive: {
    color: '#FF3B30',
  },
});
