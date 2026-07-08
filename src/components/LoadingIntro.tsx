import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

const PulseSphere = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.3;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });
  return (
    <Sphere ref={ref} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#B8965A"
        metalness={1}
        roughness={0.05}
        distort={0.4}
        speed={2}
        envMapIntensity={2}
      />
    </Sphere>
  );
};

const LoadingIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2800);
    const t2 = setTimeout(onComplete, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#0A0905" }}
        >
          {/* 3D Liquid Sphere */}
          <div className="w-36 h-36 mb-10">
            <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[3, 3, 3]} intensity={2.5} color="#B8965A" />
              <Suspense fallback={null}>
                <PulseSphere />
                <Environment preset="studio" />
              </Suspense>
            </Canvas>
          </div>

          {/* Brand name */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0, 0, 1] }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                fontWeight: 300,
                letterSpacing: "-0.03em",
                color: "#F8F5EF",
                lineHeight: 1,
              }}
            >
              The Style Yard
            </motion.h1>
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.55rem",
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#B8965A",
            }}
          >
            Premium Fashion · Lagos
          </motion.span>

          {/* Thin gold progress line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 2.2, delay: 0.3, ease: "linear" }}
            style={{ height: 1, background: "#B8965A", marginTop: "2.5rem", opacity: 0.6 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingIntro;