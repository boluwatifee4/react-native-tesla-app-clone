import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SkipBack, Pause, SkipForward, Volume2, Minus, Plus } from 'lucide-react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const PlayPauseGlyph: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M3.5 4.8 L3.5 19.2 L15.5 12 Z" />
    <Rect x="17.2" y="6" width="2.4" height="12" rx="1" />
    <Rect x="20.6" y="6" width="2.4" height="12" rx="1" />
  </Svg>
);

export const MediaMiniPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(65);

  const handleVolDown = () => setVolume((v) => Math.max(0, v - 5));
  const handleVolUp = () => setVolume((v) => Math.min(100, v + 5));

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn}>
        <SkipBack color="#A0A0A0" size={22} fill="#A0A0A0" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? (
          <Pause color="#FFFFFF" size={26} fill="#FFFFFF" />
        ) : (
          <PlayPauseGlyph size={26} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn}>
        <SkipForward color="#A0A0A0" size={22} fill="#A0A0A0" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleVolDown}>
        <Minus color="#A0A0A0" size={20} />
      </TouchableOpacity>

      <Volume2 color="#A0A0A0" size={22} />

      <TouchableOpacity style={styles.btn} onPress={handleVolUp}>
        <Plus color="#A0A0A0" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: '#1C1C1E',
    marginHorizontal: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  btn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
