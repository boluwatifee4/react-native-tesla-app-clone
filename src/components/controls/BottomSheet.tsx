import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface BottomSheetProps {
  collapsedTop: number;
  expandedTop: number;
  children: (expanded: boolean) => React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  collapsedTop,
  expandedTop,
  children,
}) => {
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);
  const insets = useSafeAreaInsets();

  // iOS: the root SafeAreaView already pads the container past the home
  // indicator, so only a small breathing gap is needed. Android's SafeAreaView
  // is a no-op — add the nav-bar/gesture inset so content clears it.
  const bottomPadding =
    Platform.OS === 'android' ? Math.max(insets.bottom, 0) + 12 : 12;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * (collapsedTop - expandedTop) }],
  }));

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withTiming(next ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <Animated.View
      style={[styles.sheet, { top: expandedTop, paddingBottom: bottomPadding }, animatedStyle]}
    >
      <TouchableOpacity
        style={styles.handleZone}
        onPress={toggle}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse panel' : 'Expand panel'}
      >
        <View style={styles.handle} />
        <View style={styles.chevronBox}>
          {expanded ? (
            <ChevronUp color="#8E8E93" size={16} strokeWidth={2} />
          ) : (
            <ChevronDown color="#8E8E93" size={16} strokeWidth={2} />
          )}
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentFill}
        showsVerticalScrollIndicator={false}
      >
        {children(expanded)}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121214',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 14,
  },
  handleZone: {
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  chevronBox: {
    position: 'absolute',
    right: 16,
    top: 5,
  },
  content: {
    flex: 1,
  },
  contentFill: {
    flexGrow: 1,
  },
});
