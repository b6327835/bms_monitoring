// Initial equipment data constants (placeholders while loading)
export const initialChillers = [
  { id: 1, name: 'Chiller-01', status: 'unavailable', temp: 'NaN', pressure: 'NaN', power: 'NaN', runtime: 'NaN', alert: 'Loading...' },
  { id: 2, name: 'Chiller-02', status: 'unavailable', temp: 'NaN', pressure: 'NaN', power: 'NaN', runtime: 'NaN', alert: 'Loading...' },
  { id: 3, name: 'Chiller-03', status: 'unavailable', temp: 'NaN', pressure: 'NaN', power: 'NaN', runtime: 'NaN', alert: 'Loading...' }
];

export const initialAhus = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `AHU-${String(i + 1).padStart(2, '0')}`,
  status: 'unavailable',
  temp: 'NaN',
  pressure: 'NaN',
  power: 'NaN',
  runtime: 'NaN',
  alert: 'Loading...'
}));

export const initialElectricals = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Electrical-${String(i + 1).padStart(2, '0')}`,
  status: 'unavailable',
  temp: 'NaN',
  pressure: 'NaN',
  power: 'NaN',
  runtime: 'NaN',
  alert: 'Loading...'
}));

export const initialPumps = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `Pump-${String(i + 1).padStart(2, '0')}`,
  status: 'unavailable',
  temp: 'NaN',
  pressure: 'NaN',
  power: 'NaN',
  runtime: 'NaN',
  alert: 'Loading...'
}));

export const initialFires = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Fire-${String(i + 1).padStart(2, '0')}`,
  status: 'unavailable',
  temp: 'NaN',
  pressure: 'NaN',
  power: 'NaN',
  runtime: 'NaN',
  alert: 'Loading...'
}));

export const initialEvStations = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `EV-${String(i + 1).padStart(2, '0')}`,
  type: 'Unknown',
  status: 'unavailable',
  power: 'NaN',
  usageTime: 'NaN',
  temp: 'NaN',
  connector: 'Unknown',
  voltage: { v1: 'NaN', v2: 'NaN', v3: 'NaN', average: 'NaN' }
}));
