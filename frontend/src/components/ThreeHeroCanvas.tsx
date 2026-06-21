'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ThreeButterfly } from './ThreeButterfly';
import { ThreeCity } from './ThreeCity';

interface Keyframe {
  progress: number;
  butterflyPos: [number, number, number];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

const KEYFRAMES: Keyframe[] = [
  {
    progress: 0.0,
    butterflyPos: [2.2, 1.6, 2.0], // floats right initially
    cameraPos: [0.0, 2.5, 8.0],
    cameraTarget: [0.0, 0.8, 0.0]
  },
  {
    progress: 0.15, // AI Scanner section
    butterflyPos: [-2.0, 1.8, 1.2],
    cameraPos: [-2.5, 2.0, 6.0],
    cameraTarget: [-4.0, 0.8, -1.0]
  },
  {
    progress: 0.35, // Living map section (Cafe)
    butterflyPos: [-4.0, 0.65, 0.25],
    cameraPos: [-2.2, 1.0, 3.0],
    cameraTarget: [-4.0, 0.3, 0.6]
  },
  {
    progress: 0.55, // Route planner section (Park)
    butterflyPos: [0.0, 0.5, -2.5],
    cameraPos: [-1.4, 1.4, 0.2],
    cameraTarget: [0.0, 0.35, -3.2]
  },
  {
    progress: 0.75, // Community Powered (Hospital)
    butterflyPos: [4.0, 1.25, -0.8],
    cameraPos: [2.2, 1.5, 2.5],
    cameraTarget: [4.0, 1.0, -0.6]
  },
  {
    progress: 0.90, // Digital twin rising swarm
    butterflyPos: [0.0, 8.0, 1.0],
    cameraPos: [0.0, 10.0, 0.1],
    cameraTarget: [0.0, 0.0, -1.5]
  },
  {
    progress: 1.0, // Dashboard transition
    butterflyPos: [-3.8, 3.8, -1.0],
    cameraPos: [0.0, 8.0, 5.0],
    cameraTarget: [0.0, 0.0, -1.2]
  }
];

const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// Custom controller handling camera paths, mouse parallax, and scroll timelines
interface CameraControllerProps {
  scrollProgress: number;
  butterflyRef: React.RefObject<THREE.Group | null>;
  mouseCoords: { x: number; y: number };
}

const CameraController: React.FC<CameraControllerProps> = ({ scrollProgress, butterflyRef, mouseCoords }) => {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 0.8, 0));
  const currentCamPos = useRef(new THREE.Vector3(0, 2.5, 8.0));

  useFrame((state) => {
    // 1. Find bounding keyframes
    let prevIndex = 0;
    for (let i = 0; i < KEYFRAMES.length; i++) {
      if (KEYFRAMES[i].progress <= scrollProgress) {
        prevIndex = i;
      }
    }
    const nextIndex = Math.min(prevIndex + 1, KEYFRAMES.length - 1);
    const prev = KEYFRAMES[prevIndex];
    const next = KEYFRAMES[nextIndex];

    let t = 0;
    if (prev.progress !== next.progress) {
      t = (scrollProgress - prev.progress) / (next.progress - prev.progress);
    }
    const smoothT = t * t * (3 - 2 * t);

    // 2. Interpolate Butterfly Position (Scroll-bound)
    if (butterflyRef.current) {
      const bX = lerp(prev.butterflyPos[0], next.butterflyPos[0], smoothT);
      const bY = lerp(prev.butterflyPos[1], next.butterflyPos[1], smoothT);
      const bZ = lerp(prev.butterflyPos[2], next.butterflyPos[2], smoothT);

      // Gentle floating loops
      const time = state.clock.getElapsedTime();
      const hoverY = Math.sin(time * 2.5) * 0.08;
      const hoverX = Math.cos(time * 1.5) * 0.04;
      
      butterflyRef.current.position.set(bX + hoverX, bY + hoverY, bZ);

      // Rotate butterfly to face travel direction
      if (prevIndex !== nextIndex) {
        const dirX = next.butterflyPos[0] - prev.butterflyPos[0];
        const dirZ = next.butterflyPos[2] - prev.butterflyPos[2];
        const angle = Math.atan2(dirX, dirZ);
        butterflyRef.current.rotation.y = angle + Math.PI;
      }
    }

    // 3. Interpolate Camera position & targets
    const targetCamX = lerp(prev.cameraPos[0], next.cameraPos[0], smoothT);
    const targetCamY = lerp(prev.cameraPos[1], next.cameraPos[1], smoothT);
    const targetCamZ = lerp(prev.cameraPos[2], next.cameraPos[2], smoothT);

    const targetTarX = lerp(prev.cameraTarget[0], next.cameraTarget[0], smoothT);
    const targetTarY = lerp(prev.cameraTarget[1], next.cameraTarget[1], smoothT);
    const targetTarZ = lerp(prev.cameraTarget[2], next.cameraTarget[2], smoothT);

    // 4. Subtle mouse camera parallax shift (Adds massive depth)
    const px = mouseCoords.x * 0.4;
    const py = mouseCoords.y * 0.3;

    currentCamPos.current.set(targetCamX + px, targetCamY + py, targetCamZ);
    currentTarget.current.set(targetTarX + px * 0.5, targetTarY + py * 0.5, targetTarZ);

    camera.position.lerp(currentCamPos.current, 0.1);
    camera.lookAt(currentTarget.current);
  });

  return null;
};

// Swarm of butterflies rising up in final scene
const ButterflySwarm: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const swarmRef = useRef<THREE.InstancedMesh>(null);
  const count = 100;

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 16,
        z: (Math.random() - 0.5) * 12 - 2,
        yStart: -1.0 - Math.random() * 2.0,
        speed: Math.random() * 3.5 + 2.5,
        rotSpeed: Math.random() * 5.0 + 5.0,
        size: Math.random() * 0.08 + 0.04,
        phase: Math.random() * Math.PI
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!swarmRef.current) return;

    const riseFactor = clamp((scrollProgress - 0.82) / 0.18, 0, 1);
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const currentY = p.yStart + riseFactor * p.speed * 6.0;
      const scaleX = p.size * (0.3 + Math.abs(Math.sin(time * p.rotSpeed + p.phase)) * 0.7);
      
      dummy.position.set(p.x + Math.sin(time + p.phase) * 0.2, currentY, p.z);
      dummy.rotation.set(0.2, time * 0.5 + p.phase, 0);
      dummy.scale.set(scaleX, p.size, p.size);
      dummy.updateMatrix();
      
      swarmRef.current.setMatrixAt(i, dummy.matrix);
    }
    swarmRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={swarmRef} args={[undefined, undefined, count] as unknown as [THREE.BufferGeometry, THREE.Material, number]}>
      <boxGeometry args={[1, 0.4, 0.8]} />
      <meshBasicMaterial
        color="#B388FF"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};

// Section 1: AI Scanner - Glowing Sweep Plane
const ScanningBeam: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const beamRef = useRef<THREE.Mesh>(null);
  
  // Active in scanner progress range (0.12 - 0.35)
  const isVisible = scrollProgress >= 0.12 && scrollProgress <= 0.35;

  useFrame((state) => {
    if (!beamRef.current) return;
    const time = state.clock.getElapsedTime();
    // Sweep plane back and forth over the cafe cottage sector
    beamRef.current.position.y = 1.2 + Math.sin(time * 3.5) * 1.1;
  });

  if (!isVisible) return null;

  return (
    <mesh ref={beamRef} position={[-4, 1.2, -2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.2, 3.2]} />
      <meshBasicMaterial
        color="#6EC6FF"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// Section 3: Smart Route Planner - Winding Path Line
const WindingRoutePath: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const routeRef = useRef<THREE.Mesh>(null);
  
  // Progress range (0.50 - 0.75)
  const drawWeight = clamp((scrollProgress - 0.50) / 0.20, 0, 1);
  const isVisible = scrollProgress >= 0.48 && scrollProgress <= 0.85;

  useFrame(() => {
    if (routeRef.current) {
      // Animate growth/scale along z-axis to look like it is drawing itself
      routeRef.current.scale.set(1, 1, drawWeight);
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* Primary pathway line running from Cafe to Park center */}
      <mesh ref={routeRef} position={[-2, 0.05, -3.25]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4.4, 0.02, 0.12]} />
        <meshBasicMaterial
          color="#7EF2C6"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

// Section 4: Community Powered Network - Nodes & Avatars
const CommunityNetworkMesh: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Progress range (0.70 - 0.90)
  const isVisible = scrollProgress >= 0.68 && scrollProgress <= 0.92;
  const animWeight = clamp((scrollProgress - 0.70) / 0.15, 0, 1);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle floating rotation
      groupRef.current.rotation.y = time * 0.15;
      groupRef.current.scale.set(animWeight, animWeight, animWeight);
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={groupRef} position={[2, 3.2, -1.8]}>
      {/* Glowing Nodes */}
      <mesh position={[-0.8, 0, 0.5]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#FFB5E8" />
      </mesh>
      <mesh position={[0.8, 0.3, -0.6]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#BFFCC6" />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>

      {/* Connected lines */}
      <mesh position={[0, 0.15, -0.05]} rotation={[0.2, 0.6, 0.8]}>
        <cylinderGeometry args={[0.015, 0.015, 1.8, 4]} />
        <meshBasicMaterial color="#E8D7FF" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.4, -0.1, 0.25]} rotation={[-0.4, 0.2, -0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 1.4, 4]} />
        <meshBasicMaterial color="#E8D7FF" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

interface ThreeHeroCanvasProps {
  scrollProgress: number;
  onPinClick?: (place: 'cafe' | 'park' | 'hospital') => void;
  mouseCoords: { x: number; y: number };
  isLowEnd?: boolean;
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({ 
  scrollProgress, 
  onPinClick,
  mouseCoords,
  isLowEnd = false
}) => {
  const butterflyRef = useRef<THREE.Group>(null);

  return (
    <div className="w-full h-full">
      <Canvas shadows gl={{ antialias: true, powerPreference: "high-performance" }}>
        <PerspectiveCamera makeDefault fov={45} near={0.1} far={50} />
        
        <CameraController 
          scrollProgress={scrollProgress} 
          butterflyRef={butterflyRef} 
          mouseCoords={mouseCoords} 
        />

        {/* Misty Pearl White Volumetric Fog */}
        <fog attach="fog" args={['#faf6ff', 8, 26]} />

        <ThreeCity scrollProgress={scrollProgress} onPinClick={onPinClick} isLowEnd={isLowEnd} />

        {/* Core Butterfly Main Character */}
        <ThreeButterfly 
          scrollProgress={scrollProgress} 
          mouseCoords={mouseCoords} 
          butterflyRef={butterflyRef}
          isLowEnd={isLowEnd}
        />

        {/* Section 1: AI Scanner Beam Sweep */}
        <ScanningBeam scrollProgress={scrollProgress} />

        {/* Section 3: Route Planner glowing pathways */}
        <WindingRoutePath scrollProgress={scrollProgress} />

        {/* Section 4: Community mesh node cluster */}
        <CommunityNetworkMesh scrollProgress={scrollProgress} />

        {/* Scene 5 rising butterfly swarm */}
        <ButterflySwarm scrollProgress={scrollProgress} />

        {/* High quality post-processing (degrades gracefully/omitted on low end) */}
        {!isLowEnd && (
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={1.8}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <DepthOfField
              focusDistance={0.03}
              focalLength={0.06}
              bokehScale={3.5}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default ThreeHeroCanvas;
