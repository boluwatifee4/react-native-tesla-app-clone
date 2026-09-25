import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTesla } from '../../context/TeslaContext';
import {
  Lightbulb,
  Volume2,
  Key,
  Home,
  Lock,
  Unlock,
  PackageOpen,
  Package,
} from 'lucide-react-native';

interface ControlsDrawerProps {
  expanded?: boolean;
}

export const ControlsDrawer: React.FC<ControlsDrawerProps> = ({ expanded = false }) => {
  const { state, toggleFrunk, toggleTrunk, toggleLock, toggleHeadlights } = useTesla();

  return (
    <View
      style={[
        styles.container,
        !expanded && styles.containerBottomPinned,
      ]}
    >
      {/* Quick actions: bare outline icons (always visible) */}
      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={toggleFrunk}>
          <PackageOpen
            color={state.frunkOpen ? '#FF9500' : '#E5E5EA'}
            size={24}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickBtn} onPress={toggleTrunk}>
          <Package
            color={state.trunkOpen ? '#FF9500' : '#E5E5EA'}
            size={24}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickBtn} onPress={toggleLock}>
          {state.isLocked ? (
            <Lock color="#E5E5EA" size={24} strokeWidth={1.8} />
          ) : (
            <Unlock color="#E5E5EA" size={24} strokeWidth={1.8} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickBtn} onPress={toggleHeadlights}>
          <Lightbulb
            color={state.headlightsOn ? '#FBBF24' : '#E5E5EA'}
            size={24}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickBtn}>
          <Volume2 color="#E5E5EA" size={24} strokeWidth={1.8} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickBtn}>
          <Key color="#E5E5EA" size={24} strokeWidth={1.8} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickBtn}>
          <Home color="#E5E5EA" size={24} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <>
          <Text style={styles.sectionTitle}>Vehicle Actions</Text>

          {/* Frunk & Trunk Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cardBtn} onPress={toggleFrunk}>
              <Text style={styles.cardTitle}>Front Trunk (Frunk)</Text>
              <Text style={[styles.cardState, state.frunkOpen && styles.activeState]}>
                {state.frunkOpen ? 'OPENED' : 'CLOSED'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardBtn} onPress={toggleTrunk}>
              <Text style={styles.cardTitle}>Rear Trunk</Text>
              <Text style={[styles.cardState, state.trunkOpen && styles.activeState]}>
                {state.trunkOpen ? 'OPENED' : 'CLOSED'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Labeled strip (detail view) */}
          <Text style={styles.sectionTitle}>Quick Controls</Text>
          <View style={styles.controlsStrip}>
            <TouchableOpacity style={styles.stripBtn} onPress={toggleHeadlights}>
              <Lightbulb color={state.headlightsOn ? '#FBBF24' : '#8E8E93'} size={22} />
              <Text style={styles.stripText}>Lights</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.stripBtn}>
              <Volume2 color="#8E8E93" size={22} />
              <Text style={styles.stripText}>Horn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.stripBtn}>
              <Key color="#8E8E93" size={22} />
              <Text style={styles.stripText}>Start</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.stripBtn}>
              <Home color="#8E8E93" size={22} />
              <Text style={styles.stripText}>HomeLink</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
    backgroundColor: '#121214',
  },
  // Collapsed: fill the sheet and pin the quick actions to the bottom so
  // there is always a guaranteed gap above the nav/gesture area.
  containerBottomPinned: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 0,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  quickBtn: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardBtn: {
    flex: 1,
    height: 70,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardState: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '800',
  },
  activeState: {
    color: '#FF9500',
  },
  controlsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  stripBtn: {
    flex: 1,
    height: 64,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  stripText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
