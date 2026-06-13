import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, Sphere, Box, Torus, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

/* ── Floating Geometric Shards ─────────────────────────────────────── */
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
    <mesh ref={meshRef} position={position} scale={scale} castShadow>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={1.5}
      />
    </mesh>
  );
};

/* ── Distorted Luxury Sphere (Hero Center) ─────────────────────────── */
const LuxurySphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.1;
    meshRef.current.rotation.x = t * 0.05 + pointer.y * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1.8, 128, 128]}>
        <MeshDistortMaterial
          color="#B8965A"
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={1}
          roughness={0.05}
          distort={0.35}
          speed={1.5}
        />
      </Sphere>
    </Float>
  );
};

/* ── Orbit Ring ─────────────────────────────────────────────────────── */
const OrbitRing = ({ radius, speed, tilt }: { radius: number; speed: number; tilt: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <Torus args={[radius, 0.008, 16, 200]}>
        <meshStandardMaterial color="#B8965A" metalness={1} roughness={0.1} envMapIntensity={2} />
      </Torus>
    </mesh>
  );
};

/* ── Floating Cubes ─────────────────────────────────────────────────── */
const FloatingCubes = () => {
  const cubes = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        pos: [
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8 - 4,
        ] as [number, number, number],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number,number,number],
        scale: 0.04 + Math.random() * 0.14,
        speed: 0.2 + Math.random() * 0.4,
      })),
    []
  );

  return (
    <>
      {cubes.map((c, i) => (
        <Shard key={i} position={c.pos} rotation={c.rot} scale={c.scale} speed={c.speed} color={i % 3 === 0 ? "#B8965A" : "#C9C3BA"} />
      ))}
    </>
  );
};

/* ── Main Hero3D Scene ──────────────────────────────────────────────── */
export const Hero3D = () => {
  return (
    <Canvas
      className="canvas-hero"
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      shadows
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <pointLight position={[-4, 3, 2]} intensity={1.5} color="#B8965A" />
      <pointLight position={[4, -3, -2]} intensity={0.8} color="#F8F5EF" />

      <LuxurySphere />
      <FloatingCubes />
      <OrbitRing radius={3}   speed={0.18} tilt={0.4}  />
      <OrbitRing radius={4.2} speed={-0.12} tilt={0.9} />
      <OrbitRing radius={2.2} speed={0.3}  tilt={1.2}  />

      <Environment preset="studio" />
    </Canvas>
  );
};
