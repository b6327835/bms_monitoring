import React from 'react';
import * as THREE from 'three';
import { Box, Cylinder, Sphere, Plane, Text, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function AnimatedGroup({ children, isFault }) {
  const groupRef = React.useRef();

  useFrame((state) => {
    if (isFault && groupRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
      groupRef.current.scale.setScalar(scale);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function BuildingShell({ opacity = 0.3 }) {
  const floors = React.useMemo(() => new Array(5).fill(0), []);
  return (
    <group>
      {/* Main building volume */}
      <Box args={[60, 40, 30]} position={[0, 20, 0]} castShadow receiveShadow>
        <meshPhongMaterial color={0xcccccc} transparent opacity={opacity} />
      </Box>

      {/* Floors and separators */}
      {floors.map((_, i) => (
        <group key={`floor-${i}`}>
          <Plane
            args={[62, 32]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, i * 8, 0]}
            receiveShadow
          >
            <meshPhongMaterial
              color={i % 2 === 0 ? 0xf0f0f0 : 0xe0e0e0}
              emissive={i % 2 === 0 ? 0x101010 : 0x080808}
              emissiveIntensity={0.1}
              transparent
              opacity={opacity}
              shininess={30}
              specular={0x222222}
              side={THREE.FrontSide}
              depthWrite={true}
              polygonOffset={true}
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
            />
          </Plane>
          {i < 4 && (
            <Box args={[62, 0.2, 32]} position={[0, i * 8 + 4, 0]} castShadow receiveShadow>
              <meshPhongMaterial 
                color={0x888888} 
                emissive={0x080808}
                emissiveIntensity={0.05}
                transparent 
                opacity={opacity}
                shininess={20}
                specular={0x111111}
              />
            </Box>
          )}
        </group>
      ))}
    </group>
  );
}

function EVCharger({ color = 0x1abc9c, label, indicator = 'normal', onDoubleClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }} onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}>
      <Box args={[1.5, 3, 1]} position={[0, 1.5, 0]} castShadow receiveShadow>
        <meshPhongMaterial color={0x333333} />
        {hovered && <Edges color="white" />}
      </Box>
      <Box args={[1.2, 0.8, 0.1]} position={[0, 2.2, 0.51]}>
        <meshPhongMaterial color={0x000000} emissive={0x111111} />
      </Box>
      <Sphere args={[0.1, 16, 16]} position={[0.5, 1.7, 0.51]}>
        <meshPhongMaterial color={indicator === 'fault' ? 0xff0000 : indicator === 'fuseDrop' ? 0xffff00 : color} emissive={indicator === 'fault' ? 0xff0000 : indicator === 'fuseDrop' ? 0xffff00 : color} emissiveIntensity={0.7} />
      </Sphere>
      <Cylinder args={[0.12, 0.12, 0.4, 16]} position={[-0.5, 0.6, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhongMaterial color={0x666666} />
      </Cylinder>
      {/* Label */}
      {label && (
        <Text position={[0, 1, 0.51]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">
          {label}
        </Text>
      )}
    </group>
  );
}

function Chiller({ onDoubleClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }} onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}>
      <Box args={[4, 2.5, 4]} castShadow receiveShadow>
        <meshPhongMaterial color={0xaaaaaa} />
        {hovered && <Edges color="white" />}
      </Box>
      {new Array(6).fill(0).map((_, i) => (
        <Box key={i} args={[3.5, 0.15, 0.3]} position={[0, -0.9 + i * 0.4, 2.01]}>
          <meshPhongMaterial color={0x333333} />
        </Box>
      ))}
      <Sphere args={[0.2, 16, 16]} position={[1.6, 1, 2.01]}>
        <meshPhongMaterial color={0x3498db} emissive={0x3498db} emissiveIntensity={0.3} />
      </Sphere>
    </group>
  );
}

function AHU({ onDoubleClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }} onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}>
      <Box args={[2.5, 2, 2.5]} castShadow receiveShadow>
        <meshPhongMaterial color={0xdddddd} />
        {hovered && <Edges color="white" />}
      </Box>
      <Cylinder args={[0.4, 0.4, 1, 16]} position={[0.9, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhongMaterial color={0x888888} />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 1, 16]} position={[-0.9, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhongMaterial color={0x888888} />
      </Cylinder>
      <Box args={[1, 0.5, 0.05]} position={[0, 0.6, 1.26]}>
        <meshPhongMaterial color={0x333333} />
      </Box>
    </group>
  );
}

function ElectricalPanel({ onDoubleClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }} onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}>
      <Box args={[2, 2.5, 1.2]} castShadow receiveShadow>
        <meshPhongMaterial color={0x222222} />
        {hovered && <Edges color="white" />}
      </Box>
      <Box args={[1.8, 2.2, 0.05]} position={[0, 0, 0.61]}>
        <meshPhongMaterial color={0x444444} />
      </Box>
      <Cylinder args={[0.04, 0.04, 0.25, 8]} position={[0.7, 0, 0.64]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhongMaterial color={0x888888} />
      </Cylinder>
      {[0, 1, 2].map((i) => (
        <Sphere key={i} args={[0.06, 8, 8]} position={[-0.5, 0.8 - i * 0.3, 0.64]}>
          <meshPhongMaterial color={0xf39c12} emissive={0xf39c12} emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

function WaterPump({ onDoubleClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }} onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}>
      <Cylinder args={[1, 1, 0.3, 16]}>
        <meshPhongMaterial color={0x666666} />
        {hovered && <Edges color="white" />}
      </Cylinder>
      <Cylinder args={[0.8, 0.8, 1.2, 16]} position={[0, 0.9, 0]}>
        <meshPhongMaterial color={0xaaaaaa} />
      </Cylinder>
      <Cylinder args={[0.5, 0.5, 1, 16]} position={[0, 2, 0]}>
        <meshPhongMaterial color={0x333333} />
      </Cylinder>
      <Cylinder args={[0.12, 0.12, 1.2, 8]} position={[0.9, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhongMaterial color={0x888888} />
      </Cylinder>
      <Cylinder args={[0.12, 0.12, 1.2, 8]} position={[-0.9, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhongMaterial color={0x888888} />
      </Cylinder>
    </group>
  );
}

function FireAlarm({ onDoubleClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }} onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}>
      <Cylinder args={[0.5, 0.5, 0.3, 16]}>
        <meshPhongMaterial color={0xff0000} emissive={0x330000} />
        {hovered && <Edges color="white" />}
      </Cylinder>
      <Sphere args={[0.2, 16, 16]} position={[0, 0.25, 0]}>
        <meshPhongMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.3} />
      </Sphere>
      <Box args={[0.8, 0.15, 0.8]} position={[0, -0.3, 0]}>
        <meshPhongMaterial color={0x333333} />
      </Box>
    </group>
  );
}

export default function BuildingModel({
  opacity = 0.3,
  showBuilding = true,
  showGrid = true,
  showEV = true,
  showChiller = true,
  showAHU = true,
  showElectrical = true,
  showPump = true,
  showFire = true,
  evIndicators = [],
  chillerIndicators = [],
  ahuIndicators = [],
  electricalIndicators = [],
  pumpIndicators = [],
  fireIndicators = [],
  onOpenEVPanel,
  onOpenChillerPanel,
  onOpenAhuPanel,
  onOpenElectricalPanel,
  onOpenPumpPanel,
  onOpenFirePanel
}) {
  // Equipment positions replicating the reference
  const evPositions = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < 30; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      positions.push(new THREE.Vector3(-20 + col * 6, 1, -10 + row * 4));
    }
    return positions;
  }, []);

  const chillerPositions = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < 3; i++) positions.push(new THREE.Vector3(-20 + i * 20, 32, 0));
    return positions;
  }, []);

  const ahuPositions = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < 12; i++) {
      const floor = Math.floor(i / 3) + 1;
      positions.push(new THREE.Vector3(-15 + (i % 3) * 15, floor * 8, 12));
    }
    return positions;
  }, []);

  const electricalPositions = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      const floor = Math.floor(i / 2) + 1;
      positions.push(new THREE.Vector3(25, floor * 8, -8 + (i % 2) * 16));
    }
    return positions;
  }, []);

  const pumpPositions = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < 6; i++) positions.push(new THREE.Vector3(8 + (i % 3) * 8, 8, 8 + Math.floor(i / 3) * 6));
    return positions;
  }, []);

  const firePositions = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < 15; i++) {
      const floor = Math.floor(i / 3);
      positions.push(new THREE.Vector3(-12 + (i % 3) * 12, floor * 8, -10));
    }
    return positions;
  }, []);

  const floors = React.useMemo(() => new Array(5).fill(0), []);

  return (
    <group>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight
        position={[50, 50, 50]}
        intensity={0.6}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <directionalLight
        position={[-30, 40, 30]}
        intensity={0.3}
        color="#e8f4fd"
      />
      <directionalLight
        position={[30, 40, -30]}
        intensity={0.2}
        color="#fdf6e8"
      />

      {/* Point lights for ambient illumination */}
      <pointLight position={[-25, 35, 15]} intensity={0.4} color="#ffffff" distance={50} />
      <pointLight position={[25, 35, 15]} intensity={0.4} color="#ffffff" distance={50} />
      <pointLight position={[0, 35, -15]} intensity={0.3} color="#f0f8ff" distance={40} />

      {/* Accent lights for equipment areas */}
      <pointLight position={[-20, 32, 0]} intensity={0.2} color="#87ceeb" distance={20} />
      <pointLight position={[25, 32, 0]} intensity={0.2} color="#ffa500" distance={20} />
      <pointLight position={[0, 8, 8]} intensity={0.2} color="#98fb98" distance={25} />

      {/* Spot lights for focused illumination */}
      <spotLight
        position={[-15, 35, 10]}
        target-position={[-15, 0, 10]}
        intensity={0.5}
        color="#ffffff"
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={40}
        castShadow
      />
      <spotLight
        position={[15, 35, 10]}
        target-position={[15, 0, 10]}
        intensity={0.4}
        color="#ffffff"
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={40}
        castShadow
      />

      {/* Floor-level lighting for better floor illumination */}
      {floors.map((_, i) => (
        <group key={`floor-light-${i}`}>
          {/* Ceiling lights above each floor */}
          <pointLight
            position={[-20, i * 8 + 7.5, 10]}
            intensity={0.15}
            color="#f5f5f5"
            distance={25}
          />
          <pointLight
            position={[20, i * 8 + 7.5, 10]}
            intensity={0.15}
            color="#f5f5f5"
            distance={25}
          />
          <pointLight
            position={[0, i * 8 + 7.5, -10]}
            intensity={0.12}
            color="#f0f8ff"
            distance={30}
          />

          {/* Floor glow lights (subtle illumination from below) */}
          <pointLight
            position={[-15, i * 8 + 0.1, 8]}
            intensity={0.08}
            color="#e6f3ff"
            distance={20}
          />
          <pointLight
            position={[15, i * 8 + 0.1, 8]}
            intensity={0.08}
            color="#fff8e6"
            distance={20}
          />
        </group>
      ))}

      {/* Recessed ceiling lighting effects */}
      {floors.map((_, i) => (
        <group key={`ceiling-lights-${i}`}>
          {/* Recessed light fixtures (visible emissive rectangles) */}
          <Box args={[2, 0.1, 2]} position={[-25, i * 8 + 7.9, 12]} castShadow>
            <meshPhongMaterial 
              color={0x333333} 
              emissive={0xffffff}
              emissiveIntensity={0.3}
            />
          </Box>
          <Box args={[2, 0.1, 2]} position={[25, i * 8 + 7.9, 12]} castShadow>
            <meshPhongMaterial 
              color={0x333333} 
              emissive={0xffffff}
              emissiveIntensity={0.3}
            />
          </Box>
          <Box args={[2, 0.1, 2]} position={[-25, i * 8 + 7.9, -8]} castShadow>
            <meshPhongMaterial 
              color={0x333333} 
              emissive={0xf0f8ff}
              emissiveIntensity={0.25}
            />
          </Box>
          <Box args={[2, 0.1, 2]} position={[25, i * 8 + 7.9, -8]} castShadow>
            <meshPhongMaterial 
              color={0x333333} 
              emissive={0xfff8dc}
              emissiveIntensity={0.25}
            />
          </Box>
        </group>
      ))}

      {/* Building */}
      {showBuilding && <BuildingShell opacity={opacity} />}

      {/* Grid with enhanced ground plane */}
      {showGrid && (
        <>
          {/* Enhanced ground plane for better light reception */}
          <Plane args={[150, 150]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <meshPhongMaterial 
              color={0x1a1a1a}
              emissive={0x050505}
              emissiveIntensity={0.15}
              shininess={10}
              specular={0x0a0a0a}
              side={THREE.FrontSide}
            />
          </Plane>
          <gridHelper args={[150, 30, '#666666', '#333333']} position={[0, 0, 0]} />
        </>
      )}

      {/* EV stations */}
      {showEV && evPositions.map((p, i) => (
        <group key={`ev-${i}`} position={p.toArray()}>
          <AnimatedGroup isFault={evIndicators[i] === 'fault' || evIndicators[i] === 'fuseDrop'}>
            <EVCharger color={0x1abc9c} label={`EV-${String(i + 1).padStart(2, '0')}`} indicator={evIndicators[i] || 'normal'} onDoubleClick={() => onOpenEVPanel(i)} />
          </AnimatedGroup>
        </group>
      ))}

      {/* Chillers */}
      {showChiller && chillerPositions.map((p, i) => (
        <group key={`chiller-${i}`} position={p.toArray()}>
          <AnimatedGroup isFault={chillerIndicators[i] === 'fault'}>
            <Chiller onDoubleClick={() => onOpenChillerPanel(i)} />
          </AnimatedGroup>
        </group>
      ))}

      {/* AHUs */}
      {showAHU && ahuPositions.map((p, i) => (
        <group key={`ahu-${i}`} position={p.toArray()}>
          <AnimatedGroup isFault={ahuIndicators[i] === 'fault'}>
            <AHU onDoubleClick={() => onOpenAhuPanel(i)} />
          </AnimatedGroup>
        </group>
      ))}

      {/* Electrical panels */}
      {showElectrical && electricalPositions.map((p, i) => (
        <group key={`electrical-${i}`} position={p.toArray()}>
          <AnimatedGroup isFault={electricalIndicators[i] === 'fault'}>
            <ElectricalPanel onDoubleClick={() => onOpenElectricalPanel(i)} />
          </AnimatedGroup>
        </group>
      ))}

      {/* Water pumps */}
      {showPump && pumpPositions.map((p, i) => (
        <group key={`pump-${i}`} position={p.toArray()}>
          <AnimatedGroup isFault={pumpIndicators[i] === 'fault'}>
            <WaterPump onDoubleClick={() => onOpenPumpPanel(i)} />
          </AnimatedGroup>
        </group>
      ))}

      {/* Fire alarms */}
      {showFire && firePositions.map((p, i) => (
        <group key={`fire-${i}`} position={p.toArray()}>
          <AnimatedGroup isFault={fireIndicators[i] === 'fault'}>
            <FireAlarm onDoubleClick={() => onOpenFirePanel(i)} />
          </AnimatedGroup>
        </group>
      ))}

      {/* Ground-level perimeter lighting */}
      <pointLight position={[-60, 2, 0]} intensity={0.2} color="#4a90e2" distance={80} />
      <pointLight position={[60, 2, 0]} intensity={0.2} color="#e27d4a" distance={80} />
      <pointLight position={[0, 2, -60]} intensity={0.15} color="#e8f4fd" distance={80} />
      <pointLight position={[0, 2, 60]} intensity={0.15} color="#fdf6e8" distance={80} />

      {/* Ground corner accent lights */}
      <pointLight position={[-50, 1, -50]} intensity={0.12} color="#ffffff" distance={60} />
      <pointLight position={[50, 1, -50]} intensity={0.12} color="#ffffff" distance={60} />
      <pointLight position={[-50, 1, 50]} intensity={0.12} color="#ffffff" distance={60} />
      <pointLight position={[50, 1, 50]} intensity={0.12} color="#ffffff" distance={60} />
    </group>
  );
}


