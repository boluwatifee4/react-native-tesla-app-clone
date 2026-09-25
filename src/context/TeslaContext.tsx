import React, { createContext, useContext, useState } from 'react';
import { TeslaState, TeslaContextType, AppViewMode } from '../types/tesla';

const defaultState: TeslaState = {
  isLocked: false,
  sentryMode: false,
  doors: {
    frontLeft: false,
    frontRight: false,
    rearLeft: false,
    rearRight: false,
  },
  frunkOpen: false,
  trunkOpen: false,
  climateActive: true,
  isHeating: false,
  targetTemp: 76,
  interiorTemp: 76,
  exteriorTemp: 92,
  fanSpeed: 4,
  defrostActive: false,
  steeringWheelHeater: false,
  seatHeaters: {
    driver: 0,
    passenger: 0,
    rearLeft: 0,
    rearCenter: 0,
    rearRight: 0,
  },
  speed: 0,
  carColor: '#d1d5db', // Metallic Silver default
  headlightsOn: true,
  chargePortOpen: false,
  batteryPercentage: 43,
  rangeMiles: 142,
  carName: 'Bima',
};

const TeslaContext = createContext<TeslaContextType | undefined>(undefined);

export const TeslaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TeslaState>(defaultState);
  const [viewMode, setViewMode] = useState<AppViewMode>('home');

  const toggleLock = () => {
    setState((prev) => ({ ...prev, isLocked: !prev.isLocked }));
  };

  const toggleDoor = (doorKey: keyof TeslaState['doors']) => {
    setState((prev) => ({
      ...prev,
      doors: {
        ...prev.doors,
        [doorKey]: !prev.doors[doorKey],
      },
    }));
  };

  const toggleFrunk = () => {
    setState((prev) => ({ ...prev, frunkOpen: !prev.frunkOpen }));
  };

  const toggleTrunk = () => {
    setState((prev) => ({ ...prev, trunkOpen: !prev.trunkOpen }));
  };

  const toggleClimate = () => {
    setState((prev) => ({ ...prev, climateActive: !prev.climateActive }));
  };

  const setTargetTemp = (temp: number) => {
    setState((prev) => ({
      ...prev,
      targetTemp: temp,
      isHeating: temp > prev.interiorTemp,
    }));
  };

  const setFanSpeed = (speed: number) => {
    setState((prev) => ({
      ...prev,
      fanSpeed: Math.min(10, Math.max(1, speed)),
    }));
  };

  const toggleDefrost = () => {
    setState((prev) => ({
      ...prev,
      defrostActive: !prev.defrostActive,
      // Real behavior: turning defrost on forces the HVAC system on.
      climateActive: !prev.defrostActive ? true : prev.climateActive,
    }));
  };

  const cycleSeatHeater = (seatKey: keyof TeslaState['seatHeaters']) => {
    setState((prev) => {
      const current = prev.seatHeaters[seatKey];
      const next = (current + 1) % 4; // 0 -> 1 -> 2 -> 3 -> 0
      return {
        ...prev,
        seatHeaters: {
          ...prev.seatHeaters,
          [seatKey]: next,
        },
      };
    });
  };

  const setCarColor = (color: string) => {
    setState((prev) => ({ ...prev, carColor: color }));
  };

  const toggleHeadlights = () => {
    setState((prev) => ({ ...prev, headlightsOn: !prev.headlightsOn }));
  };

  const setSpeed = (speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  };

  return (
    <TeslaContext.Provider
      value={{
        state,
        viewMode,
        setViewMode,
        toggleLock,
        toggleDoor,
        toggleFrunk,
        toggleTrunk,
        toggleClimate,
        setTargetTemp,
        setFanSpeed,
        toggleDefrost,
        cycleSeatHeater,
        setCarColor,
        toggleHeadlights,
        setSpeed,
      }}
    >
      {children}
    </TeslaContext.Provider>
  );
};

export const useTesla = () => {
  const context = useContext(TeslaContext);
  if (!context) {
    throw new Error('useTesla must be used within a TeslaProvider');
  }
  return context;
};
