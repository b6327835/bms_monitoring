import './App.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BuildingModel from './components/BuildingModel';
import React, { useState, useMemo, useCallback } from 'react';
import Draggable from 'react-draggable';

function OffscreenClock() {
  const spanRef = React.useRef(null);
  React.useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const tick = () => {
      if (spanRef.current) {
        spanRef.current.textContent = new Date().toLocaleDateString('en-US', options);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span ref={spanRef} />;
}

function App() {
  const [opacity, setOpacity] = useState(0.5);
  const [showBuilding, setShowBuilding] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEV, setShowEV] = useState(true);
  const [showChiller, setShowChiller] = useState(true);
  const [showAHU, setShowAHU] = useState(true);
  const [showElectrical, setShowElectrical] = useState(true);
  const [showPump, setShowPump] = useState(true);
  const [showFire, setShowFire] = useState(true);
  
  // Track if panels have been opened before
  const panelOpenedBefore = React.useRef({
    ev: false,
    sidebar: false,
    filter: false,
    equipment: false,
    accident: false
  });

  const [evPanelOpen, setEvPanelOpen] = useState(false);
  const [evPanelMin, setEvPanelMin] = useState(false);
  const [evPanelPos, setEvPanelPos] = useState({ x: window.innerWidth - 540, y: 70 });

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarMin, setSidebarMin] = useState(false);
  const [sidebarPos, setSidebarPos] = useState({ x: 20, y: 70 });
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterMin, setFilterMin] = useState(false);
  const [filterPos, setFilterPos] = useState({ x: 320, y: 145 });
  const [equipmentPanelOpen, setEquipmentPanelOpen] = useState(false);
  const [equipmentPanelType, setEquipmentPanelType] = useState('chiller');
  const [equipmentPanelMin, setEquipmentPanelMin] = useState(false);
  const [equipmentPanelPos, setEquipmentPanelPos] = useState({ x: 320, y: 480 });

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

  const evSummary = useMemo(() => {
    const total = evStations.length;
    const charging = evStations.filter(s => s.status === 'charging').length;
    const available = evStations.filter(s => s.status === 'available').length;
    const fault = evStations.filter(s => s.status === 'fault').length;
    return { total, charging, available, fault };
  }, [evStations]);

  const [accidentOpen, setAccidentOpen] = useState(false);
  const [accidentLock, setAccidentLock] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [accidentMin, setAccidentMin] = useState(false);
  const [accidentPos, setAccidentPos] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 420 });

  // Non-EV equipment accident indicators
  const CHILLER_COUNT = 3;
  const AHU_COUNT = 12;
  const ELECTRICAL_COUNT = 8;
  const PUMP_COUNT = 6;
  const FIRE_COUNT = 15;
  const [chillerIndicators, setChillerIndicators] = useState(Array(CHILLER_COUNT).fill('normal'));
  const [ahuIndicators, setAhuIndicators] = useState(Array(AHU_COUNT).fill('normal'));
  const [electricalIndicators, setElectricalIndicators] = useState(Array(ELECTRICAL_COUNT).fill('normal'));
  const [pumpIndicators, setPumpIndicators] = useState(Array(PUMP_COUNT).fill('normal'));
  const [fireIndicators, setFireIndicators] = useState(Array(FIRE_COUNT).fill('normal'));

  // Store scroll positions for all panels at parent level
  const scrollPositions = React.useRef({
    accident: 0,
    sidebar: 0,
    filter: 0,
    equipment: 0,
    ev: 0
  });

  // Calculate smart position for new panels
  const getSmartPosition = useCallback((panelId, width = 200) => {
    // Collect all currently open or minimized panels with their positions
    const openPanels = [];
    
    if ((evPanelOpen || evPanelMin) && panelId !== 'ev') {
      openPanels.push({ ...evPanelPos, width: 380, height: 60 });
    }
    if ((sidebarVisible || sidebarMin) && panelId !== 'sidebar') {
      openPanels.push({ ...sidebarPos, width: 220, height: 60 });
    }
    if ((filterVisible || filterMin) && panelId !== 'filter') {
      openPanels.push({ ...filterPos, width: 180, height: 60 });
    }
    if ((equipmentPanelOpen || equipmentPanelMin) && panelId !== 'equipment') {
      openPanels.push({ ...equipmentPanelPos, width: 480, height: 60 });
    }
    if ((accidentOpen || accidentMin) && panelId !== 'accident') {
      openPanels.push({ ...accidentPos, width: 200, height: 60 });
    }
    
    // Default position: top left
    let bestX = 20;
    let bestY = 70;
    
    // If there are open panels, position below/next to them
    if (openPanels.length > 0) {
      // Sort panels by Y position (top to bottom)
      openPanels.sort((a, b) => a.y - b.y);
      
      // Try to find a position that doesn't overlap
      for (let testY = 70; testY < window.innerHeight - 200; testY += 60) {
        let hasOverlap = false;
        
        for (const panel of openPanels) {
          // Check if this position overlaps with existing panel
          const horizontalOverlap = bestX < panel.x + panel.width && bestX + width > panel.x;
          const verticalOverlap = testY < panel.y + 300 && testY + 300 > panel.y;
          
          if (horizontalOverlap && verticalOverlap) {
            hasOverlap = true;
            break;
          }
        }
        
        if (!hasOverlap) {
          bestY = testY;
          break;
        }
      }
    }
    
    return { x: bestX, y: bestY };
  }, [evPanelOpen, evPanelMin, evPanelPos, sidebarVisible, sidebarMin, sidebarPos, 
      filterVisible, filterMin, filterPos, equipmentPanelOpen, equipmentPanelMin, 
      equipmentPanelPos, accidentOpen, accidentMin, accidentPos]);

  // Helper to open equipment panel with smart positioning
  const openEquipmentPanel = useCallback((type) => {
    setEquipmentPanelType(type);
    if (!equipmentPanelOpen && !panelOpenedBefore.current.equipment) {
      const pos = getSmartPosition('equipment', 480);
      setEquipmentPanelPos(pos);
      panelOpenedBefore.current.equipment = true;
    }
    setEquipmentPanelOpen(true);
  }, [equipmentPanelOpen, getSmartPosition]);

  // Helper to open EV panel with smart positioning
  const openEVPanel = useCallback(() => {
    if (!evPanelOpen && !panelOpenedBefore.current.ev) {
      const pos = getSmartPosition('ev', 380);
      setEvPanelPos(pos);
      panelOpenedBefore.current.ev = true;
    }
    setEvPanelOpen(true);
  }, [evPanelOpen, getSmartPosition]);

  // Smart toggle handlers for panels
  const toggleSidebar = useCallback(() => {
    setSidebarVisible((v) => {
      if (!v && !panelOpenedBefore.current.sidebar) {
        const pos = getSmartPosition('sidebar', 220);
        setSidebarPos(pos);
        panelOpenedBefore.current.sidebar = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleFilter = useCallback(() => {
    setFilterVisible((v) => {
      if (!v && !panelOpenedBefore.current.filter) {
        const pos = getSmartPosition('filter', 180);
        setFilterPos(pos);
        panelOpenedBefore.current.filter = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleEquipment = useCallback(() => {
    setEquipmentPanelOpen((v) => {
      if (!v && !panelOpenedBefore.current.equipment) {
        const pos = getSmartPosition('equipment', 480);
        setEquipmentPanelPos(pos);
        panelOpenedBefore.current.equipment = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleEV = useCallback(() => {
    setEvPanelOpen((v) => {
      if (!v && !panelOpenedBefore.current.ev) {
        const pos = getSmartPosition('ev', 380);
        setEvPanelPos(pos);
        panelOpenedBefore.current.ev = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleAccident = useCallback(() => {
    setAccidentOpen((v) => {
      if (!v && !panelOpenedBefore.current.accident) {
        const pos = getSmartPosition('accident', 200);
        setAccidentPos(pos);
        panelOpenedBefore.current.accident = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  // Memoized callbacks to prevent unnecessary re-renders
  const closeAccident = useCallback(() => setAccidentOpen(false), []);
  const closeSidebar = useCallback(() => setSidebarVisible(false), []);
  const closeFilter = useCallback(() => setFilterVisible(false), []);
  const closeEquipment = useCallback(() => setEquipmentPanelOpen(false), []);
  const closeEV = useCallback(() => setEvPanelOpen(false), []);

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '' }), 5000);
  }

  function pickRandomIndex(filterFn) {
    const idxs = evStations
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => (filterFn ? filterFn(s) : true))
      .map(({ i }) => i);
    if (idxs.length === 0) return -1;
    return idxs[Math.floor(Math.random() * idxs.length)];
  }

  function handleRandomAccident() {
    if (accidentLock) return;
    // Choose a random equipment type
    const types = ['ev', 'chiller', 'ahu', 'electrical', 'pump', 'fire'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'ev') {
      setEvStations((prev) => {
        const i = pickRandomIndex((s) => s.status !== 'fault');
        if (i < 0) return prev;
        const next = prev.slice();
        next[i] = { ...next[i], status: 'fault', accidentType: 'fault' };
        showToast(`${next[i].name}: Accident occurred`, 'danger');
        return next;
      });
      return;
    }

    const setMap = {
      chiller: setChillerIndicators,
      ahu: setAhuIndicators,
      electrical: setElectricalIndicators,
      pump: setPumpIndicators,
      fire: setFireIndicators
    };
    const currentMap = {
      chiller: chillerIndicators,
      ahu: ahuIndicators,
      electrical: electricalIndicators,
      pump: pumpIndicators,
      fire: fireIndicators
    };
    const arr = currentMap[type];
    const normals = arr
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => v === 'normal')
      .map(({ i }) => i);
    if (normals.length === 0) return;
    const idx = normals[Math.floor(Math.random() * normals.length)];
    setMap[type]((prev) => {
      const next = prev.slice();
      next[idx] = 'fault';
      return next;
    });
    showToast(`${type.toUpperCase()} ${idx + 1}: Accident occurred`, 'danger');
  }

  function handleRandomEVFuseDrop() {
    if (accidentLock) return;
    setEvStations((prev) => {
      const i = pickRandomIndex(() => true);
      if (i < 0) return prev;
      const station = prev[i];
      const v2 = station.voltage.v2;
      const v3 = station.voltage.v3;
      const nextAvg = Math.round((v2 + v3) / 2);
      const next = prev.slice();
      next[i] = {
        ...station,
        status: 'fault',
        accidentType: 'fuseDrop',
        voltage: { ...station.voltage, v1: 0, average: nextAvg }
      };
      showToast(`${next[i].name}: Fuse Dropped (V1 = 0V)`, 'warning');
      return next;
    });
  }

  function handleStopAccident() {
    setAccidentLock((prev) => {
      const next = !prev;
      showToast(next ? 'Accidents locked' : 'Accidents resumed', 'success');
      return next;
    });
  }

  function handleFixAllAccident() {
    setEvStations((prev) => prev.map((s) => {
      const fixedV1 = s.voltage.v1 === 0 ? 230 : s.voltage.v1;
      const avg = Math.round((fixedV1 + s.voltage.v2 + s.voltage.v3) / 3);
      return {
        ...s,
        status: s.status === 'fault' ? 'available' : s.status,
        accidentType: undefined,
        voltage: { ...s.voltage, v1: fixedV1, average: avg }
      };
    }));
    setChillerIndicators(Array(CHILLER_COUNT).fill('normal'));
    setAhuIndicators(Array(AHU_COUNT).fill('normal'));
    setElectricalIndicators(Array(ELECTRICAL_COUNT).fill('normal'));
    setPumpIndicators(Array(PUMP_COUNT).fill('normal'));
    setFireIndicators(Array(FIRE_COUNT).fill('normal'));
    showToast('All accidents fixed', 'success');
  }

  const DraggablePanel = React.memo(({ panelId, title, position, setPosition, minimized, setMinimized, onClose, width = 200, children }) => {
    const nodeRef = React.useRef(null);
    const contentRef = React.useRef(null);
    
    // Calculate minimized width based on title length
    const minimizedWidth = minimized ? Math.max(120, title.length * 6 + 60) : width;
    
    // Restore scroll position BEFORE paint (synchronous)
    React.useLayoutEffect(() => {
      if (contentRef.current && !minimized) {
        const savedScroll = scrollPositions.current[panelId] || 0;
        if (contentRef.current.scrollTop !== savedScroll) {
          contentRef.current.scrollTop = savedScroll;
        }
      }
    }); // No deps = runs after every render
    
    // Save scroll position on scroll
    const handleScroll = (e) => {
      if (scrollPositions.current) {
        scrollPositions.current[panelId] = e.target.scrollTop;
      }
    };
    
    // Prevent drag when clicking buttons
    const handleMinimize = (e) => {
      e.stopPropagation();
      setMinimized(!minimized);
    };
    
    const handleClose = (e) => {
      e.stopPropagation();
      onClose();
    };
    
    return (
      <Draggable
        nodeRef={nodeRef}
        position={position}
        onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
        handle=".drag-handle"
      >
        <div ref={nodeRef} style={{ position: 'absolute', width: minimizedWidth, background: 'rgba(17,24,39,0.95)', color: '#e5e7eb', borderRadius: 6, boxShadow: '0 8px 20px rgba(0,0,0,0.4)', border: '1px solid #1f2937', zIndex: 3, overflow: 'hidden', fontSize: 11, transition: 'width 0.2s ease' }}>
          <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#111827', cursor: 'move', borderBottom: minimized ? 'none' : '1px solid #1f2937', userSelect: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button title={minimized ? 'Expand' : 'Minimize'} onClick={handleMinimize} onMouseDown={(e) => e.stopPropagation()} style={{ border: '1px solid #374151', background: '#1f2937', color: '#e5e7eb', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', fontSize: 10, lineHeight: 1 }}>{minimized ? '▢' : '▁'}</button>
              <button title="Close" onClick={handleClose} onMouseDown={(e) => e.stopPropagation()} style={{ border: '1px solid #7f1d1d', background: '#b91c1c', color: 'white', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', fontSize: 10, lineHeight: 1 }}>✕</button>
            </div>
          </div>
          {!minimized && (
            <div 
              ref={contentRef}
              onScroll={handleScroll}
              style={{ padding: 6, maxHeight: '50vh', overflow: 'auto', fontSize: 10 }}
            >
              {children}
            </div>
          )}
        </div>
      </Draggable>
    );
  });

  return (
    <div className="App">
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* Small top-left title and datetime */}
        <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 3, color: '#e5e7eb', fontSize: 12, display: 'flex', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>3D Building Simulation - BMS Monitoring</div>
          <div style={{ opacity: 0.8 }}><OffscreenClock /></div>
        </div>

        {/* Transparency slider - above bottom-left dock */}
        <div style={{
          position: 'absolute',
          bottom: '68px',
          left: '16px',
          zIndex: 4,
          background: 'rgba(17,24,39,0.8)',
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid #1f2937',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <label htmlFor="opacity" style={{ color: '#e5e7eb', fontSize: 11, fontWeight: 600 }}>Opacity:</label>
          <input
            id="opacity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            style={{ width: '100px' }}
          />
          <span style={{ color: '#9ca3af', fontSize: 10, minWidth: '30px' }}>{Math.round(opacity * 100)}%</span>
        </div>

        {/* Bottom-left dock buttons (dark/compact) */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 4, background: 'rgba(17,24,39,0.6)', padding: 6, borderRadius: 10, border: '1px solid #1f2937', boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
          <button title="Sidebar" onClick={toggleSidebar} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>S</button>
          <button title="Filter" onClick={toggleFilter} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>F</button>
          <button title="Equipment" onClick={toggleEquipment} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>E</button>
          <button title="EV Panel" onClick={toggleEV} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>EV</button>
        </div>

        {/* Bottom-right dock for Accident */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 4, background: 'rgba(17,24,39,0.6)', padding: 6, borderRadius: 10, border: '1px solid #1f2937', boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
          <button title="Accident" onClick={toggleAccident} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #7f1d1d', background: '#7f1d1d', color: 'white', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>A</button>
        </div>

        {/* System Lock Indicator */}
        {accidentLock && (
          <div style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#7f8c8d', color: 'white', padding: '8px 15px', borderRadius: '50px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            System accidents are locked
          </div>
        )}


        {/* Accident Controls Panel (draggable) */}
        {accidentOpen && (
          <DraggablePanel panelId="accident" title="Accident Controls" position={accidentPos} setPosition={setAccidentPos} minimized={accidentMin} setMinimized={setAccidentMin} onClose={closeAccident} width={200}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={handleRandomAccident} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#e5e7eb', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Random accident</button>
              <button onClick={handleRandomEVFuseDrop} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#e5e7eb', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Random Drop EV Fuse</button>
              <button onClick={handleStopAccident} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #374151', background: '#0b3d3a', color: '#a7f3d0', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}>{accidentLock ? 'Resume Accident' : 'Stop Accident'}</button>
              <button onClick={handleFixAllAccident} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #374151', background: '#0b3d0b', color: '#bbf7d0', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}>Fix ALL Accident</button>
            </div>
          </DraggablePanel>
        )}

        {/* Bottom-center toast notification */}
        {toast.visible && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
            background: toast.type === 'danger' ? '#dc2626' : (toast.type === 'warning' ? '#f59e0b' : '#10b981'),
            color: 'white',
            borderRadius: '10px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
            padding: '8px 12px',
            fontWeight: 800,
            fontSize: 12,
            maxWidth: '80vw'
          }}>
            {toast.message}
          </div>
        )}

        {/* Sidebar (draggable) */}
        {sidebarVisible && (
          <DraggablePanel panelId="sidebar" title="Sidebar" position={sidebarPos} setPosition={setSidebarPos} minimized={sidebarMin} setMinimized={setSidebarMin} onClose={closeSidebar} width={220}>
            <div style={{ fontWeight: 800, borderBottom: '1px solid #1f2937', paddingBottom: '6px', marginBottom: '8px', color: '#e5e7eb' }}>System Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0b1220', padding: '8px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <span>BMS</span><span style={{ color: '#10b981', fontWeight: 800 }}>Normal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0b1220', padding: '8px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <span>Electrical</span><span style={{ color: '#10b981', fontWeight: 800 }}>Normal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0b1220', padding: '8px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                <span>HVAC</span><span style={{ color: '#f59e0b', fontWeight: 800 }}>Check</span>
              </div>
            </div>
            <div style={{ fontWeight: 800, borderBottom: '1px solid #1f2937', paddingBottom: '6px', marginBottom: '8px', color: '#e5e7eb' }}>Floors</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 12 }}>
              {['All Overview','Floor 1 - Lobby & EV','Floor 2 - Office','Floor 3 - Data Center','Floor 4 - Mechanical','Floor 5 - Rooftop'].map((t, i) => (
                <button key={i} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', textAlign: 'left', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>{t}</button>
              ))}
            </div>
            <div style={{ fontWeight: 800, borderBottom: '1px solid #1f2937', paddingBottom: '6px', marginBottom: '8px', color: '#e5e7eb' }}>Equipment</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => openEquipmentPanel('chiller')} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Chiller System (3)</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: chillerIndicators.some(v => v === 'fault') ? '#ef4444' : '#f59e0b' }} />
              </button>
              <button onClick={() => openEquipmentPanel('ahu')} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>AHU Units (12)</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: ahuIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={() => openEquipmentPanel('electrical')} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Electrical Panel (8)</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: electricalIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={() => openEquipmentPanel('pump')} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Water Pump System (6)</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: pumpIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={() => openEquipmentPanel('fire')} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Fire Alarm System (15)</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: fireIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={openEVPanel} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>EV Charging Stations (30)</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: evStations.some(s => s.status === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
            </div>
          </DraggablePanel>
        )}

        {/* Equipment Filter panel (draggable) */}
        {filterVisible && (
          <DraggablePanel panelId="filter" title="Show Equipment" position={filterPos} setPosition={setFilterPos} minimized={filterMin} setMinimized={setFilterMin} onClose={closeFilter} width={180}>
            {[{label:'Chiller', state: showChiller, set:setShowChiller, color:'#3498db'}, {label:'AHU', state: showAHU, set:setShowAHU, color:'#2ecc71'}, {label:'Electrical', state: showElectrical, set:setShowElectrical, color:'#f39c12'}, {label:'Water Pump', state: showPump, set:setShowPump, color:'#9b59b6'}, {label:'Fire Alarm', state: showFire, set:setShowFire, color:'#e74c3c'}, {label:'EV Charging', state: showEV, set:setShowEV, color:'#1abc9c'}].map((it, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: it.color }} />
                <span style={{ flex: 1, color: '#e5e7eb', fontSize: 12 }}>{it.label}</span>
                <input type="checkbox" checked={it.state} onChange={(e) => it.set(e.target.checked)} />
              </label>
            ))}
          </DraggablePanel>
        )}

        {/* Equipment details panel (draggable) */}
        {equipmentPanelOpen && (
          <DraggablePanel panelId="equipment" title={(equipmentPanelType === 'chiller' ? 'Chiller System' : equipmentPanelType === 'ahu' ? 'AHU Units' : equipmentPanelType === 'electrical' ? 'Electrical Panel' : equipmentPanelType === 'pump' ? 'Water Pump System' : equipmentPanelType === 'fire' ? 'Fire Alarm System' : 'EV Charging Stations')} position={equipmentPanelPos} setPosition={setEquipmentPanelPos} minimized={equipmentPanelMin} setMinimized={setEquipmentPanelMin} onClose={closeEquipment} width={480}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              <div><div style={{ color: '#9ca3af', fontSize: '11px' }}>Status</div><div style={{ fontWeight: 800 }}>Normal</div></div>
              <div><div style={{ color: '#9ca3af', fontSize: '11px' }}>Temp</div><div style={{ fontWeight: 800 }}>{equipmentPanelType === 'chiller' ? '7.2 °C' : equipmentPanelType === 'ahu' ? '22.5 °C' : equipmentPanelType === 'electrical' ? '35.2 °C' : equipmentPanelType === 'pump' ? '8.7 °C' : 'N/A'}</div></div>
              <div><div style={{ color: '#9ca3af', fontSize: '11px' }}>Pressure</div><div style={{ fontWeight: 800 }}>{equipmentPanelType === 'chiller' ? '4.2 Bar' : equipmentPanelType === 'ahu' ? '1.8 Bar' : equipmentPanelType === 'pump' ? '3.5 Bar' : 'N/A'}</div></div>
              <div><div style={{ color: '#9ca3af', fontSize: '11px' }}>Power</div><div style={{ fontWeight: 800 }}>{equipmentPanelType === 'electrical' ? '245.8 kW' : equipmentPanelType === 'chiller' ? '45.8 kW' : equipmentPanelType === 'ahu' ? '12.3 kW' : equipmentPanelType === 'pump' ? '8.7 kW' : '0.5 kW'}</div></div>
              <div><div style={{ color: '#9ca3af', fontSize: '11px' }}>Runtime</div><div style={{ fontWeight: 800 }}>{equipmentPanelType === 'electrical' || equipmentPanelType === 'fire' ? 'Continuous' : '1,248 h'}</div></div>
              <div><div style={{ color: '#9ca3af', fontSize: '11px' }}>Latest Alert</div><div style={{ fontWeight: 800 }}>{equipmentPanelType === 'chiller' ? 'High temp' : equipmentPanelType === 'fire' ? 'Anomaly Zone 2' : 'None'}</div></div>
            </div>
          </DraggablePanel>
        )}

        {/* EV Panel (draggable) */}
        {evPanelOpen && (
          <DraggablePanel panelId="ev" title="EV Charging Status" position={evPanelPos} setPosition={setEvPanelPos} minimized={evPanelMin} setMinimized={setEvPanelMin} onClose={closeEV} width={380}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: 8 }}>
              <div style={{ background: '#0b1220', borderLeft: '3px solid #1f2937', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{evSummary.total}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Total</div>
              </div>
              <div style={{ background: '#0b1220', borderLeft: '3px solid #f59e0b', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{evSummary.charging}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Charging</div>
              </div>
              <div style={{ background: '#0b1220', borderLeft: '3px solid #10b981', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{evSummary.available}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Available</div>
              </div>
              <div style={{ background: '#0b1220', borderLeft: '3px solid #ef4444', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{evSummary.fault}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Fault</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: 6 }}>Stations</div>
            <div>
              {evStations.map((s) => {
                const statusColor = s.status === 'charging' ? '#f59e0b' : s.status === 'fault' ? '#ef4444' : '#10b981';
                const statusText = s.status.charAt(0).toUpperCase() + s.status.slice(1);
                return (
                  <div key={s.id} style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', marginBottom: '8px', background: '#0b1220' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700 }}>{s.name} ({s.type})</div>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                      <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={{ fontWeight: 600 }}>{statusText}</span></div>
                      <div><span style={{ color: '#9ca3af' }}>Power: </span><span style={{ fontWeight: 600 }}>{s.power}</span></div>
                      <div><span style={{ color: '#9ca3af' }}>Usage: </span><span style={{ fontWeight: 600 }}>{s.usageTime}</span></div>
                      <div><span style={{ color: '#9ca3af' }}>Temp: </span><span style={{ fontWeight: 600 }}>{s.temp}</span></div>
                      <div><span style={{ color: '#9ca3af' }}>Connector: </span><span style={{ fontWeight: 600 }}>{s.connector}</span></div>
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 700, marginBottom: '4px' }}>Voltage (V)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        <div style={{ background: '#111827', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>V1</div>
                          <div style={{ fontWeight: 700 }}>{s.voltage.v1}</div>
                        </div>
                        <div style={{ background: '#111827', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>V2</div>
                          <div style={{ fontWeight: 700 }}>{s.voltage.v2}</div>
                        </div>
                        <div style={{ background: '#111827', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>V3</div>
                          <div style={{ fontWeight: 700 }}>{s.voltage.v3}</div>
                        </div>
                        <div style={{ background: '#0ea5a4', borderRadius: '6px', padding: '6px', textAlign: 'center', color: 'white' }}>
                          <div style={{ fontSize: '10px' }}>Avg</div>
                          <div style={{ fontWeight: 800 }}>{s.voltage.average}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DraggablePanel>
        )}
        <Canvas 
          camera={{ position: [8, 2, 8] }} 
          style={{ background: '#151518ff' }}
          shadows
        >
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          <BuildingModel 
            opacity={opacity}
            showBuilding={showBuilding}
            showGrid={showGrid}
            showEV={showEV}
            showChiller={showChiller}
            showAHU={showAHU}
            showElectrical={showElectrical}
            showPump={showPump}
            showFire={showFire}
            evIndicators={evStations.map((s) => s.accidentType === 'fuseDrop' ? 'fuseDrop' : (s.status === 'fault' ? 'fault' : s.status))}
            chillerIndicators={chillerIndicators}
            ahuIndicators={ahuIndicators}
            electricalIndicators={electricalIndicators}
            pumpIndicators={pumpIndicators}
            fireIndicators={fireIndicators}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
