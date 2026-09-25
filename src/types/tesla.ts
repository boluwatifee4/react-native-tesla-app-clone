export type AppViewMode = 'home' | 'controls' | 'climate' | 'driving';

export interface TeslaState {
  // Lock & Security
  isLocked: boolean;
  sentryMode: boolean;
  
  // Doors & Panels
  doors: {
    frontLeft: boolean;
    frontRight: boolean;
    rearLeft: boolean;
    rearRight: boolean;
  };
  frunkOpen: boolean;
  trunkOpen: boolean;
  
  // Climate & Thermal
  climateActive: boolean;
  isHeating: boolean; // true = heating (red), false = cooling (cyan/white)
  targetTemp: number; // e.g. 76
  interiorTemp: number;
  exteriorTemp: number;
  fanSpeed: number; // 1 to 10
  defrostActive: boolean;
  steeringWheelHeater: boolean;
  seatHeaters: {
    driver: number; // 0 (off), 1, 2, 3
    passenger: number;
    rearLeft: number;
    rearCenter: number;
    rearRight: number;
  };

  // Driving & Customization
  speed: number; // MPH
  carColor: string; // Metallic Silver, Cyan/Teal Wrap, Stealth Black, Deep Blue, Red
  headlightsOn: boolean;
  chargePortOpen: boolean;
  batteryPercentage: number;
  rangeMiles: number;
  carName: string;
}

export interface TeslaContextType {
  state: TeslaState;
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  toggleLock: () => void;
  toggleDoor: (doorKey: keyof TeslaState['doors']) => void;
  toggleFrunk: () => void;
  toggleTrunk: () => void;
  toggleClimate: () => void;
  setTargetTemp: (temp: number) => void;
  toggleDefrost: () => void;
  cycleSeatHeater: (seatKey: keyof TeslaState['seatHeaters']) => void;
  setCarColor: (color: string) => void;
  toggleHeadlights: () => void;
  setSpeed: (speed: number) => void;
}
