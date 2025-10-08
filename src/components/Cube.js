import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Plane, Grid } from '@react-three/drei';

function SmallCube({ position, color = "#1a1a1a", size = 0.5 }) {
  return (
    <Box args={[size, size, size]} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

function Floor({ position = [0, 0, 0], opacity = 1, floorNumber = 1 }) {
  const meshRef = React.useRef();
  
  return (
    <group position={position}>
      {/* Floor label */}
      <Text
        position={[-1.5, 0, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.3}
        color="#ffffff"
      >
        {`Floor ${floorNumber}`}
      </Text>

      {/* Main white/gray cube */}
      <Box ref={meshRef} args={[2, 2, 2]} castShadow receiveShadow>
        <meshStandardMaterial color="#e0e0e0" transparent opacity={opacity} />
      </Box>
      
      {/* Original four smaller cubes */}
      <SmallCube position={[-0.5, 0.5, 0.5]} />
      <SmallCube position={[0.5, 0.5, 0.5]} />
      <SmallCube position={[-0.5, -0.5, 0.5]} />
      <SmallCube position={[0.5, -0.5, 0.5]} />

      {/* Four new cubes with different sizes and colors */}
      <SmallCube 
        position={[0, 0.7, -0.5]} 
        color={floorNumber === 1 ? "#FF6B6B" : "#9B59B6"} 
        size={0.4} 
      />
      <SmallCube 
        position={[-0.6, 0, -0.5]} 
        color={floorNumber === 1 ? "#4ECDC4" : "#3498DB"} 
        size={0.3} 
      />
      <SmallCube 
        position={[0.6, -0.2, -0.5]} 
        color={floorNumber === 1 ? "#FFE66D" : "#2ECC71"} 
        size={0.6} 
      />
      <SmallCube 
        position={[0, -0.7, -0.5]} 
        color={floorNumber === 1 ? "#96CEB4" : "#E74C3C"} 
        size={0.35} 
      />
    </group>
  );
}

function Ground() {
  return (
    <group position={[0, -2, 0]}>
      {/* Base plane with transparency */}
      <Plane 
        args={[15, 15]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <meshStandardMaterial 
          color="#151518"
          transparent
          opacity={0.95}
          roughness={0.8}
          metalness={0.2}
        />
      </Plane>

      {/* Grid overlay */}
      <gridHelper 
        args={[15, 15, "#1a1a7a", "#1a1a7a"]} 
        position={[0, 0.01, 0]}
      />

      {/* Center lines (gray) */}
      <group position={[0, 0.02, 0]}>
        {/* Horizontal center line */}
        <Plane 
          args={[15, 0.05]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#505050" transparent opacity={0.8} />
        </Plane>
        {/* Vertical center line */}
        <Plane 
          args={[0.05, 15]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#505050" transparent opacity={0.8} />
        </Plane>
      </group>
    </group>
  );
}

function Cube({ opacity = 1 }) {
  return (
    <group>
      <Floor position={[0, -1, 0]} opacity={opacity} floorNumber={1} />
      <Floor position={[0, 1, 0]} opacity={opacity} floorNumber={2} />
      <Ground />
    </group>
  );
}

export default Cube;