import { useState, useCallback } from 'react';

export function usePanelState() {
  // Overview panel states
  const [chillerPanelOpen, setChillerPanelOpen] = useState(false);
  const [chillerPanelMin, setChillerPanelMin] = useState(false);
  const [chillerPanelPos, setChillerPanelPos] = useState({ x: 320, y: 480 });

  const [ahuPanelOpen, setAhuPanelOpen] = useState(false);
  const [ahuPanelMin, setAhuPanelMin] = useState(false);
  const [ahuPanelPos, setAhuPanelPos] = useState({ x: 350, y: 480 });

  const [electricalPanelOpen, setElectricalPanelOpen] = useState(false);
  const [electricalPanelMin, setElectricalPanelMin] = useState(false);
  const [electricalPanelPos, setElectricalPanelPos] = useState({ x: 380, y: 480 });

  const [pumpPanelOpen, setPumpPanelOpen] = useState(false);
  const [pumpPanelMin, setPumpPanelMin] = useState(false);
  const [pumpPanelPos, setPumpPanelPos] = useState({ x: 410, y: 480 });

  const [firePanelOpen, setFirePanelOpen] = useState(false);
  const [firePanelMin, setFirePanelMin] = useState(false);
  const [firePanelPos, setFirePanelPos] = useState({ x: 440, y: 480 });

  // Other panel states
  const [evPanelOpen, setEvPanelOpen] = useState(false);
  const [evPanelMin, setEvPanelMin] = useState(false);
  const [evPanelPos, setEvPanelPos] = useState({ x: window.innerWidth - 540, y: 70 });

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarMin, setSidebarMin] = useState(false);
  const [sidebarPos, setSidebarPos] = useState({ x: 20, y: 70 });

  const [filterVisible, setFilterVisible] = useState(false);
  const [filterMin, setFilterMin] = useState(false);
  const [filterPos, setFilterPos] = useState({ x: 320, y: 145 });

  const [floorsVisible, setFloorsVisible] = useState(false);
  const [floorsMin, setFloorsMin] = useState(false);
  const [floorsPos, setFloorsPos] = useState({ x: 20, y: 250 });

  const [equipmentOverviewVisible, setEquipmentOverviewVisible] = useState(false);
  const [equipmentOverviewMin, setEquipmentOverviewMin] = useState(false);
  const [equipmentOverviewPos, setEquipmentOverviewPos] = useState({ x: 260, y: 250 });

  const [accidentOpen, setAccidentOpen] = useState(false);
  const [accidentMin, setAccidentMin] = useState(false);
  const [accidentPos, setAccidentPos] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 420 });

  // Panel opened before tracking
  const panelOpenedBefore = useState({
    ev: false,
    sidebar: false,
    filter: false,
    accident: false,
    floors: false,
    equipmentOverview: false,
    chillerPanel: false,
    ahuPanel: false,
    electricalPanel: false,
    pumpPanel: false,
    firePanel: false
  })[0];

  // Smart position calculation
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
    if ((floorsVisible || floorsMin) && panelId !== 'floors') {
      openPanels.push({ ...floorsPos, width: 220, height: 60 });
    }
    if ((equipmentOverviewVisible || equipmentOverviewMin) && panelId !== 'equipmentOverview') {
      openPanels.push({ ...equipmentOverviewPos, width: 230, height: 60 });
    }
    if ((chillerPanelOpen || chillerPanelMin) && panelId !== 'chillerPanel') {
      openPanels.push({ ...chillerPanelPos, width: 480, height: 60 });
    }
    if ((ahuPanelOpen || ahuPanelMin) && panelId !== 'ahuPanel') {
      openPanels.push({ ...ahuPanelPos, width: 480, height: 60 });
    }
    if ((electricalPanelOpen || electricalPanelMin) && panelId !== 'electricalPanel') {
      openPanels.push({ ...electricalPanelPos, width: 480, height: 60 });
    }
    if ((pumpPanelOpen || pumpPanelMin) && panelId !== 'pumpPanel') {
      openPanels.push({ ...pumpPanelPos, width: 480, height: 60 });
    }
    if ((firePanelOpen || firePanelMin) && panelId !== 'firePanel') {
      openPanels.push({ ...firePanelPos, width: 480, height: 60 });
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
  }, [
    evPanelOpen, evPanelMin, evPanelPos,
    sidebarVisible, sidebarMin, sidebarPos,
    filterVisible, filterMin, filterPos,
    floorsVisible, floorsMin, floorsPos,
    equipmentOverviewVisible, equipmentOverviewMin, equipmentOverviewPos,
    chillerPanelOpen, chillerPanelMin, chillerPanelPos,
    ahuPanelOpen, ahuPanelMin, ahuPanelPos,
    electricalPanelOpen, electricalPanelMin, electricalPanelPos,
    pumpPanelOpen, pumpPanelMin, pumpPanelPos,
    firePanelOpen, firePanelMin, firePanelPos,
    accidentOpen, accidentMin, accidentPos
  ]);

  // Panel toggle handlers
  const openEVPanel = useCallback(() => {
    if (!evPanelOpen && !panelOpenedBefore.ev) {
      const pos = getSmartPosition('ev', 380);
      setEvPanelPos(pos);
      panelOpenedBefore.ev = true;
    }
    setEvPanelOpen(true);
  }, [evPanelOpen, getSmartPosition]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((v) => {
      if (!v && !panelOpenedBefore.sidebar) {
        const pos = getSmartPosition('sidebar', 220);
        setSidebarPos(pos);
        panelOpenedBefore.sidebar = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleFilter = useCallback(() => {
    setFilterVisible((v) => {
      if (!v && !panelOpenedBefore.filter) {
        const pos = getSmartPosition('filter', 180);
        setFilterPos(pos);
        panelOpenedBefore.filter = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleFloors = useCallback(() => {
    setFloorsVisible((v) => {
      if (!v && !panelOpenedBefore.floors) {
        const pos = getSmartPosition('floors', 220);
        setFloorsPos(pos);
        panelOpenedBefore.floors = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleEquipmentOverview = useCallback(() => {
    setEquipmentOverviewVisible((v) => {
      if (!v && !panelOpenedBefore.equipmentOverview) {
        const pos = getSmartPosition('equipmentOverview', 230);
        setEquipmentOverviewPos(pos);
        panelOpenedBefore.equipmentOverview = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleChillerPanel = useCallback(() => {
    setChillerPanelOpen((v) => {
      if (!v && !panelOpenedBefore.chillerPanel) {
        const pos = getSmartPosition('chillerPanel', 480);
        setChillerPanelPos(pos);
        panelOpenedBefore.chillerPanel = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleAhuPanel = useCallback(() => {
    setAhuPanelOpen((v) => {
      if (!v && !panelOpenedBefore.ahuPanel) {
        const pos = getSmartPosition('ahuPanel', 480);
        setAhuPanelPos(pos);
        panelOpenedBefore.ahuPanel = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleElectricalPanel = useCallback(() => {
    setElectricalPanelOpen((v) => {
      if (!v && !panelOpenedBefore.electricalPanel) {
        const pos = getSmartPosition('electricalPanel', 480);
        setElectricalPanelPos(pos);
        panelOpenedBefore.electricalPanel = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const togglePumpPanel = useCallback(() => {
    setPumpPanelOpen((v) => {
      if (!v && !panelOpenedBefore.pumpPanel) {
        const pos = getSmartPosition('pumpPanel', 480);
        setPumpPanelPos(pos);
        panelOpenedBefore.pumpPanel = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleFirePanel = useCallback(() => {
    setFirePanelOpen((v) => {
      if (!v && !panelOpenedBefore.firePanel) {
        const pos = getSmartPosition('firePanel', 480);
        setFirePanelPos(pos);
        panelOpenedBefore.firePanel = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleEV = useCallback(() => {
    setEvPanelOpen((v) => {
      if (!v && !panelOpenedBefore.ev) {
        const pos = getSmartPosition('ev', 380);
        setEvPanelPos(pos);
        panelOpenedBefore.ev = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  const toggleAccident = useCallback(() => {
    setAccidentOpen((v) => {
      if (!v && !panelOpenedBefore.accident) {
        const pos = getSmartPosition('accident', 200);
        setAccidentPos(pos);
        panelOpenedBefore.accident = true;
      }
      return !v;
    });
  }, [getSmartPosition]);

  // Close handlers
  const closeAccident = useCallback(() => setAccidentOpen(false), []);
  const closeSidebar = useCallback(() => setSidebarVisible(false), []);
  const closeFilter = useCallback(() => setFilterVisible(false), []);
  const closeEV = useCallback(() => setEvPanelOpen(false), []);
  const closeFloors = useCallback(() => setFloorsVisible(false), []);
  const closeEquipmentOverview = useCallback(() => setEquipmentOverviewVisible(false), []);
  const closeChillerPanel = useCallback(() => setChillerPanelOpen(false), []);
  const closeAhuPanel = useCallback(() => setAhuPanelOpen(false), []);
  const closeElectricalPanel = useCallback(() => setElectricalPanelOpen(false), []);
  const closePumpPanel = useCallback(() => setPumpPanelOpen(false), []);
  const closeFirePanel = useCallback(() => setFirePanelOpen(false), []);

  return {
    // Panel states
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

    // Handlers
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
  };
}
