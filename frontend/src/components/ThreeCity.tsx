'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThreeCityProps {
  scrollProgress: number;
  onPinClick?: (place: 'cafe' | 'park' | 'hospital') => void;
}

// Utility to clamp values
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// Floating Interactive Pin Component
const InteractivePin: React.FC<{
  position: [number, number, number];
  color: string;
  onClick: () => void;
}> = ({ position, color, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating up and down
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.15;
      // Rotation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 1.5;
    }
  });

  return (
    <group
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Outer pulsing ring */}
      <mesh scale={hovered ? [1.4, 1.4, 1.4] : [1, 1, 1]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Inner glowing sphere */}
      <mesh scale={hovered ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Volumetric glowing cone below pin */}
      <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.15, 0.6, 8, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.45 : 0.25}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export const ThreeCity: React.FC<ThreeCityProps> = ({ scrollProgress, onPinClick }) => {
  // References for animating elements
  const cafeRampRef = useRef<THREE.Mesh>(null);
  const parkPathRef = useRef<THREE.Mesh>(null);
  const hospitalElevatorRef = useRef<THREE.Group>(null);

  // Character references
  const wheelchairUserRef = useRef<THREE.Group>(null);
  const parentStrollerRef = useRef<THREE.Group>(null);
  const elderlyPersonRef = useRef<THREE.Group>(null);

  // Tree scaling references
  const tree1Ref = useRef<THREE.Group>(null);
  const tree2Ref = useRef<THREE.Group>(null);
  const tree3Ref = useRef<THREE.Group>(null);

  // Material references for color bloom
  const cafeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const parkMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hospitalMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const groundMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const bgBuildingsMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Lamp references
  const cafeLampLightRef = useRef<THREE.SpotLight>(null);
  const parkLampLightRef = useRef<THREE.SpotLight>(null);
  const hospitalLampLightRef = useRef<THREE.SpotLight>(null);
  
  const cafeLampConeRef = useRef<THREE.Mesh>(null);
  const parkLampConeRef = useRef<THREE.Mesh>(null);
  const hospitalLampConeRef = useRef<THREE.Mesh>(null);

  // Base colors
  const monochromeColor = useMemo(() => new THREE.Color('#475569'), []); // Slate-600
  const groundMonoColor = useMemo(() => new THREE.Color('#1e293b'), []); // Slate-800
  
  // Target pastel colors
  const cafeTargetColor = useMemo(() => new THREE.Color('#FF6EC7'), []); // brand-pink
  const parkTargetColor = useMemo(() => new THREE.Color('#7EF2C6'), []); // brand-mint
  const hospitalTargetColor = useMemo(() => new THREE.Color('#6EC6FF'), []); // brand-sky
  const groundTargetColor = useMemo(() => new THREE.Color('#2e2542'), []); // dark violet base
  const bgTargetColor = useMemo(() => new THREE.Color('#B388FF'), []); // brand-lavender

  useFrame(() => {
    // 1. Calculate section weights
    const cafeWeight = clamp((scrollProgress - 0.15) / 0.20, 0, 1);       // Scene 3
    const parkWeight = clamp((scrollProgress - 0.40) / 0.20, 0, 1);       // Scene 4
    const hospitalWeight = clamp((scrollProgress - 0.65) / 0.20, 0, 1);   // Scene 5
    const fullColorWeight = clamp((scrollProgress - 0.85) / 0.15, 0, 1);  // Scene 6

    // 2. Interpolate material colors (Monochrome -> Pastel Bloom)
    if (cafeMatRef.current) {
      cafeMatRef.current.color.copy(monochromeColor).lerp(cafeTargetColor, cafeWeight);
      cafeMatRef.current.emissive.copy(cafeTargetColor).multiplyScalar(cafeWeight * 0.2);
    }
    if (parkMatRef.current) {
      parkMatRef.current.color.copy(monochromeColor).lerp(parkTargetColor, parkWeight);
      parkMatRef.current.emissive.copy(parkTargetColor).multiplyScalar(parkWeight * 0.2);
    }
    if (hospitalMatRef.current) {
      hospitalMatRef.current.color.copy(monochromeColor).lerp(hospitalTargetColor, hospitalWeight);
      hospitalMatRef.current.emissive.copy(hospitalTargetColor).multiplyScalar(hospitalWeight * 0.2);
    }
    if (bgBuildingsMatRef.current) {
      bgBuildingsMatRef.current.color.copy(monochromeColor).lerp(bgTargetColor, fullColorWeight);
      bgBuildingsMatRef.current.emissive.copy(bgTargetColor).multiplyScalar(fullColorWeight * 0.1);
    }
    if (groundMatRef.current) {
      groundMatRef.current.color.copy(groundMonoColor).lerp(groundTargetColor, fullColorWeight);
    }

    // 3. Animate accessibility features emerging
    // Cafe Ramp slides/scales up
    if (cafeRampRef.current) {
      const rampScaleY = clamp((scrollProgress - 0.20) / 0.10, 0, 1);
      cafeRampRef.current.scale.set(1, rampScaleY, 1);
    }
    // Park Smooth Path material bloom & scale
    if (parkPathRef.current) {
      const pathScaleZ = clamp((scrollProgress - 0.42) / 0.12, 0, 1);
      parkPathRef.current.scale.set(1, 1, pathScaleZ);
    }
    // Hospital Elevator activation
    if (hospitalElevatorRef.current) {
      const elevatorProgress = clamp((scrollProgress - 0.72) / 0.12, 0, 1);
      // Lift rises from ground level (0) to level 2 (2.4 height)
      hospitalElevatorRef.current.position.y = elevatorProgress * 2.4;
    }

    // 4. Bloom trees in the park
    if (tree1Ref.current) {
      const s = clamp((scrollProgress - 0.45) / 0.10, 0.001, 1.2);
      tree1Ref.current.scale.set(s, s, s);
    }
    if (tree2Ref.current) {
      const s = clamp((scrollProgress - 0.48) / 0.10, 0.001, 1.0);
      tree2Ref.current.scale.set(s, s, s);
    }
    if (tree3Ref.current) {
      const s = clamp((scrollProgress - 0.52) / 0.10, 0.001, 1.1);
      tree3Ref.current.scale.set(s, s, s);
    }

    // 5. Activate streetlight glows
    if (cafeLampLightRef.current && cafeLampConeRef.current) {
      const intensity = clamp((scrollProgress - 0.22) / 0.08, 0, 1);
      cafeLampLightRef.current.intensity = intensity * 8;
      (cafeLampConeRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.15;
    }
    if (parkLampLightRef.current && parkLampConeRef.current) {
      const intensity = clamp((scrollProgress - 0.48) / 0.08, 0, 1);
      parkLampLightRef.current.intensity = intensity * 8;
      (parkLampConeRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.15;
    }
    if (hospitalLampLightRef.current && hospitalLampConeRef.current) {
      const intensity = clamp((scrollProgress - 0.70) / 0.08, 0, 1);
      hospitalLampLightRef.current.intensity = intensity * 8;
      (hospitalLampConeRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.15;
    }

    // 6. Character Life Movements
    // Wheelchair User
    if (wheelchairUserRef.current) {
      const moveProgress = clamp((scrollProgress - 0.25) / 0.12, 0, 1);
      wheelchairUserRef.current.position.z = 1.0 - moveProgress * 1.6;
      wheelchairUserRef.current.position.y = 0.2 + moveProgress * 0.2;
    }
    // Parent with Stroller
    if (parentStrollerRef.current) {
      const walkProgress = clamp((scrollProgress - 0.50) / 0.15, 0, 1);
      parentStrollerRef.current.position.x = -1.8 + walkProgress * 3.6;
    }
    // Elderly Person
    if (elderlyPersonRef.current) {
      const enterProgress = clamp((scrollProgress - 0.68) / 0.06, 0, 1);
      const liftProgress = clamp((scrollProgress - 0.72) / 0.12, 0, 1);
      
      elderlyPersonRef.current.position.x = 4.0 - enterProgress * 0.5;
      elderlyPersonRef.current.position.z = 0.8 - enterProgress * 2.6;
      elderlyPersonRef.current.position.y = 0.2 + liftProgress * 2.4;
    }
  });

  // Display pins only in blueprint mode/dashboard mode (scroll > 0.90)
  const showPins = scrollProgress > 0.90;

  return (
    <group>
      {/* Volumetric Lights & Ambient */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial ref={groundMatRef} color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Sidewalk border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      
      {/* Cafe Sector */}
      <group position={[-4, 0, -2]}>
        <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[2.5, 2.4, 2.5]} />
          <meshStandardMaterial
            ref={cafeMatRef}
            color="#475569"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        
        <mesh position={[0, 2.2, 1.3]}>
          <boxGeometry args={[1.5, 0.3, 0.1]} />
          <meshStandardMaterial color="#FFD6A5" />
        </mesh>
        
        <mesh position={[0, 0.1, 1.3]}>
          <boxGeometry args={[1.2, 0.2, 0.3]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        <mesh position={[0, 0.7, 1.26]}>
          <boxGeometry args={[0.8, 1.2, 0.05]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Ramp */}
        <mesh
          ref={cafeRampRef}
          position={[0, 0.1, 1.55]}
          scale={[1, 0.001, 1]}
          castShadow
        >
          <boxGeometry args={[0.7, 0.2, 0.6]} />
          <meshStandardMaterial color="#FF6EC7" roughness={0.3} />
        </mesh>

        {/* Cafe Street Lamp */}
        <group position={[1.4, 0, 1.2]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 2.4, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <spotLight
            ref={cafeLampLightRef}
            position={[0, 2.4, 0]}
            angle={0.45}
            penumbra={0.5}
            intensity={0}
            color="#FF9A8B"
            distance={8}
          />
          <mesh ref={cafeLampConeRef} position={[0, -1.0, 0]}>
            <cylinderGeometry args={[0.05, 0.8, 2.0, 16, 1, true]} />
            <meshBasicMaterial
              color="#FF9A8B"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>

        {showPins && onPinClick && (
          <InteractivePin
            position={[0, 2.8, 0]}
            color="#FF6EC7"
            onClick={() => onPinClick('cafe')}
          />
        )}
      </group>

      {/* Inclusive Park Sector */}
      <group position={[0, 0, -4.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={[4.5, 4.5]} />
          <meshStandardMaterial ref={parkMatRef} color="#475569" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[1.2, 0.02, 4.4]} />
          <meshStandardMaterial color="#64748b" roughness={1.0} />
        </mesh>

        {/* Smooth Path */}
        <mesh
          ref={parkPathRef}
          position={[0, 0.035, 0]}
          scale={[1, 1, 0.001]}
          receiveShadow
        >
          <boxGeometry args={[1.1, 0.02, 4.39]} />
          <meshStandardMaterial
            color="#7EF2C6"
            emissive="#7EF2C6"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>

        {/* Park Bench */}
        <group position={[-1.4, 0.2, 0.5]} rotation={[0, 0.5, 0]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[0.9, 0.05, 0.4]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh castShadow position={[0, 0.3, -0.18]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.9, 0.3, 0.04]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[-0.4, 0, 0]}>
            <boxGeometry args={[0.04, 0.2, 0.38]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.04, 0.2, 0.38]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>

        {/* Trees */}
        <group ref={tree1Ref} position={[-1.5, 0, -1.2]} scale={[0.001, 0.001, 0.001]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 1.0, 6]} />
            <meshStandardMaterial color="#451e3e" />
          </mesh>
          <mesh position={[0, 1.3, 0]} castShadow>
            <sphereGeometry args={[0.65, 8, 8]} />
            <meshStandardMaterial color="#b8fff9" roughness={0.6} />
          </mesh>
        </group>

        <group ref={tree2Ref} position={[1.5, 0, -1.4]} scale={[0.001, 0.001, 0.001]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 0.8, 6]} />
            <meshStandardMaterial color="#451e3e" />
          </mesh>
          <mesh position={[0, 1.0, 0]} castShadow>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#a7d8ff" roughness={0.6} />
          </mesh>
        </group>

        <group ref={tree3Ref} position={[1.4, 0, 1.0]} scale={[0.001, 0.001, 0.001]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 1.0, 6]} />
            <meshStandardMaterial color="#451e3e" />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.58, 8, 8]} />
            <meshStandardMaterial color="#ff9a8b" roughness={0.6} />
          </mesh>
        </group>

        {/* Lamp Post */}
        <group position={[0.7, 0, -1.8]}>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 2.2, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <spotLight
            ref={parkLampLightRef}
            position={[0, 2.2, 0]}
            angle={0.5}
            penumbra={0.5}
            intensity={0}
            color="#7EF2C6"
            distance={8}
          />
          <mesh ref={parkLampConeRef} position={[0, -0.9, 0]}>
            <cylinderGeometry args={[0.04, 0.7, 1.8, 16, 1, true]} />
            <meshBasicMaterial
              color="#7EF2C6"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>

        {showPins && onPinClick && (
          <InteractivePin
            position={[0, 1.8, 0]}
            color="#7EF2C6"
            onClick={() => onPinClick('park')}
          />
        )}
      </group>

      {/* Hospital Sector */}
      <group position={[4, 0, -2.5]}>
        <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
          <boxGeometry args={[3.2, 3.2, 2.2]} />
          <meshStandardMaterial
            ref={hospitalMatRef}
            color="#475569"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        <group position={[0, 2.2, 1.12]} scale={[0.6, 0.6, 0.6]}>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.18, 0.1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.6, 0.1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>

        <group position={[-0.6, 0, 1.25]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[1.2, 0.2, 0.4]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[0, 0.3, -0.15]} castShadow>
            <boxGeometry args={[1.2, 0.2, 0.4]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[0, 0.5, -0.3]} castShadow>
            <boxGeometry args={[1.2, 0.2, 0.4]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>

        {/* Elevator */}
        <group position={[1.1, 0, 1.2]}>
          <mesh position={[-0.4, 1.6, -0.4]}>
            <cylinderGeometry args={[0.02, 0.02, 3.2, 4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0.4, 1.6, -0.4]}>
            <cylinderGeometry args={[0.02, 0.02, 3.2, 4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[-0.4, 1.6, 0.4]}>
            <cylinderGeometry args={[0.02, 0.02, 3.2, 4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0.4, 1.6, 0.4]}>
            <cylinderGeometry args={[0.02, 0.02, 3.2, 4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>

          <group ref={hospitalElevatorRef} position={[0, 0, 0]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <boxGeometry args={[0.8, 0.08, 0.8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
              <boxGeometry args={[0.8, 0.08, 0.8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.78, 0.82, 0.78]} />
              <meshStandardMaterial
                color="#6EC6FF"
                transparent
                opacity={0.35}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          </group>
        </group>

        {/* Hospital Lamp */}
        <group position={[-1.4, 0, 1.3]}>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 2.6, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <spotLight
            ref={hospitalLampLightRef}
            position={[0, 2.6, 0]}
            angle={0.45}
            penumbra={0.5}
            intensity={0}
            color="#6EC6FF"
            distance={8}
          />
          <mesh ref={hospitalLampConeRef} position={[0, -1.0, 0]}>
            <cylinderGeometry args={[0.05, 0.8, 2.2, 16, 1, true]} />
            <meshBasicMaterial
              color="#6EC6FF"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>

        {showPins && onPinClick && (
          <InteractivePin
            position={[0, 3.8, 0]}
            color="#6EC6FF"
            onClick={() => onPinClick('hospital')}
          />
        )}
      </group>

      {/* Skyline Silhouettes */}
      <group>
        <mesh position={[-7, 1.8, -7.5]} castShadow>
          <boxGeometry args={[3.0, 3.6, 3.0]} />
          <meshStandardMaterial ref={bgBuildingsMatRef} color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[-3, 2.4, -9.0]} castShadow>
          <boxGeometry args={[4.0, 4.8, 3.5]} />
          <meshStandardMaterial ref={bgBuildingsMatRef} color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[3, 2.0, -8.5]} castShadow>
          <boxGeometry args={[3.2, 4.0, 3.2]} />
          <meshStandardMaterial ref={bgBuildingsMatRef} color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[7, 1.6, -7.0]} castShadow>
          <boxGeometry args={[3.5, 3.2, 3.5]} />
          <meshStandardMaterial ref={bgBuildingsMatRef} color="#475569" roughness={0.6} />
        </mesh>
      </group>

      {/* Character Silhouettes */}
      
      {/* Wheelchair User */}
      <group ref={wheelchairUserRef} position={[-4.0, 0.2, 1.0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshBasicMaterial color="#FF9DDB" />
        </mesh>
        <mesh position={[0, 0.15, -0.05]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.32, 6]} />
          <meshBasicMaterial color="#FF9DDB" />
        </mesh>
        <mesh position={[-0.14, 0.0, -0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.2} />
        </mesh>
        <mesh position={[0.14, 0.0, -0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.2} />
        </mesh>
      </group>

      {/* Parent with Stroller */}
      <group ref={parentStrollerRef} position={[-1.8, 0.2, -3.8]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#96F9D4" />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.45, 6]} />
          <meshBasicMaterial color="#96F9D4" />
        </mesh>
        <mesh position={[0, 0.28, -0.32]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 0.25, -0.55]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.45]} />
          <meshBasicMaterial color="#96F9D4" />
        </mesh>
        <mesh position={[-0.14, 0.05, -0.65]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.14, 0.05, -0.65]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Elderly Person */}
      <group ref={elderlyPersonRef} position={[4.0, 0.2, 0.8]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#A4DBFF" />
        </mesh>
        <mesh position={[0, 0.3, -0.05]} rotation={[0.15, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.4, 6]} />
          <meshBasicMaterial color="#A4DBFF" />
        </mesh>
        <mesh position={[0.14, 0.22, 0.08]} rotation={[0.1, 0, -0.1]}>
          <cylinderGeometry args={[0.012, 0.012, 0.46, 4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>
    </group>
  );
};
