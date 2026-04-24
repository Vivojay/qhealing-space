import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import * as THREE from 'three';
import fontData from '@/assets/fonts/helvetiker_bold.typeface.json';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MOBILE_QUERY = '(max-width: 900px)';

const BASE_ROTATION = [-0.34, -0.12, -0.05];
const Z_LIMIT = 0.14;
const Z_BACK_LIMIT = -0.08;
const Y_DOWN_LIMIT = -0.15;
const Y_UP_LIMIT = 0.045;
const PULSE_RADIUS_X = 0.92;
const PULSE_RADIUS_Y = 2.3;
const PULSE_RADIUS_Z = 1.22;
const PULSE_DEBUG_MULT = 1.5;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function useStaticFallbackMode() {
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const motion = window.matchMedia(MOTION_QUERY);
    const mobile = window.matchMedia(MOBILE_QUERY);

    const sync = () => setFallback(motion.matches || mobile.matches);
    sync();

    motion.addEventListener('change', sync);
    mobile.addEventListener('change', sync);
    return () => {
      motion.removeEventListener('change', sync);
      mobile.removeEventListener('change', sync);
    };
  }, []);

  return fallback;
}

function useDebugPulse() {
  const [showDebugPulse, setShowDebugPulse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const viaQuery = new URLSearchParams(window.location.search).has('debugPulse');
    setShowDebugPulse(Boolean(import.meta.env.DEV || viaQuery));
  }, []);

  return showDebugPulse;
}

function CameraFraming({ focus, textFloorZ }) {
  const { camera } = useThree();

  useEffect(() => {
    const z = textFloorZ + 0.06;
    const x = focus.x - 2.9;
    const y = focus.y - 0.75;
    const targetX = focus.x + 3.4;
    const targetY = focus.y + 0.35;

    camera.position.set(x, y, z);
    camera.lookAt(targetX, targetY, z);
    camera.updateProjectionMatrix();
  }, [camera, focus.x, focus.y, textFloorZ]);

  return null;
}

function createLetterPhysicsData(font, text) {
  const letters = [];
  const source = text.toUpperCase();
  let globalMinBaseZ = Infinity;

  const config = {
    font,
    size: 1.35,
    depth: 0.24,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 2,
  };

  let widthCursor = 0;

  for (const char of source) {
    if (char === ' ') {
      widthCursor += 0.64;
      continue;
    }

    const geometry = new TextGeometry(char, config);
    geometry.computeBoundingBox();

    const box = geometry.boundingBox;
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    const depth = box.max.z - box.min.z;

    geometry.translate(-box.min.x, -(box.min.y + height / 2), -depth / 2);

    const position = geometry.getAttribute('position');
    position.setUsage(THREE.DynamicDrawUsage);

    const basePositions = new Float32Array(position.array);
    const velocities = new Float32Array(position.array.length);

    let minY = Infinity;
    let maxY = -Infinity;
    let minBaseZ = Infinity;
    for (let i = 1; i < basePositions.length; i += 3) {
      minY = Math.min(minY, basePositions[i]);
      maxY = Math.max(maxY, basePositions[i]);
      minBaseZ = Math.min(minBaseZ, basePositions[i + 1]);
    }
    const yRange = Math.max(maxY - minY, 0.001);
    globalMinBaseZ = Math.min(globalMinBaseZ, minBaseZ);

    const pinWeights = new Float32Array(basePositions.length / 3);
    for (let i = 0, vi = 0; i < basePositions.length; i += 3, vi += 1) {
      const yNorm = (basePositions[i + 1] - minY) / yRange;
      pinWeights[vi] = 0.22 + 0.78 * yNorm;
    }

    letters.push({
      char,
      width,
      minY,
      geometry,
      basePositions,
      velocities,
      pinWeights,
      target: [widthCursor + width / 2, 0, 0],
    });

    widthCursor += width + 0.24;
  }

  const totalWidth = Math.max(widthCursor - 0.24, 0);
  for (let i = 0; i < letters.length; i += 1) {
    letters[i].target[0] -= totalWidth / 2;
  }

  const first = letters[0];
  const cameraFocus = first
    ? {
      x: first.target[0] - first.width * 0.66,
      y: first.minY - 0.22,
      z: 0,
    }
    : { x: 0, y: -0.5, z: 0 };

  return {
    letters,
    totalWidth,
    textFloorZ: globalMinBaseZ + Z_BACK_LIMIT,
    cameraFocus,
  };
}

function HeadingPhysicsScene({ text, showDebugPulse }) {
  const font = useMemo(() => new FontLoader().parse(fontData), []);
  const { letters, totalWidth, textFloorZ, cameraFocus } = useMemo(() => createLetterPhysicsData(font, text), [font, text]);

  const debugSpikeRef = useRef(null);
  const debugHaloRef = useRef(null);
  const debugInfluenceRef = useRef(null);
  const debugInfluenceWireRef = useRef(null);
  const frameCountRef = useRef(0);

  const materials = useMemo(() => {
    const front = new THREE.MeshStandardMaterial({
      color: '#f4f4f5',
      emissive: '#000000',
      emissiveIntensity: 0,
      metalness: 0.02,
      roughness: 0.92,
    });

    const side = new THREE.MeshStandardMaterial({
      color: '#d7dbe1',
      emissive: '#000000',
      emissiveIntensity: 0,
      metalness: 0.02,
      roughness: 0.95,
    });

    return [front, side];
  }, []);

  useEffect(() => {
    return () => {
      for (const letter of letters) letter.geometry.dispose();
      for (const material of materials) material.dispose();
    };
  }, [letters, materials]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.033);

    const pulseMargin = 1.35;
    const pulseRight = totalWidth * 0.5 + pulseMargin;
    const pulseLeft = -totalWidth * 0.5 - pulseMargin;
    const pulseTravel = pulseRight - pulseLeft;
    const pulseSpeed = 2.95;
    const pulseProgress = (t * pulseSpeed) % pulseTravel;
    const pulseX = pulseRight - pulseProgress;
    const pulseY = 0;
    const pulseZ = 0.38;

    if (showDebugPulse && debugSpikeRef.current && debugHaloRef.current && debugInfluenceRef.current && debugInfluenceWireRef.current) {
      debugSpikeRef.current.position.set(pulseX, pulseY, pulseZ);
      debugHaloRef.current.position.set(pulseX, pulseY, pulseZ);
      debugInfluenceRef.current.position.set(pulseX, pulseY, pulseZ);
      debugInfluenceWireRef.current.position.set(pulseX, pulseY, pulseZ);
    }

    const shouldRecomputeNormals = frameCountRef.current % 4 === 0;
    frameCountRef.current += 1;

    for (let li = 0; li < letters.length; li += 1) {
      const letter = letters[li];
      const [targetX] = letter.target;

      const position = letter.geometry.getAttribute('position');
      const array = position.array;
      const base = letter.basePositions;
      const velocity = letter.velocities;
      const pin = letter.pinWeights;

      for (let i = 0, vi = 0; i < array.length; i += 3, vi += 1) {
        const bx = base[i];
        const by = base[i + 1];
        const bz = base[i + 2];

        let x = array[i];
        let y = array[i + 1];
        let z = array[i + 2];

        let vx = velocity[i];
        let vy = velocity[i + 1];
        let vz = velocity[i + 2];

        const ox = x - bx;
        const oy = y - by;
        const oz = z - bz;

        const pinStrength = pin[vi];

        const worldX = targetX + x;
        const worldY = y;
        const worldZ = z;

        const dx = worldX - pulseX;
        const dy = worldY - pulseY;
        const dz = worldZ - pulseZ;

        const influence = Math.exp(-(
          ((dx * dx) / (PULSE_RADIUS_X * PULSE_RADIUS_X)) +
          ((dy * dy) / (PULSE_RADIUS_Y * PULSE_RADIUS_Y)) +
          ((dz * dz) / (PULSE_RADIUS_Z * PULSE_RADIUS_Z))
        ));

        const springX = 42;
        const springY = 18 * (0.35 + pinStrength * 0.95);
        const springZ = 26 * (0.45 + pinStrength * 0.8);
        const damping = 9.2;

        const forceX = -ox * springX - vx * damping;
        const gravity = 24 * (1 - pinStrength * 0.72);
        const forceY = -oy * springY - vy * damping - gravity;
        const forceZ = -oz * springZ - vz * (damping * 0.9) + (influence * (12.4 + (1 - pinStrength) * 3.2));

        vx += forceX * dt;
        vy += forceY * dt;
        vz += forceZ * dt;

        x += vx * dt;
        y += vy * dt;
        z += vz * dt;

        x = bx + clamp(x - bx, -0.02, 0.02);
        y = by + clamp(y - by, Y_DOWN_LIMIT, Y_UP_LIMIT);
        z = bz + clamp(z - bz, Z_BACK_LIMIT, Z_LIMIT);

        if (y <= by + Y_DOWN_LIMIT || y >= by + Y_UP_LIMIT) vy *= 0.42;
        if (z <= bz + Z_BACK_LIMIT || z >= bz + Z_LIMIT) vz *= 0.45;

        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;

        velocity[i] = vx;
        velocity[i + 1] = vy;
        velocity[i + 2] = vz;
      }

      position.needsUpdate = true;
      if (shouldRecomputeNormals) letter.geometry.computeVertexNormals();
    }
  });

  return (
    <>
      <CameraFraming focus={cameraFocus} textFloorZ={textFloorZ} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2.8, 4.2, 5.8]} intensity={0.68} color="#ffffff" />
      <directionalLight position={[-4.8, -1.8, -2.8]} intensity={0.2} color="#d4deef" />

      {showDebugPulse && (
        <>
          <mesh position={[0, 0, textFloorZ]}>
            <planeGeometry args={[totalWidth + 4.2, 4.8]} />
            <meshBasicMaterial color="#1d4ed8" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0, textFloorZ + 0.0012]}>
            <planeGeometry args={[totalWidth + 4.2, 4.8, 28, 12]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.38} depthWrite={false} />
          </mesh>

          <mesh
            ref={debugInfluenceRef}
            scale={[
              PULSE_RADIUS_X * PULSE_DEBUG_MULT,
              PULSE_RADIUS_Y * PULSE_DEBUG_MULT,
              PULSE_RADIUS_Z * PULSE_DEBUG_MULT,
            ]}
          >
            <sphereGeometry args={[1, 40, 28]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.14} depthWrite={false} />
          </mesh>
          <mesh
            ref={debugInfluenceWireRef}
            scale={[
              PULSE_RADIUS_X * PULSE_DEBUG_MULT,
              PULSE_RADIUS_Y * PULSE_DEBUG_MULT,
              PULSE_RADIUS_Z * PULSE_DEBUG_MULT,
            ]}
          >
            <sphereGeometry args={[1, 24, 18]} />
            <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.45} depthWrite={false} />
          </mesh>
          <mesh ref={debugHaloRef}>
            <cylinderGeometry args={[0.24, 0.24, 3.9, 16]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.28} />
          </mesh>
          <mesh ref={debugSpikeRef}>
            <boxGeometry args={[0.12, 3.6, 0.38]} />
            <meshBasicMaterial color="#ff00e5" transparent opacity={0.84} />
          </mesh>
        </>
      )}

      {letters.map((letter, i) => (
        <mesh key={`${letter.char}-${i}`} geometry={letter.geometry} material={materials} position={letter.target} rotation={BASE_ROTATION} />
      ))}
    </>
  );
}

export default function RetreatsHeading3DPhysics({ text = 'Retreats' }) {
  const fallback = useStaticFallbackMode();
  const showDebugPulse = useDebugPulse();

  if (fallback) {
    return (
      <h1 className="hero-display text-6xl lg:text-[8rem]" style={{ color: '#fafaf9' }}>
        {text}
      </h1>
    );
  }

  return (
    <div className="relative w-full max-w-[780px] h-[170px] sm:h-[200px] lg:h-[235px] pointer-events-none" role="img" aria-label={text}>
      <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0.25, 2.85, 8.4], fov: 27 }} dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <HeadingPhysicsScene text={text} showDebugPulse={showDebugPulse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
