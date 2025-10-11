import React from 'react';
import Draggable from 'react-draggable';

const DraggablePanel = React.memo(({ 
  panelId, 
  title, 
  position, 
  setPosition, 
  minimized, 
  setMinimized, 
  onClose, 
  width = 200, 
  children,
  scrollPositions,
  onDragStart: onDragStartCallback,
  onDragEnd: onDragEndCallback,
  zIndex = 10,
  onPanelClick
}) => {
  const nodeRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const [controlledPosition, setControlledPosition] = React.useState(position);
  
  // Calculate minimized width based on title length
  const minimizedWidth = minimized ? Math.max(162, title.length * 8.1 + 81) : width;
  
  // Update controlled position only when not dragging and position prop changes
  React.useEffect(() => {
    if (!isDraggingRef.current) {
      setControlledPosition(position);
    }
  }, [position.x, position.y]);
  
  // Restore scroll position BEFORE paint (synchronous) - only if scrollPositions provided
  React.useLayoutEffect(() => {
    if (scrollPositions && contentRef.current && !minimized) {
      const savedScroll = scrollPositions.current[panelId] || 0;
      if (contentRef.current.scrollTop !== savedScroll) {
        contentRef.current.scrollTop = savedScroll;
      }
    }
  }); // No deps = runs after every render
  
  // Save scroll position on scroll
  const handleScroll = (e) => {
    if (scrollPositions && scrollPositions.current) {
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
  
  const handleDragStart = () => {
    isDraggingRef.current = true;
    if (onDragStartCallback) {
      onDragStartCallback();
    }
  };
  
  const handleDrag = (e, data) => {
    setControlledPosition({ x: data.x, y: data.y });
  };
  
  const handleDragStop = (e, data) => {
    isDraggingRef.current = false;
    const newPos = { x: data.x, y: data.y };
    setControlledPosition(newPos);
    setPosition(newPos);
    if (onDragEndCallback) {
      onDragEndCallback();
    }
  };
  
  const handlePanelClick = () => {
    if (onPanelClick) {
      onPanelClick(panelId);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={controlledPosition}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      handle=".drag-handle"
    >
      <div 
        ref={nodeRef} 
        onClick={handlePanelClick}
        style={{ 
          position: 'absolute', 
          width: minimizedWidth, 
          background: 'rgba(17,24,39,0.95)', 
          color: '#e5e7eb', 
          borderRadius: 9, 
          boxShadow: '0 11px 27px rgba(0,0,0,0.4)', 
          border: '1px solid #1f2937', 
          zIndex: zIndex, 
          overflow: 'hidden', 
          fontSize: 15, 
          transition: 'width 0.2s ease',
          cursor: 'default'
        }}
      >
        <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 11px', background: '#111827', cursor: 'move', borderBottom: minimized ? 'none' : '1px solid #1f2937', userSelect: 'none' }}>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <button title={minimized ? 'Expand' : 'Minimize'} onClick={handleMinimize} onMouseDown={(e) => e.stopPropagation()} style={{ border: '1px solid #374151', background: '#1f2937', color: '#e5e7eb', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>{minimized ? '▢' : '▁'}</button>
            <button title="Close" onClick={handleClose} onMouseDown={(e) => e.stopPropagation()} style={{ border: '1px solid #7f1d1d', background: '#b91c1c', color: 'white', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
          </div>
        </div>
        {!minimized && (
          <div 
            ref={contentRef}
            onScroll={handleScroll}
            style={{ padding: 9, maxHeight: '50vh', overflow: 'auto', fontSize: 14 }}
          >
            {children}
          </div>
        )}
      </div>
    </Draggable>
  );
});

export default DraggablePanel;
