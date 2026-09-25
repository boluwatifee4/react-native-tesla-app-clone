import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTesla } from '../../context/TeslaContext';
import { Car, Fan, Navigation, ShieldCheck, ChevronRight } from 'lucide-react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const SteeringWheelIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#8E8E93',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.2" stroke={color} strokeWidth="1.6" />
    <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.6" />
    <Line x1="8.8" y1="12" x2="2.9" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Line x1="15.2" y1="12" x2="21.1" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Line x1="12" y1="15.2" x2="12" y2="21.1" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const NavigationMenuList: React.FC = () => {
  const { state, setViewMode } = useTesla();

  const menuItems = [
    {
      id: 'controls',
      title: 'Controls',
      subtitle: null,
      icon: <Car color="#8E8E93" size={22} />,
      onPress: () => setViewMode('controls'),
    },
    {
      id: 'climate',
      title: 'Climate',
      subtitle: state.climateActive
        ? `Active · Interior ${state.interiorTemp}°F`
        : 'Off',
      icon: <Fan color="#8E8E93" size={22} />,
      onPress: () => setViewMode('climate'),
    },
    {
      id: 'location',
      title: 'Location',
      subtitle: '2005–2037 Kenyon Dr',
      icon: <Navigation color="#8E8E93" size={22} />,
      onPress: () => {},
    },
    {
      id: 'summon',
      title: 'Summon',
      subtitle: null,
      icon: <SteeringWheelIcon />,
      onPress: () => {},
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: null,
      icon: <ShieldCheck color="#8E8E93" size={22} />,
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.row} onPress={item.onPress}>
          <View style={styles.iconContainer}>{item.icon}</View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
          </View>
          <ChevronRight color="#48484A" size={22} strokeWidth={1.5} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 6,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconContainer: {
    width: 36,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '500',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
});
