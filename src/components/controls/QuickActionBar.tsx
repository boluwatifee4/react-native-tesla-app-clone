import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTesla } from '../../context/TeslaContext';
import { Lock, Unlock, Fan, Zap, Car } from 'lucide-react-native';

export const QuickActionBar: React.FC = () => {
  const { state, toggleLock, toggleClimate, setViewMode } = useTesla();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionBtn} onPress={toggleLock}>
        {state.isLocked ? (
          <Lock color="#E5E5EA" size={24} />
        ) : (
          <Unlock color="#E5E5EA" size={24} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => {
          toggleClimate();
          setViewMode('climate');
        }}
      >
        <Fan color="#E5E5EA" size={24} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setViewMode('controls')}>
        <Zap color="#E5E5EA" size={24} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setViewMode('controls')}>
        <Car color="#E5E5EA" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  actionBtn: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
