import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../../stores/useAppStore";

/**
 * 배경 컴포넌트
 * 다크 모드: 별과 파티클로 우주 분위기
 * 라이트 모드: 밝은 하늘 + 구름 + 태양빛 파티클
 */
export function Background() {
  const { theme } = useAppStore();
  const isDark = theme === "dark";
  const particlesRef = useRef<THREE.Points>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  // 달 텍스처 로드 (로컬 이미지)
  const moonTexture = useTexture("/images/moon_texture.jpg");

  // 떠다니는 파티클 생성
  const particleGeometry = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 라이트 모드에서는 더 가까이 배치
      const radius = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // 초기 색상
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geometry;
  }, []);

  // 애니메이션
  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.01;
      particlesRef.current.rotation.x += delta * 0.005;

      // 테마에 따른 색상 변경
      const colors = particlesRef.current.geometry.attributes.color;
      const count = colors.count;

      for (let i = 0; i < count; i++) {
        const t = Math.random();
        if (isDark) {
          // 다크: 시안/마젠타 네온
          colors.setXYZ(i, 0.0 + t * 1.0, 1.0 - t * 0.5, 1.0);
        } else {
          // 라이트: 금색/태양빛 파티클
          colors.setXYZ(i, 1.0, 0.85 + t * 0.15, 0.3 + t * 0.4);
        }
      }
      colors.needsUpdate = true;
    }

    // 태양 천천히 회전
    if (sunRef.current) {
      sunRef.current.rotation.z += delta * 0.1;
    }
    // 달 천천히 회전
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      {/* 다크 모드: 별밭 + 달 */}
      {isDark && (
        <>
          <Stars
            radius={200}
            depth={100}
            count={3000}
            factor={4}
            saturation={0.5}
            fade
            speed={0.5}
          />
          {/* 달 */}
          <group position={[-60, 40, -150]}>
            {/* 달빛 광원 - 달 뒤쪽에서 비추기 */}
            <pointLight
              position={[0, 0, -20]}
              color="#b0c4de"
              intensity={30}
              distance={300}
              decay={2}
            />
            <mesh ref={moonRef} rotation={[0, 0, Math.PI / 8]}>
              <sphereGeometry args={[12, 64, 64]} />
              <meshStandardMaterial
                map={moonTexture}
                emissive="#aabbcc"
                emissiveIntensity={1.0}
                emissiveMap={moonTexture}
                roughness={0.95}
                metalness={0}
              />
            </mesh>
          </group>
        </>
      )}

      {/* 라이트 모드: 태양 */}
      {!isDark && (
        <group position={[60, 40, -150]}>
          {/* 태양빛 광원 - 따뜻한 노란 빛 */}
          <pointLight
            color="#fff5e0"
            intensity={100}
            distance={400}
            decay={2}
          />
          <mesh ref={sunRef}>
            <sphereGeometry args={[16, 32, 32]} />
            <meshBasicMaterial color="#ffd93d" />
            {/* 태양 글로우 */}
            <mesh>
              <sphereGeometry args={[24, 32, 32]} />
              <meshBasicMaterial color="#fff3b0" transparent opacity={0.3} />
            </mesh>
          </mesh>
        </group>
      )}

      {/* 떠다니는 파티클 */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={isDark ? 0.5 : 1.2}
          vertexColors
          transparent
          opacity={isDark ? 0.6 : 0.8}
          sizeAttenuation
          blending={isDark ? THREE.AdditiveBlending : THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
