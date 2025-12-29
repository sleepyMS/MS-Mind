import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../../stores/useAppStore";
import { getNodesData } from "../../data";
import { useTranslation } from "react-i18next";

/**
 * 달 전용 이스터에그 노드 컴포넌트
 * Background.tsx의 달 위치에 렌더링됨
 */
export function MoonNode() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { setActiveNode, setModalOpen, setCameraTarget, activeNode } =
    useAppStore();

  const { i18n } = useTranslation();

  // hidden-moon 데이터 가져오기
  const node = useMemo(() => {
    const data = getNodesData(i18n.language);
    return data.nodes.find((n) => n.id === "hidden-moon");
  }, [i18n.language]);

  const isActive = activeNode === "hidden-moon";
  const size = 1.5;
  const color = "#ffff00"; // 달과 어울리는 노란색/금색

  // 매 프레임 애니메이션 (크기 보간)
  useFrame((_, delta) => {
    if (!meshRef.current || !glowRef.current) return;

    const targetScale = isHovered || isActive ? size * 1.5 : size;
    const targetGlowScale = isHovered || isActive ? size * 2.0 : size * 1.4;

    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 8
    );

    glowRef.current.scale.lerp(
      new THREE.Vector3(targetGlowScale, targetGlowScale, targetGlowScale),
      delta * 6
    );

    // 발광 효과
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      isHovered || isActive ? 1.0 : 0.4,
      delta * 5
    );
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!node) return;

    // 월드 좌표 계산 (달은 움직이므로 클릭 시점의 좌표 필요)
    const worldPos = new THREE.Vector3();
    meshRef.current?.getWorldPosition(worldPos);

    setActiveNode(node.id);
    setCameraTarget([worldPos.x, worldPos.y, worldPos.z]);

    // 모달 지연 오픈
    setTimeout(() => {
      setModalOpen(true);
    }, 500);
  };

  if (!node) return null;

  return (
    <group>
      {/* 투명한 히트박스 (클릭하기 쉽게 더 크게) */}
      <mesh
        visible={false}
        onClick={handleClick}
        onPointerOver={() => {
          setIsHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[size * 2, 16, 16]} />
      </mesh>

      {/* 내부 구체 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 외부 글로우 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* 라벨 (호버 시에만) */}
      {isHovered && (
        <Html position={[0, size + 1, 0]} center>
          <div className="px-2 py-1 bg-black/80 text-white text-xs rounded border border-yellow-500/50 whitespace-nowrap">
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}
