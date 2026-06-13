import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";

/* ── Optimised Shard — reduced geometry complexity for mobile ── */
const Shard = ({
  position,
  rotation,
  scale,
  speed,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initY = position[1];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = initY + Math.sin(t * speed) * 0.3;
    meshRef.current.rotation.x = rotation[0] + t * speed * 0.15;
    meshRef.current.rotation.y = rotation[1] + t * speed * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {/* Low-poly octahedron for max perf */}
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        metalness={0.85}
        roughness={0.15}
        envMapIntensity={1.2}
      />
    </mesh>
  );
};

/* ── Gold Sphere — reduced segments for performance ─────────── */
const LuxurySphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.08;
    meshRef.current.rotation.x = t * 0.04;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      {/* Reduced from 128,128 → 64,64 — looks identical, runs 4× faster */}
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#B8965A"
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={1}
          roughness={0.05}
          distort={0.28}
          speed={1.2}
        />
      </Sphere>
    </Float>
  );
};

/* ── Orbit Ring ──────────────────────────────────────────────── */
const OrbitRing = ({ radius, speed, tilt }: { radius: number; speed: number; tilt: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      {/* Reduced tube segments from 200 → 80 */}
      <Torus args={[radius, 0.007, 8, 80]}>
        <meshStandardMaterial color="#B8965A" metalness={1} roughness={0.1} envMapIntensity={1.5} />
      </Torus>
    </mesh>
  );
};

/* ── Floating Shards — reduced from 12 → 6 for mobile perf ──── */
const FloatingShards = ({ isMobile }: { isMobile: boolean }) => {
  const count = isMobile ? 4 : 8;
  const shards = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        pos: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6 - 3,
        ] as [number, number, number],
        rot: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ] as [number, number, number],
        scale: 0.05 + Math.random() * 0.12,
        speed: 0.15 + Math.random() * 0.3,
      })),
    [count]
  );

  return (
    <>
      {shards.map((c, i) => (
        <Shard
          key={i}
          position={c.pos}
          rotation={c.rot}
          scale={c.scale}
          speed={c.speed}
          color={i % 3 === 0 ? "#B8965A" : "#C9C3BA"}
        />
      ))}
    </>
  );
};

/* ── Main Hero3D Scene ──────────────────────────────────────── */
export const Hero3D = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      className="canvas-hero"
      camera={{ position: [0, 0, isMobile ? 9 : 7], fov: isMobile ? 65 : 55 }}
      gl={{
        antialias: !isMobile,       // disable antialias on mobile → massive perf gain
        alpha: true,
        powerPreference: "high-performance",
        precision: isMobile ? "lowp" : "highp",
      }}
      dpr={isMobile ? [1, 1] : [1, 1.5]}  // cap DPR on mobile
      frameloop="always"
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <pointLight position={[-4, 3, 2]} intensity={1.2} color="#B8965A" />
      <pointLight position={[4, -3, -2]} intensity={0.6} color="#F8F5EF" />

      <LuxurySphere />
      <FloatingShards isMobile={isMobile} />

      {/* 2 rings on mobile instead of 3 */}
      <OrbitRing radius={3}   speed={0.16}  tilt={0.4} />
      <OrbitRing radius={4.0} speed={-0.10} tilt={0.9} />
      {!isMobile && <OrbitRing radius={2.2} speed={0.28} tilt={1.2} />}

      {/* city preset loads faster than studio */}
      <Environment preset="city" />
    </Canvas>
  );
};
