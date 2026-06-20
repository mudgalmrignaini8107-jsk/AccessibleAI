'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThreeButterflyProps {
  position?: [number, number, number];
  scale?: number;
  butterflyRef?: React.RefObject<THREE.Group | null>;
}

const PASTEL_COLORS = [
  new THREE.Color('#FF6EC7'), // brand-pink
  new THREE.Color('#B388FF'), // brand-lavender
  new THREE.Color('#6EC6FF'), // brand-sky
  new THREE.Color('#7EF2C6'), // brand-mint
  new THREE.Color('#FFD6A5'), // sec-peach
  new THREE.Color('#FF9A8B')  // sec-coral
];

export const ThreeButterfly: React.FC<ThreeButterflyProps> = ({
  scale = 2.4, // Large, visually dominant scale
  butterflyRef
}) => {
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const trailPointsRef = useRef<THREE.Points>(null);
  
  // Volumetric light rays references
  const ray1Ref = useRef<THREE.Mesh>(null);
  const ray2Ref = useRef<THREE.Mesh>(null);
  const ray3Ref = useRef<THREE.Mesh>(null);

  // Butterfly wing geometry
  const { leftWingGeometry, rightWingGeometry } = useMemo(() => {
    // Upper and lower wing structures for a fairytale feel
    const leftWingShape = new THREE.Shape();
    leftWingShape.moveTo(0, 0);
    leftWingShape.quadraticCurveTo(-1.4, 1.8, -2.4, 1.2);
    leftWingShape.quadraticCurveTo(-2.6, 0.4, -1.8, -0.4);
    leftWingShape.quadraticCurveTo(-2.0, -1.2, -1.2, -1.4);
    leftWingShape.quadraticCurveTo(-0.6, -1.0, 0, -0.2);

    const rightWingShape = new THREE.Shape();
    rightWingShape.moveTo(0, 0);
    rightWingShape.quadraticCurveTo(1.4, 1.8, 2.4, 1.2);
    rightWingShape.quadraticCurveTo(2.6, 0.4, 1.8, -0.4);
    rightWingShape.quadraticCurveTo(2.0, -1.2, 1.2, -1.4);
    rightWingShape.quadraticCurveTo(0.6, -1.0, 0, -0.2);

    return {
      leftWingGeometry: new THREE.ShapeGeometry(leftWingShape),
      rightWingGeometry: new THREE.ShapeGeometry(rightWingShape)
    };
  }, []);

  // Particle trail parameters (increased count for dense fairy dust)
  const particleCount = 250;
  const particles = useMemo(() => {
    const pArr = [];
    for (let i = 0; i < particleCount; i++) {
      pArr.push({
        position: new THREE.Vector3(0, -999, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)].clone(),
        size: Math.random() * 0.18 + 0.06,
        age: 0,
        maxAge: Math.random() * 70 + 50
      });
    }
    return pArr;
  }, []);

  // Set up particle attributes for points geometry
  const [positionsArray, colorsArray, sizesArray] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const siz = new Float32Array(particleCount);
    return [pos, col, siz];
  }, []);

  let particleSpawnIndex = 0;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Organic wing flap (flutter rate fluctuates slightly like a real creature)
    const baseFlapSpeed = 16.0;
    const flapFlurry = Math.sin(time * 0.5) * 4.0; // random flurry cycles
    const wingAngle = Math.sin(time * (baseFlapSpeed + flapFlurry)) * 0.75;
    
    if (leftWingRef.current) leftWingRef.current.rotation.y = wingAngle;
    if (rightWingRef.current) rightWingRef.current.rotation.y = -wingAngle;

    // 2. Light pulse intensity
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 6.0 + Math.sin(time * 10.0) * 2.0;
    }

    // 3. Volumetric Ray Animations (Pulse opacity and rotate beams)
    if (ray1Ref.current) {
      ray1Ref.current.rotation.z = time * 0.15;
      (ray1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(time * 4.0) * 0.04;
    }
    if (ray2Ref.current) {
      ray2Ref.current.rotation.z = -time * 0.12;
      (ray2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.cos(time * 3.0) * 0.03;
    }
    if (ray3Ref.current) {
      ray3Ref.current.rotation.y = time * 0.2;
      (ray3Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.10 + Math.sin(time * 2.5) * 0.03;
    }

    // 4. Update particle trail
    if (butterflyRef?.current) {
      const bPos = new THREE.Vector3();
      butterflyRef.current.getWorldPosition(bPos);

      // Spawn a new particle every frame
      const p = particles[particleSpawnIndex];
      p.position.copy(bPos);
      
      // Dispersion offsets
      p.position.x += (Math.random() - 0.5) * 0.2;
      p.position.y += (Math.random() - 0.5) * 0.2;
      p.position.z += (Math.random() - 0.5) * 0.2;

      p.velocity.set(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.3) * 0.02 - 0.015, // float downwards
        (Math.random() - 0.5) * 0.02 + 0.015  // float back
      );
      p.age = 0;
      p.color.copy(PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]);

      particleSpawnIndex = (particleSpawnIndex + 1) % particleCount;
    }

    // Update all particles
    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      p.position.add(p.velocity);
      p.age += 1;

      // Slow drift
      p.velocity.multiplyScalar(0.97);

      positionsArray[i * 3] = p.position.x;
      positionsArray[i * 3 + 1] = p.position.y;
      positionsArray[i * 3 + 2] = p.position.z;

      const lifeRatio = 1 - p.age / p.maxAge;
      const opacity = Math.max(0, lifeRatio);
      
      colorsArray[i * 3] = p.color.r * opacity;
      colorsArray[i * 3 + 1] = p.color.g * opacity;
      colorsArray[i * 3 + 2] = p.color.b * opacity;

      sizesArray[i] = p.size * opacity;
    }

    // Notify geometry update
    if (trailPointsRef.current) {
      const geo = trailPointsRef.current.geometry;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 3D Butterfly Group */}
      <group ref={butterflyRef as unknown as React.Ref<THREE.Group>} scale={[scale, scale, scale]}>
        {/* Glowing Point Light */}
        <pointLight
          ref={pointLightRef}
          color="#DCC6FF"
          distance={18}
          intensity={8.0}
          decay={1.8}
          castShadow
        />

        {/* Volumetric Light Rays (Translucent Cones) */}
        <group position={[0, -0.2, 0]}>
          <mesh ref={ray1Ref} rotation={[0.4, 0, 0.2]}>
            <cylinderGeometry args={[0.02, 1.4, 3.2, 12, 1, true]} />
            <meshBasicMaterial
              color="#B388FF"
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={ray2Ref} rotation={[-0.2, 0, -0.4]}>
            <cylinderGeometry args={[0.02, 1.0, 2.8, 12, 1, true]} />
            <meshBasicMaterial
              color="#FF6EC7"
              transparent
              opacity={0.10}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={ray3Ref} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 1.2, 3.0, 12, 1, true]} />
            <meshBasicMaterial
              color="#6EC6FF"
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Central Body (Pixar-style organic body) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.07, 1.3, 10]} />
          <meshStandardMaterial
            color="#2d1d4c"
            emissive="#B388FF"
            emissiveIntensity={1.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Antennae */}
        <group position={[0, 0.55, 0]}>
          <mesh rotation={[0.4, 0, -0.3]} position={[-0.1, 0.25, 0.15]}>
            <cylinderGeometry args={[0.015, 0.01, 0.55, 4]} />
            <meshBasicMaterial color="#B388FF" />
          </mesh>
          <mesh rotation={[0.4, 0, 0.3]} position={[0.1, 0.25, 0.15]}>
            <cylinderGeometry args={[0.015, 0.01, 0.55, 4]} />
            <meshBasicMaterial color="#B388FF" />
          </mesh>
        </group>

        {/* Left Wing (Double Layered Material for fairy look) */}
        <mesh
          ref={leftWingRef}
          geometry={leftWingGeometry}
          position={[-0.04, 0, 0]}
          rotation={[0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial
            color="#FF6EC7"
            emissive="#FF6EC7"
            emissiveIntensity={4.5}
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Right Wing */}
        <mesh
          ref={rightWingRef}
          geometry={rightWingGeometry}
          position={[0.04, 0, 0]}
          rotation={[0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial
            color="#6EC6FF"
            emissive="#6EC6FF"
            emissiveIntensity={4.5}
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Particle Trail Points */}
      <points ref={trailPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positionsArray, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colorsArray, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};
