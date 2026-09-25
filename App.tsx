import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { TeslaProvider, useTesla } from './src/context/TeslaContext';
import { Header } from './src/components/controls/Header';
import { Tesla3DCanvas } from './src/components/car/Tesla3DCanvas';
import { QuickActionBar } from './src/components/controls/QuickActionBar';
import { MediaMiniPlayer } from './src/components/controls/MediaMiniPlayer';
import { NavigationMenuList } from './src/components/controls/NavigationMenuList';
import { ControlsDrawer } from './src/components/controls/ControlsDrawer';
import { ClimateDrawer } from './src/components/controls/ClimateDrawer';
import { DrivingOverlay } from './src/components/controls/DrivingOverlay';
import { BottomSheet } from './src/components/controls/BottomSheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  HEADER_HEIGHT,
  SHEET_EXPANDED_TOP_FRACTION,
  canvasHeightFor,
  isFullViewMode,
} from './src/utils/layout';

const MainScreen: React.FC = () => {
  const { viewMode } = useTesla();
  const { height: windowH } = useWindowDimensions();
  const fullView = isFullViewMode(viewMode);
  const canvasH = canvasHeightFor(viewMode, windowH);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <View style={styles.container}>
        {/* Top Navigation & Status Header */}
        <Header />

        {/* 3D Interactive Tesla Canvas Viewport */}
        <Tesla3DCanvas />

        {/* Dynamic Mode Controls */}
        {!fullView && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {viewMode === 'home' && (
              <>
                <QuickActionBar />
                <MediaMiniPlayer />
                <NavigationMenuList />
              </>
            )}
            {viewMode === 'driving' && <DrivingOverlay />}
          </ScrollView>
        )}

        {/* Expandable bottom sheet for the full views */}
        {fullView && (
          <BottomSheet
            collapsedTop={HEADER_HEIGHT + canvasH}
            expandedTop={Math.round(windowH * SHEET_EXPANDED_TOP_FRACTION)}
          >
            {(expanded) =>
              viewMode === 'controls' ? (
                <ControlsDrawer expanded={expanded} />
              ) : (
                <ClimateDrawer />
              )
            }
          </BottomSheet>
        )}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <TeslaProvider>
        <MainScreen />
      </TeslaProvider>
    </SafeAreaProvider>
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
