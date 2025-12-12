import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * 배경 컴포넌트
 * 별과 떠다니는 파티클로 우주 분위기 연출
 */
export function Background() {
  const particlesRef = useRef<THREE.Points>(null);

  // 떠다니는 파티클 생성
  const particleGeometry = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 큰 구 형태로 파티클 분산
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // 시안과 마젠타 사이의 랜덤 색상
      const t = Math.random();
      colors[i * 3] = 0.0 + t * 1.0; // R: 0 -> 1
      colors[i * 3 + 1] = 1.0 - t * 0.5; // G: 1 -> 0.5
      colors[i * 3 + 2] = 1.0; // B: 항상 1
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geometry;
  }, []);

  // 느린 회전 애니메이션
  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.01;
      particlesRef.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <>
      {/* 정적 별밭 */}
      <Stars
        radius={200}
        depth={100}
        count={3000}
        factor={4}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* 떠다니는 파티클 */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.5}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 깊이감을 위한 안개 효과 */}
      <fog attach="fog" args={["#000010", 30, 150]} />
    </>
  );
}
