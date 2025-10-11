import React from 'react';
import DraggablePanel from './DraggablePanel';

export default function EquipmentOverviewPanels({
  // Chiller panel props
  chillerPanelOpen,
  chillerPanelPos,
  setChillerPanelPos,
  chillerPanelMin,
  setChillerPanelMin,
  closeChillerPanel,
  chillers,

  // AHU panel props
  ahuPanelOpen,
  ahuPanelPos,
  setAhuPanelPos,
  ahuPanelMin,
  setAhuPanelMin,
  closeAhuPanel,
  ahus,

  // Electrical panel props
  electricalPanelOpen,
  electricalPanelPos,
  setElectricalPanelPos,
  electricalPanelMin,
  setElectricalPanelMin,
  closeElectricalPanel,
  electricals,

  // Pump panel props
  pumpPanelOpen,
  pumpPanelPos,
  setPumpPanelPos,
  pumpPanelMin,
  setPumpPanelMin,
  closePumpPanel,
  pumps,

  // Fire panel props
  firePanelOpen,
  firePanelPos,
  setFirePanelPos,
  firePanelMin,
  setFirePanelMin,
  closeFirePanel,
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
      {/* Chiller panel (draggable) */}
      {chillerPanelOpen && (
        <DraggablePanel panelId="chillerPanel" title="Chiller System" position={chillerPanelPos} setPosition={setChillerPanelPos} minimized={chillerPanelMin} setMinimized={setChillerPanelMin} onClose={closeChillerPanel} width={480} onDragStart={onDragStart} onDragEnd={onDragEnd} zIndex={getPanelZIndex('chillerPanel')} onPanelClick={bringPanelToFront}>
          <div>
            {chillers.map((chiller) => {
              const statusColor = chiller.status === 'fault' ? '#ef4444' : '#10b981';
              const statusText = chiller.status.charAt(0).toUpperCase() + chiller.status.slice(1);
              return (
                <div key={chiller.id} style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', marginBottom: '8px', background: '#0b1220' }}>
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
              );
            })}
          </div>
        </DraggablePanel>
      )}

      {/* AHU panel (draggable) */}
      {ahuPanelOpen && (
        <DraggablePanel panelId="ahuPanel" title="AHU System" position={ahuPanelPos} setPosition={setAhuPanelPos} minimized={ahuPanelMin} setMinimized={setAhuPanelMin} onClose={closeAhuPanel} width={480} onDragStart={onDragStart} onDragEnd={onDragEnd} zIndex={getPanelZIndex('ahuPanel')} onPanelClick={bringPanelToFront}>
          <div>
            {ahus.map((ahu) => {
              const statusColor = ahu.status === 'fault' ? '#ef4444' : '#10b981';
              const statusText = ahu.status.charAt(0).toUpperCase() + ahu.status.slice(1);
              return (
                <div key={ahu.id} style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', marginBottom: '8px', background: '#0b1220' }}>
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
              );
            })}
          </div>
        </DraggablePanel>
      )}

      {/* Electrical panel (draggable) */}
      {electricalPanelOpen && (
        <DraggablePanel panelId="electricalPanel" title="Electrical Panel" position={electricalPanelPos} setPosition={setElectricalPanelPos} minimized={electricalPanelMin} setMinimized={setElectricalPanelMin} onClose={closeElectricalPanel} width={480} onDragStart={onDragStart} onDragEnd={onDragEnd} zIndex={getPanelZIndex('electricalPanel')} onPanelClick={bringPanelToFront}>
          <div>
            {electricals.map((electrical) => {
              const statusColor = electrical.status === 'fault' ? '#ef4444' : '#10b981';
              const statusText = electrical.status.charAt(0).toUpperCase() + electrical.status.slice(1);
              return (
                <div key={electrical.id} style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', marginBottom: '8px', background: '#0b1220' }}>
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
              );
            })}
          </div>
        </DraggablePanel>
      )}

      {/* Pump panel (draggable) */}
      {pumpPanelOpen && (
        <DraggablePanel panelId="pumpPanel" title="Water Pump System" position={pumpPanelPos} setPosition={setPumpPanelPos} minimized={pumpPanelMin} setMinimized={setPumpPanelMin} onClose={closePumpPanel} width={480} onDragStart={onDragStart} onDragEnd={onDragEnd} zIndex={getPanelZIndex('pumpPanel')} onPanelClick={bringPanelToFront}>
          <div>
            {pumps.map((pump) => {
              const statusColor = pump.status === 'fault' ? '#ef4444' : '#10b981';
              const statusText = pump.status.charAt(0).toUpperCase() + pump.status.slice(1);
              return (
                <div key={pump.id} style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', marginBottom: '8px', background: '#0b1220' }}>
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
              );
            })}
          </div>
        </DraggablePanel>
      )}

      {/* Fire panel (draggable) */}
      {firePanelOpen && (
        <DraggablePanel panelId="firePanel" title="Fire Alarm System" position={firePanelPos} setPosition={setFirePanelPos} minimized={firePanelMin} setMinimized={setFirePanelMin} onClose={closeFirePanel} width={480} onDragStart={onDragStart} onDragEnd={onDragEnd} zIndex={getPanelZIndex('firePanel')} onPanelClick={bringPanelToFront}>
          <div>
            {fires.map((fire) => {
              const statusColor = fire.status === 'fault' ? '#ef4444' : '#10b981';
              const statusText = fire.status.charAt(0).toUpperCase() + fire.status.slice(1);
              return (
                <div key={fire.id} style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '8px', marginBottom: '8px', background: '#0b1220' }}>
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
              );
            })}
          </div>
        </DraggablePanel>
      )}
    </>
  );
}
