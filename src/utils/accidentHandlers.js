export function handleRandomAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast) {
  // Choose a random equipment type
  const types = ['ev', 'chiller', 'ahu', 'electrical', 'pump', 'fire'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'ev') {
    setEvStations((prev) => {
      const i = pickRandomIndex((s) => s.status !== 'fault', prev);
      if (i < 0) return prev;
      const next = prev.slice();
      next[i] = { ...next[i], status: 'fault', accidentType: 'fault' };
      showToast(`${next[i].name}: Accident occurred`, 'danger');
      return next;
    });
    return;
  }

  const updateMap = {
    chiller: (prev, idx) => prev.map((c, i) => i === idx ? { ...c, status: 'fault', alert: 'System failure' } : c),
    ahu: (prev, idx) => prev.map((a, i) => i === idx ? { ...a, status: 'fault', alert: 'Fan malfunction' } : a),
    electrical: (prev, idx) => prev.map((e, i) => i === idx ? { ...e, status: 'fault', alert: 'Overload' } : e),
    pump: (prev, idx) => prev.map((p, i) => i === idx ? { ...p, status: 'fault', alert: 'Motor failure' } : p),
    fire: (prev, idx) => prev.map((f, i) => i === idx ? { ...f, status: 'fault', alert: 'Sensor error' } : f)
  };

  const setMap = {
    chiller: setChillers,
    ahu: setAhus,
    electrical: setElectricals,
    pump: setPumps,
    fire: setFires
  };

  const currentMap = {
    chiller: chillers,
    ahu: ahus,
    electrical: electricals,
    pump: pumps,
    fire: fires
  };

  const arr = currentMap[type];
  const normals = arr
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v.status === 'normal')
    .map(({ i }) => i);
  if (normals.length === 0) return;
  const idx = normals[Math.floor(Math.random() * normals.length)];
  setMap[type]((prev) => updateMap[type](prev, idx));
  showToast(`${type.toUpperCase()} ${idx + 1}: Accident occurred`, 'danger');
}

export function handleRandomEVFuseDrop(evStations, setEvStations, showToast) {
  setEvStations((prev) => {
    const i = pickRandomIndex(() => true, prev);
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

export function handleFixAllAccident(evStations, setEvStations, chillers, setChillers, ahus, setAhus, electricals, setElectricals, pumps, setPumps, fires, setFires, showToast) {
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
  setChillers((prev) => prev.map(c => ({ ...c, status: 'normal', alert: 'None' })));
  setAhus((prev) => prev.map(a => ({ ...a, status: 'normal', alert: 'None' })));
  setElectricals((prev) => prev.map(e => ({ ...e, status: 'normal', alert: 'None' })));
  setPumps((prev) => prev.map(p => ({ ...p, status: 'normal', alert: 'None' })));
  setFires((prev) => prev.map(f => ({ ...f, status: 'normal', alert: 'None' })));
  showToast('All accidents fixed', 'success');
}

function pickRandomIndex(filterFn, array) {
  const idxs = array
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (filterFn ? filterFn(s) : true))
    .map(({ i }) => i);
  if (idxs.length === 0) return -1;
  return idxs[Math.floor(Math.random() * idxs.length)];
}
