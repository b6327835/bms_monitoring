import React from 'react';
import * as THREE from 'three';
import { Box, Cylinder, Sphere, Plane, Text } from '@react-three/drei';

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
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </Plane>
          {i < 4 && (
            <Box args={[62, 0.2, 32]} position={[0, i * 8 + 4, 0]} castShadow receiveShadow>
              <meshPhongMaterial color={0xaaaaaa} transparent opacity={opacity} />
            </Box>
          )}
        </group>
      ))}
    </group>
  );
}

function EVCharger({ color = 0x1abc9c, label, indicator = 'normal' }) {
  return (
    <group>
      <Box args={[1.5, 3, 1]} position={[0, 1.5, 0]} castShadow receiveShadow>
        <meshPhongMaterial color={0x333333} />
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

function Chiller({ color = 0x3498db }) {
  return (
    <group>
      <Box args={[4, 2.5, 4]} castShadow receiveShadow>
        <meshPhongMaterial color={0xaaaaaa} />
      </Box>
      {new Array(6).fill(0).map((_, i) => (
        <Box key={i} args={[3.5, 0.15, 0.3]} position={[0, -0.9 + i * 0.4, 2.01]}>
          <meshPhongMaterial color={0x333333} />
        </Box>
      ))}
      <Sphere args={[0.2, 16, 16]} position={[1.6, 1, 2.01]}>
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Sphere>
    </group>
  );
}

function AHU({ color = 0x2ecc71 }) {
  return (
    <group>
      <Box args={[2.5, 2, 2.5]} castShadow receiveShadow>
        <meshPhongMaterial color={0xdddddd} />
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

function ElectricalPanel({ color = 0xf39c12 }) {
  return (
    <group>
      <Box args={[2, 2.5, 1.2]} castShadow receiveShadow>
        <meshPhongMaterial color={0x222222} />
      </Box>
      <Box args={[1.8, 2.2, 0.05]} position={[0, 0, 0.61]}>
        <meshPhongMaterial color={0x444444} />
      </Box>
      <Cylinder args={[0.04, 0.04, 0.25, 8]} position={[0.7, 0, 0.64]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhongMaterial color={0x888888} />
      </Cylinder>
      {[0, 1, 2].map((i) => (
        <Sphere key={i} args={[0.06, 8, 8]} position={[-0.5, 0.8 - i * 0.3, 0.64]}>
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

function WaterPump({}) {
  return (
    <group>
      <Cylinder args={[1, 1, 0.3, 16]}>
        <meshPhongMaterial color={0x666666} />
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

function FireAlarm() {
  return (
    <group>
      <Cylinder args={[0.5, 0.5, 0.3, 16]}>
        <meshPhongMaterial color={0xff0000} emissive={0x330000} />
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
  fireIndicators = []
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

  return (
    <group>
      {/* Lighting approximating the reference */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 50, 50]} intensity={0.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      {/* Building */}
      {showBuilding && <BuildingShell opacity={opacity} />}

      {/* Grid */}
      {showGrid && <gridHelper args={[150, 30, '#444444', '#222222']} position={[0, 0, 0]} />}

      {/* EV stations */}
      {showEV && evPositions.map((p, i) => (
        <group key={`ev-${i}`} position={p.toArray()}>
          <EVCharger color={0x1abc9c} label={`EV-${String(i + 1).padStart(2, '0')}`} indicator={evIndicators[i] || 'normal'} />
        </group>
      ))}

      {/* Chillers */}
      {showChiller && chillerPositions.map((p, i) => (
        <group key={`chiller-${i}`} position={p.toArray()} scale={chillerIndicators[i] === 'fault' ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
          <Chiller />
        </group>
      ))}

      {/* AHUs */}
      {showAHU && ahuPositions.map((p, i) => (
        <group key={`ahu-${i}`} position={p.toArray()} scale={ahuIndicators[i] === 'fault' ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
          <AHU />
        </group>
      ))}

      {/* Electrical panels */}
      {showElectrical && electricalPositions.map((p, i) => (
        <group key={`electrical-${i}`} position={p.toArray()} scale={electricalIndicators[i] === 'fault' ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
          <ElectricalPanel />
        </group>
      ))}

      {/* Water pumps */}
      {showPump && pumpPositions.map((p, i) => (
        <group key={`pump-${i}`} position={p.toArray()} scale={pumpIndicators[i] === 'fault' ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
          <WaterPump />
        </group>
      ))}

      {/* Fire alarms */}
      {showFire && firePositions.map((p, i) => (
        <group key={`fire-${i}`} position={p.toArray()} scale={fireIndicators[i] === 'fault' ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
          <FireAlarm />
        </group>
      ))}
    </group>
  );
}


