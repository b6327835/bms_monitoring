export function getSmartPosition(panelId, width = 200, panelStates) {
  const {
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
  } = panelStates;

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
}

export function showToast(setToast, message, type = 'success') {
  setToast({ visible: true, message, type });
  setTimeout(() => setToast({ visible: false, message: '' }), 5000);
}
