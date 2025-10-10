import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { handleRandomAccident, handleRandomEVFuseDrop, handleFixAllAccident } from '../utils/accidentHandlers';
import { initialChillers, initialAhus, initialElectricals, initialPumps, initialFires, initialEvStations } from '../constants/equipmentData';

export function useEquipmentState(showToast, token, setToken, isDraggingAnyPanel, dragEndTrigger) {
  // EV Stations data
  const [evStations, setEvStations] = useState(initialEvStations);

  // Equipment data states
  const [chillers, setChillers] = useState(initialChillers);

  const [ahus, setAhus] = useState(initialAhus);

  const [electricals, setElectricals] = useState(initialElectricals);

  const [pumps, setPumps] = useState(initialPumps);

  const [fires, setFires] = useState(initialFires);

  const [isFetching, setIsFetching] = useState(false);
  const isFetchingRef = React.useRef(false); // Track if fetch is in progress
  
  // Store pending data during drag
  const pendingDataRef = React.useRef(null);

  // Apply pending data when drag stops
  useEffect(() => {
    // Only run if we have the drag tracking ref
    if (!isDraggingAnyPanel) return;
    
    // Check if drag stopped
    if (!isDraggingAnyPanel.current) {
      // If we have pending data, apply it
      if (pendingDataRef.current) {
        const data = pendingDataRef.current;
        pendingDataRef.current = null;
        
        // Apply all pending updates (only non-null values)
        if (data.evStations) setEvStations(data.evStations);
        if (data.chillers) setChillers(data.chillers);
        if (data.ahus) setAhus(data.ahus);
        if (data.electricals) setElectricals(data.electricals);
        if (data.pumps) setPumps(data.pumps);
        if (data.fires) setFires(data.fires);
      }
      
      // Clear isFetching if it's still set (in case fetch completed during drag)
      if (!isFetchingRef.current && isFetching) {
        setIsFetching(false);
      }
    }
  }, [dragEndTrigger, isDraggingAnyPanel, isFetching]); // Run when drag ends

  // Reusable fetch function
  const fetchData = useCallback(() => {
    if (!token) return Promise.resolve();
    
    // Skip starting a new fetch if user is dragging
    if (isDraggingAnyPanel && isDraggingAnyPanel.current) {
      return Promise.resolve();
    }
    
    isFetchingRef.current = true;
    setIsFetching(true);
    return fetch('https://bms-backend-rust.vercel.app/equipment-data', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            setToken('');
            showToast('Session expired. Please log in again.', 'warning');
          }
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.data) {
          // Group by type and sort by ID to match array indices
          const evData = data.data.filter(d => d.equipment_type === 'evcharger')
            .reduce((acc, curr) => {
              const key = curr.equipment_id;
              if (!acc[key] || new Date(curr.timestamp) > new Date(acc[key].timestamp)) {
                acc[key] = curr;
              }
              return acc;
            }, {});
          const evArray = Object.values(evData).map(d => ({ ...d.sensor_data, id: parseInt(d.equipment_id.split('-')[1]), name: d.equipment_id })).sort((a, b) => a.id - b.id);
          
          const chillerData = data.data.filter(d => d.equipment_type === 'chiller')
            .reduce((acc, curr) => {
              const key = curr.equipment_id;
              if (!acc[key] || new Date(curr.timestamp) > new Date(acc[key].timestamp)) {
                acc[key] = curr;
              }
              return acc;
            }, {});
          const chillerArray = Object.values(chillerData).map(d => ({ ...d.sensor_data, id: parseInt(d.equipment_id.split('-')[1]), name: d.equipment_id })).sort((a, b) => a.id - b.id);
          
          const ahuData = data.data.filter(d => d.equipment_type === 'ahu')
            .reduce((acc, curr) => {
              const key = curr.equipment_id;
              if (!acc[key] || new Date(curr.timestamp) > new Date(acc[key].timestamp)) {
                acc[key] = curr;
              }
              return acc;
            }, {});
          const ahuArray = Object.values(ahuData).map(d => ({ ...d.sensor_data, id: parseInt(d.equipment_id.split('-')[1]), name: d.equipment_id })).sort((a, b) => a.id - b.id);
          
          const electricalData = data.data.filter(d => d.equipment_type === 'electrical')
            .reduce((acc, curr) => {
              const key = curr.equipment_id;
              if (!acc[key] || new Date(curr.timestamp) > new Date(acc[key].timestamp)) {
                acc[key] = curr;
              }
              return acc;
            }, {});
          const electricalArray = Object.values(electricalData).map(d => ({ ...d.sensor_data, id: parseInt(d.equipment_id.split('-')[1]), name: d.equipment_id })).sort((a, b) => a.id - b.id);
          
          const pumpData = data.data.filter(d => d.equipment_type === 'pump')
            .reduce((acc, curr) => {
              const key = curr.equipment_id;
              if (!acc[key] || new Date(curr.timestamp) > new Date(acc[key].timestamp)) {
                acc[key] = curr;
              }
              return acc;
            }, {});
          const pumpArray = Object.values(pumpData).map(d => ({ ...d.sensor_data, id: parseInt(d.equipment_id.split('-')[1]), name: d.equipment_id })).sort((a, b) => a.id - b.id);
          
          const fireData = data.data.filter(d => d.equipment_type === 'fire')
            .reduce((acc, curr) => {
              const key = curr.equipment_id;
              if (!acc[key] || new Date(curr.timestamp) > new Date(acc[key].timestamp)) {
                acc[key] = curr;
              }
              return acc;
            }, {});
          const fireArray = Object.values(fireData).map(d => ({ ...d.sensor_data, id: parseInt(d.equipment_id.split('-')[1]), name: d.equipment_id })).sort((a, b) => a.id - b.id);

          // Check if user is currently dragging when fetch completes
          if (isDraggingAnyPanel && isDraggingAnyPanel.current) {
            // Buffer the data for later application
            pendingDataRef.current = {
              evStations: evArray.length ? evArray : null,
              chillers: chillerArray.length ? chillerArray : null,
              ahus: ahuArray.length ? ahuArray : null,
              electricals: electricalArray.length ? electricalArray : null,
              pumps: pumpArray.length ? pumpArray : null,
              fires: fireArray.length ? fireArray : null
            };
            // Don't update isFetching state during drag to prevent re-renders
            isFetchingRef.current = false;
          } else {
            // Apply immediately if not dragging
            if (evArray.length) setEvStations(evArray);
            if (chillerArray.length) setChillers(chillerArray);
            if (ahuArray.length) setAhus(ahuArray);
            if (electricalArray.length) setElectricals(electricalArray);
            if (pumpArray.length) setPumps(pumpArray);
            if (fireArray.length) setFires(fireArray);
            isFetchingRef.current = false;
            setIsFetching(false);
          }
        } else {
          // No data, safe to update fetching state
          isFetchingRef.current = false;
          setIsFetching(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch equipment data:', err);
        isFetchingRef.current = false;
        setIsFetching(false);
      });
  }, [token, isDraggingAnyPanel, showToast, setToken]);

  // Fetch data from backend
  useEffect(() => {
    if (!token) return;

    // Fetch immediately
    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [token, fetchData]);

  // Individual unit panels
  const [openEVUnits, setOpenEVUnits] = useState({});
  const [openChillerUnits, setOpenChillerUnits] = useState({});
  const [openAhuUnits, setOpenAhuUnits] = useState({});
  const [openElectricalUnits, setOpenElectricalUnits] = useState({});
  const [openPumpUnits, setOpenPumpUnits] = useState({});
  const [openFireUnits, setOpenFireUnits] = useState({});

  // Derived indicators
  const chillerIndicators = useMemo(() => chillers.map(c => c.status === 'fault' || (c.alert && c.alert !== 'Loading...' && c.alert !== 'None' && c.alert.trim() !== '') ? 'fault' : 'normal'), [chillers]);
  const ahuIndicators = useMemo(() => ahus.map(a => a.status === 'fault' || (a.alert && a.alert !== 'Loading...' && a.alert !== 'None' && a.alert.trim() !== '') ? 'fault' : 'normal'), [ahus]);
  const electricalIndicators = useMemo(() => electricals.map(e => e.status === 'fault' || (e.alert && e.alert !== 'Loading...' && e.alert !== 'None' && e.alert.trim() !== '') ? 'fault' : 'normal'), [electricals]);
  const pumpIndicators = useMemo(() => pumps.map(p => p.status === 'fault' || (p.alert && p.alert !== 'Loading...' && p.alert !== 'None' && p.alert.trim() !== '') ? 'fault' : 'normal'), [pumps]);
  const fireIndicators = useMemo(() => fires.map(f => f.status === 'fault' || (f.alert && f.alert !== 'Loading...' && f.alert !== 'None' && f.alert.trim() !== '') ? 'fault' : 'normal'), [fires]);

  // EV Summary
  const evSummary = useMemo(() => {
    const total = evStations.length;
    const charging = evStations.filter(s => s.status === 'charging').length;
    const available = evStations.filter(s => s.status === 'available').length;
    const fault = evStations.filter(s => s.status === 'fault').length;
    return { total, charging, available, fault };
  }, [evStations]);

  // Collect all faulty equipment
  const faultyEquipment = useMemo(() => {
    const faulty = [];
    
    // Check EV Stations
    evStations.forEach((station, index) => {
      if (station.status === 'fault' || station.accidentType === 'fuseDrop') {
        faulty.push({
          type: 'EV Charging Station',
          name: station.name,
          id: station.id,
          status: station.accidentType === 'fuseDrop' ? 'Fuse Drop' : 'Fault',
          index
        });
      }
    });
    
    // Check Chillers
    chillers.forEach((chiller, index) => {
      if (chiller.status === 'fault' || (chiller.alert && chiller.alert !== 'Loading...' && chiller.alert !== 'None' && chiller.alert.trim() !== '')) {
        faulty.push({
          type: 'Chiller',
          name: chiller.name,
          id: chiller.id,
          status: chiller.status === 'fault' ? 'Fault' : 'Alert',
          alert: chiller.alert,
          index
        });
      }
    });
    
    // Check AHUs
    ahus.forEach((ahu, index) => {
      if (ahu.status === 'fault' || (ahu.alert && ahu.alert !== 'Loading...' && ahu.alert !== 'None' && ahu.alert.trim() !== '')) {
        faulty.push({
          type: 'AHU',
          name: ahu.name,
          id: ahu.id,
          status: ahu.status === 'fault' ? 'Fault' : 'Alert',
          alert: ahu.alert,
          index
        });
      }
    });
    
    // Check Electrical
    electricals.forEach((electrical, index) => {
      if (electrical.status === 'fault' || (electrical.alert && electrical.alert !== 'Loading...' && electrical.alert !== 'None' && electrical.alert.trim() !== '')) {
        faulty.push({
          type: 'Electrical Panel',
          name: electrical.name,
          id: electrical.id,
          status: electrical.status === 'fault' ? 'Fault' : 'Alert',
          alert: electrical.alert,
          index
        });
      }
    });
    
    // Check Pumps
    pumps.forEach((pump, index) => {
      if (pump.status === 'fault' || (pump.alert && pump.alert !== 'Loading...' && pump.alert !== 'None' && pump.alert.trim() !== '')) {
        faulty.push({
          type: 'Water Pump',
          name: pump.name,
          id: pump.id,
          status: pump.status === 'fault' ? 'Fault' : 'Alert',
          alert: pump.alert,
          index
        });
      }
    });
    
    // Check Fires
    fires.forEach((fire, index) => {
      if (fire.status === 'fault' || (fire.alert && fire.alert !== 'Loading...' && fire.alert !== 'None' && fire.alert.trim() !== '')) {
        faulty.push({
          type: 'Fire Alarm',
          name: fire.name,
          id: fire.id,
          status: fire.status === 'fault' ? 'Fault' : 'Alert',
          alert: fire.alert,
          index
        });
      }
    });
    
    return faulty;
  }, [evStations, chillers, ahus, electricals, pumps, fires]);

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

  const handleRandomAccidentWrapped = useCallback(async () => {
    await handleRandomAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast, token);
    // Fetch new data immediately after accident is created
    fetchData();
  }, [evStations, chillers, ahus, electricals, pumps, fires, showToast, token, fetchData]);

  const handleRandomEVFuseDropWrapped = useCallback(async () => {
    await handleRandomEVFuseDrop(evStations, setEvStations, showToast, token);
    // Fetch new data immediately after fuse drop is created
    fetchData();
  }, [evStations, showToast, token, fetchData]);

  const handleFixAllAccidentWrapped = useCallback(async () => {
    await handleFixAllAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast, token);
    // Fetch new data immediately after all accidents are fixed
    fetchData();
  }, [evStations, chillers, ahus, electricals, pumps, fires, showToast, token, fetchData]);

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

    isFetching,

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
    faultyEquipment,

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
