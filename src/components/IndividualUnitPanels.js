import React from 'react';
import DraggablePanel from './DraggablePanel';

export default function IndividualUnitPanels({
  // EV panels
  openEVUnits,
  setOpenEVUnits,
  evStations,
  closeIndividualUnit,

  // Chiller panels
  openChillerUnits,
  setOpenChillerUnits,
  chillers,

  // AHU panels
  openAhuUnits,
  setOpenAhuUnits,
  ahus,

  // Electrical panels
  openElectricalUnits,
  setOpenElectricalUnits,
  electricals,

  // Pump panels
  openPumpUnits,
  setOpenPumpUnits,
  pumps,

  // Fire panels
  openFireUnits,
  setOpenFireUnits,
  fires,
  
  // Drag callbacks
  onDragStart,
  onDragEnd,

  // Z-index management
  getPanelZIndex,
  bringPanelToFront
}) {
  return (
    <>
      {/* Individual EV Unit Panels */}
      {Object.values(openEVUnits).map((unit) => {
        const ev = evStations[unit.index];
        if (!ev) return null;
        const statusColor = ev.status === 'fault' ? '#ef4444' : ev.status === 'charging' ? '#3b82f6' : '#10b981';
        const statusText = ev.status.charAt(0).toUpperCase() + ev.status.slice(1);
        return (
          <DraggablePanel
            key={unit.id}
            panelId={unit.id}
            title={ev.name}
            position={unit.position}
            setPosition={(pos) => setOpenEVUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], position: pos } }))}
            minimized={unit.minimized}
            setMinimized={(min) => setOpenEVUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], minimized: min } }))}
            onClose={() => closeIndividualUnit(unit.id, 'ev')}
            width={350}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            zIndex={getPanelZIndex(unit.id)}
            onPanelClick={bringPanelToFront}
          >
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700 }}>{ev.name}</div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                <div><span style={{ color: '#9ca3af' }}>Type: </span><span style={{ fontWeight: 600 }}>{ev.type}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={{ fontWeight: 600 }}>{statusText}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Power: </span><span style={{ fontWeight: 600 }}>{ev.power}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Usage: </span><span style={{ fontWeight: 600 }}>{ev.usageTime}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Temp: </span><span style={{ fontWeight: 600 }}>{ev.temp}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Connector: </span><span style={{ fontWeight: 600 }}>{ev.connector}</span></div>
                <div><span style={{ color: '#9ca3af' }}>V1: </span><span style={{ fontWeight: 600 }}>{ev.voltage.v1}V</span></div>
                <div><span style={{ color: '#9ca3af' }}>V2: </span><span style={{ fontWeight: 600 }}>{ev.voltage.v2}V</span></div>
                <div><span style={{ color: '#9ca3af' }}>V3: </span><span style={{ fontWeight: 600 }}>{ev.voltage.v3}V</span></div>
                <div><span style={{ color: '#9ca3af' }}>Avg: </span><span style={{ fontWeight: 600 }}>{ev.voltage.average}V</span></div>
              </div>
            </div>
          </DraggablePanel>
        );
      })}

      {/* Individual Chiller Unit Panels */}
      {Object.values(openChillerUnits).map((unit) => {
        const chiller = chillers[unit.index];
        if (!chiller) return null;
        const statusColor = chiller.status === 'fault' ? '#ef4444' : '#10b981';
        const statusText = chiller.status.charAt(0).toUpperCase() + chiller.status.slice(1);
        return (
          <DraggablePanel
            key={unit.id}
            panelId={unit.id}
            title={chiller.name}
            position={unit.position}
            setPosition={(pos) => setOpenChillerUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], position: pos } }))}
            minimized={unit.minimized}
            setMinimized={(min) => setOpenChillerUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], minimized: min } }))}
            onClose={() => closeIndividualUnit(unit.id, 'chiller')}
            width={350}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            zIndex={getPanelZIndex(unit.id)}
            onPanelClick={bringPanelToFront}
          >
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700 }}>{chiller.name}</div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={{ fontWeight: 600 }}>{statusText}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Temp: </span><span style={{ fontWeight: 600 }}>{chiller.temp}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Pressure: </span><span style={{ fontWeight: 600 }}>{chiller.pressure}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Power: </span><span style={{ fontWeight: 600 }}>{chiller.power}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Runtime: </span><span style={{ fontWeight: 600 }}>{chiller.runtime}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Alert: </span><span style={{ fontWeight: 600 }}>{chiller.alert}</span></div>
              </div>
            </div>
          </DraggablePanel>
        );
      })}

      {/* Individual AHU Unit Panels */}
      {Object.values(openAhuUnits).map((unit) => {
        const ahu = ahus[unit.index];
        if (!ahu) return null;
        const statusColor = ahu.status === 'fault' ? '#ef4444' : '#10b981';
        const statusText = ahu.status.charAt(0).toUpperCase() + ahu.status.slice(1);
        return (
          <DraggablePanel
            key={unit.id}
            panelId={unit.id}
            title={ahu.name}
            position={unit.position}
            setPosition={(pos) => setOpenAhuUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], position: pos } }))}
            minimized={unit.minimized}
            setMinimized={(min) => setOpenAhuUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], minimized: min } }))}
            onClose={() => closeIndividualUnit(unit.id, 'ahu')}
            width={350}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            zIndex={getPanelZIndex(unit.id)}
            onPanelClick={bringPanelToFront}
          >
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700 }}>{ahu.name}</div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={{ fontWeight: 600 }}>{statusText}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Temp: </span><span style={{ fontWeight: 600 }}>{ahu.temp}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Pressure: </span><span style={{ fontWeight: 600 }}>{ahu.pressure}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Power: </span><span style={{ fontWeight: 600 }}>{ahu.power}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Runtime: </span><span style={{ fontWeight: 600 }}>{ahu.runtime}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Alert: </span><span style={{ fontWeight: 600 }}>{ahu.alert}</span></div>
              </div>
            </div>
          </DraggablePanel>
        );
      })}

      {/* Individual Electrical Unit Panels */}
      {Object.values(openElectricalUnits).map((unit) => {
        const electrical = electricals[unit.index];
        if (!electrical) return null;
        const statusColor = electrical.status === 'fault' ? '#ef4444' : '#10b981';
        const statusText = electrical.status.charAt(0).toUpperCase() + electrical.status.slice(1);
        return (
          <DraggablePanel
            key={unit.id}
            panelId={unit.id}
            title={electrical.name}
            position={unit.position}
            setPosition={(pos) => setOpenElectricalUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], position: pos } }))}
            minimized={unit.minimized}
            setMinimized={(min) => setOpenElectricalUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], minimized: min } }))}
            onClose={() => closeIndividualUnit(unit.id, 'electrical')}
            width={350}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            zIndex={getPanelZIndex(unit.id)}
            onPanelClick={bringPanelToFront}
          >
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700 }}>{electrical.name}</div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={{ fontWeight: 600 }}>{statusText}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Temp: </span><span style={{ fontWeight: 600 }}>{electrical.temp}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Pressure: </span><span style={{ fontWeight: 600 }}>{electrical.pressure}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Power: </span><span style={{ fontWeight: 600 }}>{electrical.power}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Runtime: </span><span style={{ fontWeight: 600 }}>{electrical.runtime}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Alert: </span><span style={{ fontWeight: 600 }}>{electrical.alert}</span></div>
              </div>
            </div>
          </DraggablePanel>
        );
      })}

      {/* Individual Pump Unit Panels */}
      {Object.values(openPumpUnits).map((unit) => {
        const pump = pumps[unit.index];
        if (!pump) return null;
        const statusColor = pump.status === 'fault' ? '#ef4444' : '#10b981';
        const statusText = pump.status.charAt(0).toUpperCase() + pump.status.slice(1);
        return (
          <DraggablePanel
            key={unit.id}
            panelId={unit.id}
            title={pump.name}
            position={unit.position}
            setPosition={(pos) => setOpenPumpUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], position: pos } }))}
            minimized={unit.minimized}
            setMinimized={(min) => setOpenPumpUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], minimized: min } }))}
            onClose={() => closeIndividualUnit(unit.id, 'pump')}
            width={350}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            zIndex={getPanelZIndex(unit.id)}
            onPanelClick={bringPanelToFront}
          >
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700 }}>{pump.name}</div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={{ fontWeight: 600 }}>{statusText}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Temp: </span><span style={{ fontWeight: 600 }}>{pump.temp}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Pressure: </span><span style={{ fontWeight: 600 }}>{pump.pressure}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Power: </span><span style={{ fontWeight: 600 }}>{pump.power}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Runtime: </span><span style={{ fontWeight: 600 }}>{pump.runtime}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Alert: </span><span style={{ fontWeight: 600 }}>{pump.alert}</span></div>
              </div>
            </div>
          </DraggablePanel>
        );
      })}

      {/* Individual Fire Unit Panels */}
      {Object.values(openFireUnits).map((unit) => {
        const fire = fires[unit.index];
        if (!fire) return null;
        const statusColor = fire.status === 'fault' ? '#ef4444' : '#10b981';
        const statusText = fire.status.charAt(0).toUpperCase() + fire.status.slice(1);
        return (
          <DraggablePanel
            key={unit.id}
            panelId={unit.id}
            title={fire.name}
            position={unit.position}
            setPosition={(pos) => setOpenFireUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], position: pos } }))}
            minimized={unit.minimized}
            setMinimized={(min) => setOpenFireUnits(prev => ({ ...prev, [unit.id]: { ...prev[unit.id], minimized: min } }))}
            onClose={() => closeIndividualUnit(unit.id, 'fire')}
            width={350}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            zIndex={getPanelZIndex(unit.id)}
            onPanelClick={bringPanelToFront}
          >
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', background: '#0b1220' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700 }}>{fire.name}</div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={{ fontWeight: 600 }}>{statusText}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Temp: </span><span style={{ fontWeight: 600 }}>{fire.temp}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Pressure: </span><span style={{ fontWeight: 600 }}>{fire.pressure}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Power: </span><span style={{ fontWeight: 600 }}>{fire.power}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Runtime: </span><span style={{ fontWeight: 600 }}>{fire.runtime}</span></div>
                <div><span style={{ color: '#9ca3af' }}>Alert: </span><span style={{ fontWeight: 600 }}>{fire.alert}</span></div>
              </div>
            </div>
          </DraggablePanel>
        );
      })}
    </>
  );
}
