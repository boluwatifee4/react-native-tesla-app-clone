import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { TeslaProvider, useTesla } from './src/context/TeslaContext';
import { Header } from './src/components/controls/Header';
import { Tesla3DCanvas } from './src/components/car/Tesla3DCanvas';
import { QuickActionBar } from './src/components/controls/QuickActionBar';
import { MediaMiniPlayer } from './src/components/controls/MediaMiniPlayer';
import { NavigationMenuList } from './src/components/controls/NavigationMenuList';
import { ControlsDrawer } from './src/components/controls/ControlsDrawer';
import { ClimateDrawer } from './src/components/controls/ClimateDrawer';
import { DrivingOverlay } from './src/components/controls/DrivingOverlay';

const MainScreen: React.FC = () => {
  const { viewMode } = useTesla();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <View style={styles.container}>
        {/* Top Navigation & Status Header */}
        <Header />

        {/* 3D Interactive Tesla Canvas Viewport */}
        <Tesla3DCanvas />

        {/* Dynamic Mode Controls */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {viewMode === 'home' && (
            <>
              <QuickActionBar />
              <MediaMiniPlayer />
              <NavigationMenuList />
            </>
          )}

          {viewMode === 'controls' && <ControlsDrawer />}

          {viewMode === 'climate' && <ClimateDrawer />}

          {viewMode === 'driving' && <DrivingOverlay />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <TeslaProvider>
      <MainScreen />
    </TeslaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121214',
  },
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContent: {
    flex: 1,
  },
});
