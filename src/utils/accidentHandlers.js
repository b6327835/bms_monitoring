export async function handleRandomAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast, token) {
  // Choose a random equipment type
  const types = ['ev', 'chiller', 'ahu', 'electrical', 'pump', 'fire'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'ev') {
    const i = pickRandomIndex((s) => s.status !== 'fault', evStations);
    if (i < 0) return;
    const station = evStations[i];
    
    const faultData = {
      ...station,
      status: 'fault',
      accidentType: 'fault'
    };
    
    // Send to database
    try {
      await fetch('https://bms-backend-rust.vercel.app/equipment-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipment_type: 'evcharger',
          equipment_id: station.name,
          sensor_data: faultData
        })
      });
      showToast(`${station.name}: Accident occurred`, 'danger');
    } catch (err) {
      console.error('Failed to send accident data:', err);
      showToast('Failed to trigger accident', 'danger');
    }
    return;
  }

  const alertMap = {
    chiller: 'System failure',
    ahu: 'Fan malfunction',
    electrical: 'Overload',
    pump: 'Motor failure',
    fire: 'Sensor error'
  };

  const currentMap = {
    chiller: chillers,
    ahu: ahus,
    electrical: electricals,
    pump: pumps,
    fire: fires
  };

  const typeNameMap = {
    chiller: 'Chiller',
    ahu: 'AHU',
    electrical: 'Electrical',
    pump: 'Pump',
    fire: 'Fire'
  };

  const arr = currentMap[type];
  const normals = arr
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v.status === 'normal')
    .map(({ i }) => i);
  if (normals.length === 0) return;
  const idx = normals[Math.floor(Math.random() * normals.length)];
  const equipment = arr[idx];
  
  const faultData = {
    ...equipment,
    status: 'fault',
    alert: alertMap[type]
  };
  
  // Send to database
  try {
    await fetch('https://bms-backend-rust.vercel.app/equipment-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        equipment_type: type,
        equipment_id: `${typeNameMap[type]}-${String(idx + 1).padStart(2, '0')}`,
        sensor_data: faultData
      })
    });
    showToast(`${type.toUpperCase()} ${idx + 1}: Accident occurred`, 'danger');
  } catch (err) {
    console.error('Failed to send accident data:', err);
    showToast('Failed to trigger accident', 'danger');
  }
}

export async function handleRandomEVFuseDrop(evStations, setEvStations, showToast, token) {
  const i = pickRandomIndex(() => true, evStations);
  if (i < 0) return;
  const station = evStations[i];
  const v2 = station.voltage.v2;
  const v3 = station.voltage.v3;
  const nextAvg = Math.round((v2 + v3) / 2);
  
  const fuseDropData = {
    ...station,
    status: 'fault',
    accidentType: 'fuseDrop',
    voltage: { ...station.voltage, v1: 0, average: nextAvg }
  };
  
  // Send to database
  try {
    await fetch('https://bms-backend-rust.vercel.app/equipment-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        equipment_type: 'evcharger',
        equipment_id: station.name,
        sensor_data: fuseDropData
      })
    });
    showToast(`${station.name}: Fuse Dropped (V1 = 0V)`, 'warning');
  } catch (err) {
    console.error('Failed to send fuse drop data:', err);
    showToast('Failed to trigger fuse drop', 'danger');
  }
}

export async function handleFixAllAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast, token) {
  try {
    const requests = [];
    
    // Fix EV Stations
    evStations.forEach((s) => {
      const fixedV1 = s.voltage.v1 === 0 ? 230 : s.voltage.v1;
      const avg = Math.round((fixedV1 + s.voltage.v2 + s.voltage.v3) / 3);
      const fixedData = {
        ...s,
        status: s.status === 'fault' ? 'available' : s.status,
        accidentType: undefined,
        voltage: { ...s.voltage, v1: fixedV1, average: avg }
      };
      
      requests.push(
        fetch('https://bms-backend-rust.vercel.app/equipment-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equipment_type: 'evcharger',
            equipment_id: s.name,
            sensor_data: fixedData
          })
        })
      );
    });
    
    // Fix Chillers
    chillers.forEach((c, idx) => {
      const fixedData = { ...c, status: 'normal', alert: 'None' };
      requests.push(
        fetch('https://bms-backend-rust.vercel.app/equipment-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equipment_type: 'chiller',
            equipment_id: `Chiller-${String(idx + 1).padStart(2, '0')}`,
            sensor_data: fixedData
          })
        })
      );
    });
    
    // Fix AHUs
    ahus.forEach((a, idx) => {
      const fixedData = { ...a, status: 'normal', alert: 'None' };
      requests.push(
        fetch('https://bms-backend-rust.vercel.app/equipment-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equipment_type: 'ahu',
            equipment_id: `AHU-${String(idx + 1).padStart(2, '0')}`,
            sensor_data: fixedData
          })
        })
      );
    });
    
    // Fix Electricals
    electricals.forEach((e, idx) => {
      const fixedData = { ...e, status: 'normal', alert: 'None' };
      requests.push(
        fetch('https://bms-backend-rust.vercel.app/equipment-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equipment_type: 'electrical',
            equipment_id: `Electrical-${String(idx + 1).padStart(2, '0')}`,
            sensor_data: fixedData
          })
        })
      );
    });
    
    // Fix Pumps
    pumps.forEach((p, idx) => {
      const fixedData = { ...p, status: 'normal', alert: 'None' };
      requests.push(
        fetch('https://bms-backend-rust.vercel.app/equipment-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equipment_type: 'pump',
            equipment_id: `Pump-${String(idx + 1).padStart(2, '0')}`,
            sensor_data: fixedData
          })
        })
      );
    });
    
    // Fix Fire Alarms
    fires.forEach((f, idx) => {
      const fixedData = { ...f, status: 'normal', alert: 'None' };
      requests.push(
        fetch('https://bms-backend-rust.vercel.app/equipment-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equipment_type: 'fire',
            equipment_id: `Fire-${String(idx + 1).padStart(2, '0')}`,
            sensor_data: fixedData
          })
        })
      );
    });
    
    await Promise.all(requests);
    showToast('All accidents fixed', 'success');
  } catch (err) {
    console.error('Failed to fix accidents:', err);
    showToast('Failed to fix accidents', 'danger');
  }
}

function pickRandomIndex(filterFn, array) {
  const idxs = array
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (filterFn ? filterFn(s) : true))
    .map(({ i }) => i);
  if (idxs.length === 0) return -1;
  return idxs[Math.floor(Math.random() * idxs.length)];
}
