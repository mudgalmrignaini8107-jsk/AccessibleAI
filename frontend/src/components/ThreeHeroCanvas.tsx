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
    butterflyPos: [2.2, 1.6, 2.0], // Floats center-right initially
    cameraPos: [0.0, 2.5, 8.0],
    cameraTarget: [0.0, 0.8, 0.0]
  },
  {
    progress: 0.12, // The Awakening
    butterflyPos: [1.8, 1.5, 1.5],
    cameraPos: [0.0, 2.0, 7.0],
    cameraTarget: [0.0, 0.8, 0.0]
  },
  {
    progress: 0.32, // Cafe ramp
    butterflyPos: [-4.0, 0.65, 0.25],
    cameraPos: [-2.2, 1.0, 3.0],
    cameraTarget: [-4.0, 0.3, 0.6]
  },
  {
    progress: 0.56, // Park path
    butterflyPos: [0.0, 0.5, -2.5],
    cameraPos: [-1.4, 1.4, 0.2],
    cameraTarget: [0.0, 0.35, -3.2]
  },
  {
    progress: 0.78, // Hospital elevator
    butterflyPos: [4.0, 1.25, -0.8],
    cameraPos: [2.2, 1.5, 2.5],
    cameraTarget: [4.0, 1.0, -0.6]
  },
  {
    progress: 0.90, // Swarm rising
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

// Linear interpolation function
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

// Clamp function
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// Custom controller to update camera and butterfly on frame ticks
interface CameraControllerProps {
  scrollProgress: number;
  butterflyRef: React.RefObject<THREE.Group | null>;
}

const CameraController: React.FC<CameraControllerProps> = ({ scrollProgress, butterflyRef }) => {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 0.6, 0));

  useFrame(() => {
    // 1. Find bounding keyframes
    let prevIndex = 0;
    let nextIndex = 0;

    for (let i = 0; i < KEYFRAMES.length; i++) {
      if (KEYFRAMES[i].progress <= scrollProgress) {
        prevIndex = i;
      }
    }
    nextIndex = Math.min(prevIndex + 1, KEYFRAMES.length - 1);

    const prev = KEYFRAMES[prevIndex];
    const next = KEYFRAMES[nextIndex];

    let t = 0;
    if (prev.progress !== next.progress) {
      t = (scrollProgress - prev.progress) / (next.progress - prev.progress);
    }
    
    // Apply smooth step easing to local interpolation weight
    const smoothT = t * t * (3 - 2 * t);

    // 2. Interpolate Butterfly Position
    if (butterflyRef.current) {
      const bX = lerp(prev.butterflyPos[0], next.butterflyPos[0], smoothT);
      const bY = lerp(prev.butterflyPos[1], next.butterflyPos[1], smoothT);
      const bZ = lerp(prev.butterflyPos[2], next.butterflyPos[2], smoothT);

      // Add gentle hover flutter
      const hoverY = Math.sin(Date.now() * 0.003) * 0.06;
      butterflyRef.current.position.set(bX, bY + hoverY, bZ);

      // Rotate butterfly to face travel direction
      if (prevIndex !== nextIndex) {
        const dirX = next.butterflyPos[0] - prev.butterflyPos[0];
        const dirZ = next.butterflyPos[2] - prev.butterflyPos[2];
        const angle = Math.atan2(dirX, dirZ);
        // Lerp rotation smoothly
        butterflyRef.current.rotation.y = angle + Math.PI;
      }
    }

    // 3. Interpolate Camera Position
    const camX = lerp(prev.cameraPos[0], next.cameraPos[0], smoothT);
    const camY = lerp(prev.cameraPos[1], next.cameraPos[1], smoothT);
    const camZ = lerp(prev.cameraPos[2], next.cameraPos[2], smoothT);
    camera.position.set(camX, camY, camZ);

    // 4. Interpolate Camera LookAt Target
    const tarX = lerp(prev.cameraTarget[0], next.cameraTarget[0], smoothT);
    const tarY = lerp(prev.cameraTarget[1], next.cameraTarget[1], smoothT);
    const tarZ = lerp(prev.cameraTarget[2], next.cameraTarget[2], smoothT);
    currentTarget.current.set(tarX, tarY, tarZ);
    camera.lookAt(currentTarget.current);
  });

  return null;
};

// Swarm of butterflies rising up in Scene 6/7
const ButterflySwarm: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const swarmRef = useRef<THREE.InstancedMesh>(null);
  const count = 120;

  // Generate initial particle properties
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 16,
        z: (Math.random() - 0.5) * 12 - 2,
        yStart: -1.0 - Math.random() * 2.0,
        speed: Math.random() * 4.0 + 3.0,
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

    // Rising threshold: begins at scrollProgress = 0.80
    const riseFactor = clamp((scrollProgress - 0.80) / 0.20, 0, 1);
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      
      // Calculate position
      const currentY = p.yStart + riseFactor * p.speed * 6.0;
      
      // Flapping wings rotation simulation (scale width back and forth)
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
    <instancedMesh ref={swarmRef} args={[undefined, undefined, count] as unknown as [THREE.BufferGeometry, THREE.Material, number]} castShadow>
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

interface ThreeHeroCanvasProps {
  scrollProgress: number;
  onPinClick?: (place: 'cafe' | 'park' | 'hospital') => void;
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({ scrollProgress, onPinClick }) => {
  const butterflyRef = useRef<THREE.Group>(null);

  return (
    <div className="w-full h-full">
      <Canvas shadows gl={{ antialias: true, powerPreference: "high-performance" }}>
        {/* Set up camera with Drei PerspectiveCamera */}
        <PerspectiveCamera makeDefault fov={45} near={0.1} far={50} />
        
        {/* Custom controller */}
        <CameraController scrollProgress={scrollProgress} butterflyRef={butterflyRef} />

        {/* Volumetric Fog */}
        <fog attach="fog" args={['#1e293b', 8, 25]} />

        {/* 3D City mesh grid */}
        <ThreeCity scrollProgress={scrollProgress} onPinClick={onPinClick} />

        {/* Main Glowing Butterfly (Scaled up to be extremely dominant) */}
        <ThreeButterfly scale={2.5} butterflyRef={butterflyRef} />

        {/* Rising swarm in the final scene */}
        <ButterflySwarm scrollProgress={scrollProgress} />

        {/* Cinematic Post-Processing */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <DepthOfField
            focusDistance={0.03}
            focalLength={0.06}
            bokehScale={4.0}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default ThreeHeroCanvas;
