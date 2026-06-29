"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

// สร้างจุดสุ่มในวงกลมสำหรับอนุภาค
function generateRandomSpherePoints(count: number, radius: number) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * radius;
    const sinPhi = Math.sin(phi);
    
    const x = r * sinPhi * Math.cos(theta);
    const y = r * sinPhi * Math.sin(theta);
    const z = r * Math.cos(phi);

    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

function ParticleCloud() {
  const ref = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const sphere = useMemo(() => generateRandomSpherePoints(3000, 12), []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // ให้พาร์ทิเคิลหมุนช้าๆ ตลอดเวลา
    ref.current.rotation.x -= delta / 20;
    ref.current.rotation.y -= delta / 30;
    
    // โต้ตอบกับเมาส์ของผู้ใช้ (Micro-interaction)
    // ขยับโครงสร้างอนุภาคตามทิศทางเมาส์เล็กน้อย
    const targetX = (mouse.y * Math.PI) / 10;
    const targetY = (mouse.x * Math.PI) / 10;
    
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.05;
    ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.05;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#10b981" /* Vibrant Emerald Green */
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.NormalBlending}
          opacity={0.7}
        />
      </Points>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div 
      className="no-print"
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100vw", 
        height: "100vh", 
        zIndex: -1, 
        pointerEvents: "none",
        background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #ffffff 100%)",
        animation: "bgShift 15s ease infinite alternate"
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}} />
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ParticleCloud />
      </Canvas>
    </div>
  );
}
