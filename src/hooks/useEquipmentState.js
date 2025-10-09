import { useState, useMemo, useCallback } from 'react';
import { handleRandomAccident, handleRandomEVFuseDrop, handleFixAllAccident } from '../utils/accidentHandlers';

export function useEquipmentState(showToast) {
  // EV Stations data
  const [evStations, setEvStations] = useState(() => {
    // Seed 30 stations similar to the reference
    const base = [
      { type: 'Fast Charger', status: 'charging', power: '45.2 kW', usageTime: '1:25:10', temp: '42°C', connector: 'CCS2', voltage: { v1: 228, v2: 230, v3: 229 } },
      { type: 'Fast Charger', status: 'available', power: '0 kW', usageTime: '0:00:00', temp: '28°C', connector: 'CCS2', voltage: { v1: 230, v2: 231, v3: 229 } },
      { type: 'Standard', status: 'charging', power: '22.5 kW', usageTime: '2:15:45', temp: '38°C', connector: 'Type 2', voltage: { v1: 229, v2: 228, v3: 230 } },
      { type: 'Standard', status: 'available', power: '0 kW', usageTime: '0:00:00', temp: '29°C', connector: 'Type 2', voltage: { v1: 231, v2: 230, v3: 229 } },
      { type: 'Fast Charger', status: 'charging', power: '48.7 kW', usageTime: '0:45:30', temp: '45°C', connector: 'CCS2', voltage: { v1: 227, v2: 229, v3: 228 } },
      { type: 'Standard', status: 'available', power: '0 kW', usageTime: '0:00:00', temp: '27°C', connector: 'Type 2', voltage: { v1: 230, v2: 231, v3: 230 } },
    ];
    const list = new Array(30).fill(0).map((_, i) => {
      const t = base[i % base.length];
      const v1 = t.voltage.v1;
      const v2 = t.voltage.v2;
      const v3 = t.voltage.v3;
      const average = Math.round((v1 + v2 + v3) / 3);
      return {
        id: i + 1,
        name: `EV-${String(i + 1).padStart(2, '0')}`,
        type: t.type,
        status: i === 12 || i === 22 ? 'fault' : t.status, // inject a couple faults
        power: t.power,
        usageTime: t.usageTime,
        temp: t.temp,
        connector: t.connector,
        voltage: { v1, v2, v3, average }
      };
    });
    return list;
  });

  // Equipment data states
  const [chillers, setChillers] = useState([
    { id: 1, name: 'Chiller-01', status: 'normal', temp: '7.2 °C', pressure: '4.2 Bar', power: '45.8 kW', runtime: '1,248 h', alert: 'None' },
    { id: 2, name: 'Chiller-02', status: 'normal', temp: '7.1 °C', pressure: '4.1 Bar', power: '46.0 kW', runtime: '1,250 h', alert: 'None' },
    { id: 3, name: 'Chiller-03', status: 'fault', temp: '9.5 °C', pressure: '4.5 Bar', power: '48.2 kW', runtime: '1,240 h', alert: 'Overheat' }
  ]);

  const [ahus, setAhus] = useState(Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `AHU-${String(i + 1).padStart(2, '0')}`,
    status: i === 5 ? 'fault' : 'normal',
    temp: (22 + Math.random() * 2).toFixed(1) + ' °C',
    pressure: (1.5 + Math.random() * 1).toFixed(1) + ' Bar',
    power: (10 + Math.random() * 5).toFixed(1) + ' kW',
    runtime: '1,248 h',
    alert: i === 5 ? 'High pressure' : 'None'
  })));

  const [electricals, setElectricals] = useState(Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Electrical-${String(i + 1).padStart(2, '0')}`,
    status: 'normal',
    temp: (30 + Math.random() * 15).toFixed(1) + ' °C',
    pressure: 'N/A',
    power: (200 + Math.random() * 100).toFixed(1) + ' kW',
    runtime: 'Continuous',
    alert: 'None'
  })));

  const [pumps, setPumps] = useState(Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Pump-${String(i + 1).padStart(2, '0')}`,
    status: 'normal',
    temp: (8 + Math.random() * 2).toFixed(1) + ' °C',
    pressure: (3 + Math.random() * 1).toFixed(1) + ' Bar',
    power: (8 + Math.random() * 1).toFixed(1) + ' kW',
    runtime: '1,248 h',
    alert: 'None'
  })));

  const [fires, setFires] = useState(Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Fire-${String(i + 1).padStart(2, '0')}`,
    status: i === 7 ? 'fault' : 'normal',
    temp: 'N/A',
    pressure: 'N/A',
    power: '0.5 kW',
    runtime: 'Continuous',
    alert: i === 7 ? 'Sensor failure' : 'None'
  })));

  // Individual unit panels
  const [openEVUnits, setOpenEVUnits] = useState({});
  const [openChillerUnits, setOpenChillerUnits] = useState({});
  const [openAhuUnits, setOpenAhuUnits] = useState({});
  const [openElectricalUnits, setOpenElectricalUnits] = useState({});
  const [openPumpUnits, setOpenPumpUnits] = useState({});
  const [openFireUnits, setOpenFireUnits] = useState({});

  // Derived indicators
  const chillerIndicators = useMemo(() => chillers.map(c => c.status === 'fault' ? 'fault' : 'normal'), [chillers]);
  const ahuIndicators = useMemo(() => ahus.map(a => a.status === 'fault' ? 'fault' : 'normal'), [ahus]);
  const electricalIndicators = useMemo(() => electricals.map(e => e.status === 'fault' ? 'fault' : 'normal'), [electricals]);
  const pumpIndicators = useMemo(() => pumps.map(p => p.status === 'fault' ? 'fault' : 'normal'), [pumps]);
  const fireIndicators = useMemo(() => fires.map(f => f.status === 'fault' ? 'fault' : 'normal'), [fires]);

  // EV Summary
  const evSummary = useMemo(() => {
    const total = evStations.length;
    const charging = evStations.filter(s => s.status === 'charging').length;
    const available = evStations.filter(s => s.status === 'available').length;
    const fault = evStations.filter(s => s.status === 'fault').length;
    return { total, charging, available, fault };
  }, [evStations]);

  // Handlers to open individual unit panels
  const openIndividualEV = useCallback((index) => {
    const unitId = `ev-${index}`;
    if (!openEVUnits[unitId]) {
      setOpenEVUnits(prev => ({
        ...prev,
        [unitId]: {
          id: unitId,
          index,
          position: { x: 100 + Object.keys(prev).length * 30, y: 100 + Object.keys(prev).length * 30 },
          minimized: false
        }
      }));
    }
  }, [openEVUnits]);

  const openIndividualChiller = useCallback((index) => {
    const unitId = `chiller-${index}`;
    if (!openChillerUnits[unitId]) {
      setOpenChillerUnits(prev => ({
        ...prev,
        [unitId]: {
          id: unitId,
          index,
          position: { x: 100 + Object.keys(prev).length * 30, y: 100 + Object.keys(prev).length * 30 },
          minimized: false
        }
      }));
    }
  }, [openChillerUnits]);

  const openIndividualAhu = useCallback((index) => {
    const unitId = `ahu-${index}`;
    if (!openAhuUnits[unitId]) {
      setOpenAhuUnits(prev => ({
        ...prev,
        [unitId]: {
          id: unitId,
          index,
          position: { x: 100 + Object.keys(prev).length * 30, y: 100 + Object.keys(prev).length * 30 },
          minimized: false
        }
      }));
    }
  }, [openAhuUnits]);

  const openIndividualElectrical = useCallback((index) => {
    const unitId = `electrical-${index}`;
    if (!openElectricalUnits[unitId]) {
      setOpenElectricalUnits(prev => ({
        ...prev,
        [unitId]: {
          id: unitId,
          index,
          position: { x: 100 + Object.keys(prev).length * 30, y: 100 + Object.keys(prev).length * 30 },
          minimized: false
        }
      }));
    }
  }, [openElectricalUnits]);

  const openIndividualPump = useCallback((index) => {
    const unitId = `pump-${index}`;
    if (!openPumpUnits[unitId]) {
      setOpenPumpUnits(prev => ({
        ...prev,
        [unitId]: {
          id: unitId,
          index,
          position: { x: 100 + Object.keys(prev).length * 30, y: 100 + Object.keys(prev).length * 30 },
          minimized: false
        }
      }));
    }
  }, [openPumpUnits]);

  const openIndividualFire = useCallback((index) => {
    const unitId = `fire-${index}`;
    if (!openFireUnits[unitId]) {
      setOpenFireUnits(prev => ({
        ...prev,
        [unitId]: {
          id: unitId,
          index,
          position: { x: 100 + Object.keys(prev).length * 30, y: 100 + Object.keys(prev).length * 30 },
          minimized: false
        }
      }));
    }
  }, [openFireUnits]);

  const closeIndividualUnit = useCallback((unitId, type) => {
    if (type === 'ev') {
      setOpenEVUnits(prev => {
        const next = { ...prev };
        delete next[unitId];
        return next;
      });
    } else if (type === 'chiller') {
      setOpenChillerUnits(prev => {
        const next = { ...prev };
        delete next[unitId];
        return next;
      });
    } else if (type === 'ahu') {
      setOpenAhuUnits(prev => {
        const next = { ...prev };
        delete next[unitId];
        return next;
      });
    } else if (type === 'electrical') {
      setOpenElectricalUnits(prev => {
        const next = { ...prev };
        delete next[unitId];
        return next;
      });
    } else if (type === 'pump') {
      setOpenPumpUnits(prev => {
        const next = { ...prev };
        delete next[unitId];
        return next;
      });
    } else if (type === 'fire') {
      setOpenFireUnits(prev => {
        const next = { ...prev };
        delete next[unitId];
        return next;
      });
    }
  }, [openEVUnits, openChillerUnits, openAhuUnits, openElectricalUnits, openPumpUnits, openFireUnits]);

  const handleRandomAccidentWrapped = useCallback(() => {
    handleRandomAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast);
  }, [evStations, chillers, ahus, electricals, pumps, fires, showToast]);

  const handleRandomEVFuseDropWrapped = useCallback(() => {
    handleRandomEVFuseDrop(evStations, setEvStations, showToast);
  }, [evStations, showToast]);

  const handleFixAllAccidentWrapped = useCallback(() => {
    handleFixAllAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast);
  }, [evStations, chillers, ahus, electricals, pumps, fires, showToast]);

  return {
    // Data
    evStations,
    setEvStations,
    chillers,
    setChillers,
    ahus,
    setAhus,
    electricals,
    setElectricals,
    pumps,
    setPumps,
    fires,
    setFires,

    // Individual unit panels
    openEVUnits,
    setOpenEVUnits,
    openChillerUnits,
    setOpenChillerUnits,
    openAhuUnits,
    setOpenAhuUnits,
    openElectricalUnits,
    setOpenElectricalUnits,
    openPumpUnits,
    setOpenPumpUnits,
    openFireUnits,
    setOpenFireUnits,

    // Indicators
    chillerIndicators,
    ahuIndicators,
    electricalIndicators,
    pumpIndicators,
    fireIndicators,
    evSummary,

    // Handlers
    openIndividualEV,
    openIndividualChiller,
    openIndividualAhu,
    openIndividualElectrical,
    openIndividualPump,
    openIndividualFire,
    closeIndividualUnit,
    handleRandomAccident: handleRandomAccidentWrapped,
    handleRandomEVFuseDrop: handleRandomEVFuseDropWrapped,
    handleFixAllAccident: handleFixAllAccidentWrapped
  };
}
