import './App.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BuildingModel from './components/BuildingModel';
import React, { useState, useCallback } from 'react';
import commitHash from './version';
import { initialChillers, initialAhus, initialElectricals, initialPumps, initialFires } from './constants/equipmentData';
import EquipmentOverviewPanels from './components/EquipmentOverviewPanels';
import IndividualUnitPanels from './components/IndividualUnitPanels';
import DraggablePanel from './components/DraggablePanel';
import FaultyEquipmentPanel from './components/FaultyEquipmentPanel';
import { useEquipmentState } from './hooks/useEquipmentState';
import { usePanelState } from './hooks/usePanelState';
import { showToast as showToastUtil } from './utils/panelUtils';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://bms-backend-rust.vercel.app/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        onLogin(data.token);
      } else {
        alert('Login failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
}

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [opacity, setOpacity] = useState(0.5);
  const [showBuilding, setShowBuilding] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEV, setShowEV] = useState(true);
  const [showChiller, setShowChiller] = useState(true);
  const [showAHU, setShowAHU] = useState(true);
  const [showElectrical, setShowElectrical] = useState(true);
  const [showPump, setShowPump] = useState(true);
  const [showFire, setShowFire] = useState(true);

  // Global drag state tracking
  const isDraggingAnyPanel = React.useRef(false);
  const dragCount = React.useRef(0);
  const [dragEndTrigger, setDragEndTrigger] = useState(0); // Trigger to notify when drag ends

  const handleDragStart = useCallback(() => {
    dragCount.current++;
    isDraggingAnyPanel.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    dragCount.current--;
    if (dragCount.current <= 0) {
      dragCount.current = 0;
      isDraggingAnyPanel.current = false;
      // Notify that drag ended by incrementing trigger
      setDragEndTrigger(prev => prev + 1);
    }
  }, []);

  // Camera controls
  const cameraControlsRef = React.useRef(null);
  const zoomIntervalRef = React.useRef(null);

  // Use panel state hook
  const {
    chillerPanelOpen, setChillerPanelOpen, chillerPanelMin, setChillerPanelMin, chillerPanelPos, setChillerPanelPos,
    ahuPanelOpen, setAhuPanelOpen, ahuPanelMin, setAhuPanelMin, ahuPanelPos, setAhuPanelPos,
    electricalPanelOpen, setElectricalPanelOpen, electricalPanelMin, setElectricalPanelMin, electricalPanelPos, setElectricalPanelPos,
    pumpPanelOpen, setPumpPanelOpen, pumpPanelMin, setPumpPanelMin, pumpPanelPos, setPumpPanelPos,
    firePanelOpen, setFirePanelOpen, firePanelMin, setFirePanelMin, firePanelPos, setFirePanelPos,
    evPanelOpen, setEvPanelOpen, evPanelMin, setEvPanelMin, evPanelPos, setEvPanelPos,
    sidebarVisible, setSidebarVisible, sidebarMin, setSidebarMin, sidebarPos, setSidebarPos,
    filterVisible, setFilterVisible, filterMin, setFilterMin, filterPos, setFilterPos,
    floorsVisible, setFloorsVisible, floorsMin, setFloorsMin, floorsPos, setFloorsPos,
    equipmentOverviewVisible, setEquipmentOverviewVisible, equipmentOverviewMin, setEquipmentOverviewMin, equipmentOverviewPos, setEquipmentOverviewPos,
    accidentOpen, setAccidentOpen, accidentMin, setAccidentMin, accidentPos, setAccidentPos,
    openEVPanel,
    toggleSidebar,
    toggleFilter,
    toggleFloors,
    toggleEquipmentOverview,
    toggleChillerPanel,
    toggleAhuPanel,
    toggleElectricalPanel,
    togglePumpPanel,
    toggleFirePanel,
    toggleEV,
    toggleAccident,
    closeAccident,
    closeSidebar,
    closeFilter,
    closeEV,
    closeFloors,
    closeEquipmentOverview,
    closeChillerPanel,
    closeAhuPanel,
    closeElectricalPanel,
    closePumpPanel,
    closeFirePanel
  } = usePanelState();

  // Create showToast function
  const showToast = useCallback((message, type = 'success') => {
    showToastUtil(setToast, message, type);
  }, []);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Use equipment state hook
  const {
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
    chillerIndicators,
    ahuIndicators,
    electricalIndicators,
    pumpIndicators,
    fireIndicators,
    evSummary,
    faultyEquipment,
    openIndividualEV,
    openIndividualChiller,
    openIndividualAhu,
    openIndividualElectrical,
    openIndividualPump,
    openIndividualFire,
    closeIndividualUnit,
    handleRandomAccident,
    handleRandomEVFuseDrop,
    handleFixAllAccident
  } = useEquipmentState(showToast, token, setToken, isDraggingAnyPanel, dragEndTrigger);

  // Store scroll positions for all panels at parent level
  const scrollPositions = React.useRef({
    accident: 0,
    sidebar: 0,
    filter: 0,
    ev: 0,
    floors: 0,
    equipmentOverview: 0,
    chillerPanel: 0,
    ahuPanel: 0,
    electricalPanel: 0,
    pumpPanel: 0,
    firePanel: 0
  });


  // Helper to open EV panel with smart positioning (now from hook)

  // Function to calculate equipment position
  const getEquipmentPosition = useCallback((type, index) => {
    switch (type) {
      case 'EV Charging Station':
        const evRow = Math.floor(index / 6);
        const evCol = index % 6;
        return new THREE.Vector3(-20 + evCol * 6, 1, -10 + evRow * 4);
      
      case 'Chiller':
        return new THREE.Vector3(-20 + index * 20, 32, 0);
      
      case 'AHU':
        const ahuFloor = Math.floor(index / 3) + 1;
        return new THREE.Vector3(-15 + (index % 3) * 15, ahuFloor * 8, 12);
      
      case 'Electrical Panel':
        const electricalFloor = Math.floor(index / 2) + 1;
        return new THREE.Vector3(25, electricalFloor * 8, -8 + (index % 2) * 16);
      
      case 'Water Pump':
        return new THREE.Vector3(8 + (index % 3) * 8, 8, 8 + Math.floor(index / 3) * 6);
      
      case 'Fire Alarm':
        const fireFloor = Math.floor(index / 3);
        return new THREE.Vector3(-12 + (index % 3) * 12, fireFloor * 8, -10);
      
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }, []);

  // Function to move camera to equipment with smooth animation
  const moveCameraToEquipment = useCallback((type, index) => {
    if (!cameraControlsRef.current) return;
    
    const targetPosition = getEquipmentPosition(type, index);
    const camera = cameraControlsRef.current.object;
    const controls = cameraControlsRef.current;
    
    // Calculate new camera position (offset from target)
    const offset = new THREE.Vector3(8, 5, 8);
    const newCameraPosition = targetPosition.clone().add(offset);
    const newTargetPosition = targetPosition.clone();
    
    // Store current positions
    const startCameraPosition = camera.position.clone();
    const startTargetPosition = controls.target.clone();
    
    // Animation parameters
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate camera position
      camera.position.lerpVectors(startCameraPosition, newCameraPosition, easeProgress);
      
      // Interpolate target position
      controls.target.lerpVectors(startTargetPosition, newTargetPosition, easeProgress);
      
      // Update controls
      controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animate();
  }, [getEquipmentPosition]);

  // Handler to open faulty equipment panel
  const handleOpenFaultyEquipment = useCallback((item) => {
    // Move camera to equipment first
    moveCameraToEquipment(item.type, item.index);
    
    // Then open the individual panel
    switch (item.type) {
      case 'EV Charging Station':
        openIndividualEV(item.index);
        break;
      case 'Chiller':
        openIndividualChiller(item.index);
        break;
      case 'AHU':
        openIndividualAhu(item.index);
        break;
      case 'Electrical Panel':
        openIndividualElectrical(item.index);
        break;
      case 'Water Pump':
        openIndividualPump(item.index);
        break;
      case 'Fire Alarm':
        openIndividualFire(item.index);
        break;
      default:
        console.warn('Unknown equipment type:', item.type);
    }
  }, [moveCameraToEquipment, openIndividualEV, openIndividualChiller, openIndividualAhu, openIndividualElectrical, openIndividualPump, openIndividualFire]);

  // Camera control functions
  const handleCameraHome = useCallback(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current.reset();
    }
  }, []);

  const startZoom = useCallback((direction) => {
    if (zoomIntervalRef.current) return;
    
    const zoom = () => {
      if (cameraControlsRef.current && cameraControlsRef.current.object) {
        const camera = cameraControlsRef.current.object;
        const target = cameraControlsRef.current.target;
        
        // Calculate direction vector from camera to target
        const direction_vec = {
          x: target.x - camera.position.x,
          y: target.y - camera.position.y,
          z: target.z - camera.position.z
        };
        
        // Normalize and scale - much smaller steps for smoother zoom
        const length = Math.sqrt(direction_vec.x ** 2 + direction_vec.y ** 2 + direction_vec.z ** 2);
        const scaleFactor = direction === 'in' ? 0.015 : -0.015; // Reduced from 0.05 to 0.015
        
        camera.position.x += (direction_vec.x / length) * scaleFactor * length;
        camera.position.y += (direction_vec.y / length) * scaleFactor * length;
        camera.position.z += (direction_vec.z / length) * scaleFactor * length;
        
        cameraControlsRef.current.update();
      }
    };
    
    zoom(); // Immediate zoom
    zoomIntervalRef.current = setInterval(zoom, 16); // ~60fps for smooth animation
  }, []);

  const stopZoom = useCallback(() => {
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
      zoomIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (zoomIntervalRef.current) {
        clearInterval(zoomIntervalRef.current);
      }
    };
  }, []);

  // Memoized callbacks to prevent unnecessary re-renders (now from hook)

  if (!token) {
    return <LoginForm onLogin={setToken} />;
  }

  return (
    <div className="App">
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* Small top-left title and datetime */}
        <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 3, color: '#e5e7eb', fontSize: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ fontWeight: 600 }}>3D Building Simulation - BMS Monitoring (WIP)</div>
            <div style={{ opacity: 0.8 }}><OffscreenClock /></div>
          </div>
          <div style={{ opacity: 0.8 }}>{commitHash.slice(0,7)}</div>
          {isFetching && <div style={{ opacity: 0.8, color: '#f59e0b', fontWeight: 600 }}>⟳</div>}
        </div>

        {/* Camera Controls - Vertical Dock (Top Right) */}
        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 4, display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(17,24,39,0.4)', padding: 6, borderRadius: 8, border: '1px solid rgba(31,41,55,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <button title="Reset Camera" onClick={handleCameraHome} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(55,65,81,0.6)', background: 'rgba(17,24,39,0.6)', color: '#e5e7eb', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠</button>
          <button 
            title="Zoom In (Hold to zoom continuously)" 
            onMouseDown={() => startZoom('in')} 
            onMouseUp={stopZoom} 
            onMouseLeave={stopZoom}
            style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(55,65,81,0.6)', background: 'rgba(17,24,39,0.6)', color: '#e5e7eb', fontWeight: 700, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
          <button 
            title="Zoom Out (Hold to zoom continuously)" 
            onMouseDown={() => startZoom('out')} 
            onMouseUp={stopZoom} 
            onMouseLeave={stopZoom}
            style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(55,65,81,0.6)', background: 'rgba(17,24,39,0.6)', color: '#e5e7eb', fontWeight: 700, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >−</button>
          <button title="Accident" onClick={toggleAccident} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #7f1d1d', background: '#7f1d1d', color: 'white', fontWeight: 800, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</button>
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
          <button title="Sidebar" onClick={toggleSidebar} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: sidebarVisible ? '#4f46e5' : '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>S</button>
          <button title="Floors" onClick={toggleFloors} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: floorsVisible ? '#4f46e5' : '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>FL</button>
          <button title="Equipment Overview" onClick={toggleEquipmentOverview} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: equipmentOverviewVisible ? '#4f46e5' : '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>EQ</button>
          <button title="Filter" onClick={toggleFilter} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: filterVisible ? '#4f46e5' : '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>F</button>
          <button title="EV Panel" onClick={toggleEV} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #374151', background: evPanelOpen ? '#4f46e5' : '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>EV</button>
        </div>

        {/* Accident Controls Panel (draggable) */}
        {accidentOpen && (
          <DraggablePanel panelId="accident" title="Accident Controls" position={accidentPos} setPosition={setAccidentPos} minimized={accidentMin} setMinimized={setAccidentMin} onClose={closeAccident} width={200} scrollPositions={scrollPositions} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={handleRandomAccident} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#e5e7eb', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Random accident</button>
              <button onClick={handleRandomEVFuseDrop} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#e5e7eb', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Random Drop EV Fuse</button>
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

        {/* Faulty Equipment Alert Panel */}
        <FaultyEquipmentPanel 
          faultyEquipment={faultyEquipment} 
          onOpenFaultyEquipment={handleOpenFaultyEquipment} 
        />

        {/* Sidebar (draggable) */}
        {sidebarVisible && (
          <DraggablePanel panelId="sidebar" title="Sidebar" position={sidebarPos} setPosition={setSidebarPos} minimized={sidebarMin} setMinimized={setSidebarMin} onClose={closeSidebar} width={220} scrollPositions={scrollPositions} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Use the dock to access floors and equipment overviews.</div>
          </DraggablePanel>
        )}

        {/* Floors panel (draggable) */}
        {floorsVisible && (
          <DraggablePanel panelId="floors" title="Floors" position={floorsPos} setPosition={setFloorsPos} minimized={floorsMin} setMinimized={setFloorsMin} onClose={closeFloors} width={220} scrollPositions={scrollPositions} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['All Overview','Floor 1 - Lobby & EV','Floor 2 - Office','Floor 3 - Data Center','Floor 4 - Mechanical','Floor 5 - Rooftop'].map((t, i) => (
                <button key={i} style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', textAlign: 'left', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>{t}</button>
              ))}
            </div>
          </DraggablePanel>
        )}

        {/* Equipment overview panel (draggable) */}
        {equipmentOverviewVisible && (
          <DraggablePanel panelId="equipmentOverview" title="Equipment Overview" position={equipmentOverviewPos} setPosition={setEquipmentOverviewPos} minimized={equipmentOverviewMin} setMinimized={setEquipmentOverviewMin} onClose={closeEquipmentOverview} width={230} scrollPositions={scrollPositions} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={toggleChillerPanel} style={{ background: chillerPanelOpen ? '#4f46e5' : '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Chiller System (3)</span>
                <span className={chillerIndicators.some(v => v === 'fault') ? 'fault-indicator' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: chillerIndicators.some(v => v === 'fault') ? '#ef4444' : '#f59e0b' }} />
              </button>
              <button onClick={toggleAhuPanel} style={{ background: ahuPanelOpen ? '#4f46e5' : '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>AHU Units (12)</span>
                <span className={ahuIndicators.some(v => v === 'fault') ? 'fault-indicator' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: ahuIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={toggleElectricalPanel} style={{ background: electricalPanelOpen ? '#4f46e5' : '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Electrical Panel (8)</span>
                <span className={electricalIndicators.some(v => v === 'fault') ? 'fault-indicator' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: electricalIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={togglePumpPanel} style={{ background: pumpPanelOpen ? '#4f46e5' : '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Water Pump System (6)</span>
                <span className={pumpIndicators.some(v => v === 'fault') ? 'fault-indicator' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: pumpIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={toggleFirePanel} style={{ background: firePanelOpen ? '#4f46e5' : '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>Fire Alarm System (15)</span>
                <span className={fireIndicators.some(v => v === 'fault') ? 'fault-indicator' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: fireIndicators.some(v => v === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
              <button onClick={openEVPanel} style={{ background: evPanelOpen ? '#4f46e5' : '#0b1220', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>EV Charging Stations (30)</span>
                <span className={evStations.some(s => s.status === 'fault') ? 'fault-indicator' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: evStations.some(s => s.status === 'fault') ? '#ef4444' : '#10b981' }} />
              </button>
            </div>
          </DraggablePanel>
        )}

        <EquipmentOverviewPanels
          chillerPanelOpen={chillerPanelOpen}
          chillerPanelPos={chillerPanelPos}
          setChillerPanelPos={setChillerPanelPos}
          chillerPanelMin={chillerPanelMin}
          setChillerPanelMin={setChillerPanelMin}
          closeChillerPanel={closeChillerPanel}
          chillers={chillers}

          ahuPanelOpen={ahuPanelOpen}
          ahuPanelPos={ahuPanelPos}
          setAhuPanelPos={setAhuPanelPos}
          ahuPanelMin={ahuPanelMin}
          setAhuPanelMin={setAhuPanelMin}
          closeAhuPanel={closeAhuPanel}
          ahus={ahus}

          electricalPanelOpen={electricalPanelOpen}
          electricalPanelPos={electricalPanelPos}
          setElectricalPanelPos={setElectricalPanelPos}
          electricalPanelMin={electricalPanelMin}
          setElectricalPanelMin={setElectricalPanelMin}
          closeElectricalPanel={closeElectricalPanel}
          electricals={electricals}

          pumpPanelOpen={pumpPanelOpen}
          pumpPanelPos={pumpPanelPos}
          setPumpPanelPos={setPumpPanelPos}
          pumpPanelMin={pumpPanelMin}
          setPumpPanelMin={setPumpPanelMin}
          closePumpPanel={closePumpPanel}
          pumps={pumps}

          firePanelOpen={firePanelOpen}
          firePanelPos={firePanelPos}
          setFirePanelPos={setFirePanelPos}
          firePanelMin={firePanelMin}
          setFirePanelMin={setFirePanelMin}
          closeFirePanel={closeFirePanel}
          fires={fires}
          
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />

        <IndividualUnitPanels
          openEVUnits={openEVUnits}
          setOpenEVUnits={setOpenEVUnits}
          evStations={evStations}
          closeIndividualUnit={closeIndividualUnit}

          openChillerUnits={openChillerUnits}
          setOpenChillerUnits={setOpenChillerUnits}
          chillers={chillers}

          openAhuUnits={openAhuUnits}
          setOpenAhuUnits={setOpenAhuUnits}
          ahus={ahus}

          openElectricalUnits={openElectricalUnits}
          setOpenElectricalUnits={setOpenElectricalUnits}
          electricals={electricals}

          openPumpUnits={openPumpUnits}
          setOpenPumpUnits={setOpenPumpUnits}
          pumps={pumps}

          openFireUnits={openFireUnits}
          setOpenFireUnits={setOpenFireUnits}
          fires={fires}
          
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />

        {/* Equipment Filter panel (draggable) */}
        {filterVisible && (
          <DraggablePanel panelId="filter" title="Show Equipment" position={filterPos} setPosition={setFilterPos} minimized={filterMin} setMinimized={setFilterMin} onClose={closeFilter} width={180} scrollPositions={scrollPositions} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {[{label:'Chiller', state: showChiller, set:setShowChiller, color:'#3498db'}, {label:'AHU', state: showAHU, set:setShowAHU, color:'#2ecc71'}, {label:'Electrical', state: showElectrical, set:setShowElectrical, color:'#f39c12'}, {label:'Water Pump', state: showPump, set:setShowPump, color:'#9b59b6'}, {label:'Fire Alarm', state: showFire, set:setShowFire, color:'#e74c3c'}, {label:'EV Charging', state: showEV, set:setShowEV, color:'#1abc9c'}].map((it, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: it.color }} />
                <span style={{ flex: 1, color: '#e5e7eb', fontSize: 12 }}>{it.label}</span>
                <input type="checkbox" checked={it.state} onChange={(e) => it.set(e.target.checked)} />
              </label>
            ))}
          </DraggablePanel>
        )}

        {evPanelOpen && (
          <DraggablePanel panelId="ev" title="EV Charging Status" position={evPanelPos} setPosition={setEvPanelPos} minimized={evPanelMin} setMinimized={setEvPanelMin} onClose={closeEV} width={380} scrollPositions={scrollPositions} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
          <OrbitControls ref={cameraControlsRef} enableZoom={true} enablePan={true} enableRotate={true} makeDefault />
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
            onOpenEVPanel={openIndividualEV}
            onOpenChillerPanel={openIndividualChiller}
            onOpenAhuPanel={openIndividualAhu}
            onOpenElectricalPanel={openIndividualElectrical}
            onOpenPumpPanel={openIndividualPump}
            onOpenFirePanel={openIndividualFire}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
