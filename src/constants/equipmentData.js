// Initial equipment data constants
export const initialChillers = [
  { id: 1, name: 'Chiller-01', status: 'normal', temp: '7.2 °C', pressure: '4.2 Bar', power: '45.8 kW', runtime: '1,248 h', alert: 'None' },
  { id: 2, name: 'Chiller-02', status: 'normal', temp: '7.1 °C', pressure: '4.1 Bar', power: '46.0 kW', runtime: '1,250 h', alert: 'None' },
  { id: 3, name: 'Chiller-03', status: 'fault', temp: '9.5 °C', pressure: '4.5 Bar', power: '48.2 kW', runtime: '1,240 h', alert: 'Overheat' }
];

export const initialAhus = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `AHU-${String(i + 1).padStart(2, '0')}`,
  status: i === 5 ? 'fault' : 'normal',
  temp: (22 + Math.random() * 2).toFixed(1) + ' °C',
  pressure: (1.5 + Math.random() * 1).toFixed(1) + ' Bar',
  power: (10 + Math.random() * 5).toFixed(1) + ' kW',
  runtime: '1,248 h',
  alert: i === 5 ? 'High pressure' : 'None'
}));

export const initialElectricals = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Electrical-${String(i + 1).padStart(2, '0')}`,
  status: 'normal',
  temp: (30 + Math.random() * 15).toFixed(1) + ' °C',
  pressure: 'N/A',
  power: (200 + Math.random() * 100).toFixed(1) + ' kW',
  runtime: 'Continuous',
  alert: 'None'
}));

export const initialPumps = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `Pump-${String(i + 1).padStart(2, '0')}`,
  status: 'normal',
  temp: (8 + Math.random() * 2).toFixed(1) + ' °C',
  pressure: (3 + Math.random() * 1).toFixed(1) + ' Bar',
  power: (8 + Math.random() * 1).toFixed(1) + ' kW',
  runtime: '1,248 h',
  alert: 'None'
}));

export const initialFires = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Fire-${String(i + 1).padStart(2, '0')}`,
  status: i === 7 ? 'fault' : 'normal',
  temp: 'N/A',
  pressure: 'N/A',
  power: '0.5 kW',
  runtime: 'Continuous',
  alert: i === 7 ? 'Sensor failure' : 'None'
}));

export const initialEvStations = Array.from({ length: 30 }, (_, i) => {
  const base = [
    { type: 'Fast Charger', status: 'charging', power: '45.2 kW', usageTime: '1:25:10', temp: '42°C', connector: 'CCS2', voltage: { v1: 228, v2: 230, v3: 229 } },
    { type: 'Fast Charger', status: 'available', power: '0 kW', usageTime: '0:00:00', temp: '28°C', connector: 'CCS2', voltage: { v1: 230, v2: 231, v3: 229 } },
    { type: 'Standard', status: 'charging', power: '22.5 kW', usageTime: '2:15:45', temp: '38°C', connector: 'Type 2', voltage: { v1: 229, v2: 228, v3: 230 } },
    { type: 'Standard', status: 'available', power: '0 kW', usageTime: '0:00:00', temp: '29°C', connector: 'Type 2', voltage: { v1: 231, v2: 230, v3: 229 } },
    { type: 'Fast Charger', status: 'charging', power: '48.7 kW', usageTime: '0:45:30', temp: '45°C', connector: 'CCS2', voltage: { v1: 227, v2: 229, v3: 228 } },
    { type: 'Standard', status: 'available', power: '0 kW', usageTime: '0:00:00', temp: '27°C', connector: 'Type 2', voltage: { v1: 230, v2: 231, v3: 230 } },
  ];
  const t = base[i % base.length];
  const v1 = t.voltage.v1;
  const v2 = t.voltage.v2;
  const v3 = t.voltage.v3;
  const average = Math.round((v1 + v2 + v3) / 3);
  return {
    id: i + 1,
    name: `EV-${String(i + 1).padStart(2, '0')}`,
    type: t.type,
    status: i === 12 || i === 22 ? 'fault' : t.status,
    power: t.power,
    usageTime: t.usageTime,
    temp: t.temp,
    connector: t.connector,
    voltage: { v1, v2, v3, average }
  };
});
