import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { NeuralNode } from "../../types";
import { useAppStore } from "../../stores/useAppStore";

interface NodeProps {
  node: NeuralNode;
  position: [number, number, number];
}

// 노드 타입별 크기 설정
const NODE_SIZES: Record<string, number> = {
  main: 1.2, // 메인 노드 (나)
  project: 0.8, // 프로젝트 노드
  skill: 0.5, // 스킬 노드
  lesson: 0.3, // 교훈 노드
};

// 노드 타입별 기본 색상
const DEFAULT_COLORS: Record<string, string> = {
  main: "#00ffff", // 시안 (메인)
  project: "#ff00ff", // 마젠타 (프로젝트)
  skill: "#00ff88", // 민트 (스킬)
  lesson: "#ffff00", // 노랑 (교훈)
};

/**
 * 뉴런 노드 컴포넌트
 * 빛나는 구체로 프로젝트/스킬을 시각화
 */
export function Node({ node, position }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const {
    activeNode,
    hoveredNode,
    highlightedNodes,
    setHoveredNode,
    setHighlightedNodes,
    setActiveNode,
    setModalOpen,
    setCameraTarget,
  } = useAppStore();

  const isActive = activeNode === node.id;
  const isHovered = hoveredNode === node.id;
  const isHighlighted = highlightedNodes.includes(node.id);

  const size = NODE_SIZES[node.type] || 0.5;
  const color = node.color || DEFAULT_COLORS[node.type] || "#ffffff";

  // 메모이징된 지오메트리 및 머티리얼 (성능 최적화)
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);

  const mainMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color, // 발광 색상
      emissiveIntensity: 0.5, // 발광 강도
      metalness: 0.3,
      roughness: 0.4,
    });
  }, [color]);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.15,
    });
  }, [color]);

  // 매 프레임 애니메이션 (호버/활성 효과)
  useFrame((_, delta) => {
    if (!meshRef.current || !glowRef.current) return;

    // 상태에 따른 목표 크기
    const targetScale = isHovered || isActive ? size * 1.3 : size;
    const targetGlowScale = isHovered || isActive ? size * 2.5 : size * 1.8;

    // 부드러운 크기 전환
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 8
    );

    glowRef.current.scale.lerp(
      new THREE.Vector3(targetGlowScale, targetGlowScale, targetGlowScale),
      delta * 6
    );

    // 발광 강도 애니메이션
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetIntensity =
      isHovered || isActive ? 1.2 : isHighlighted ? 0.8 : 0.5;
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      targetIntensity,
      delta * 5
    );

    // 글로우 투명도 애니메이션
    const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
    const targetOpacity =
      isHovered || isActive ? 0.3 : isHighlighted ? 0.2 : 0.1;
    glowMat.opacity = THREE.MathUtils.lerp(
      glowMat.opacity,
      targetOpacity,
      delta * 5
    );

    // 부드러운 떠다니는 애니메이션
    meshRef.current.position.y =
      position[1] + Math.sin(Date.now() * 0.001 + position[0]) * 0.05;
    glowRef.current.position.y = meshRef.current.position.y;
  });

  const handlePointerOver = () => {
    setHoveredNode(node.id);
    // 연결된 노드들 하이라이트
    setHighlightedNodes([node.id, ...node.connections]);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHoveredNode(null);
    setHighlightedNodes([]);
    document.body.style.cursor = "auto";
  };

  const handleClick = () => {
    setActiveNode(node.id);
    setCameraTarget(position);
    // 카메라 애니메이션 후 모달 열기
    setTimeout(() => {
      setModalOpen(true);
    }, 1000);
  };

  return (
    <group position={position}>
      {/* 글로우 구체 (크고 투명) */}
      <mesh
        ref={glowRef}
        geometry={geometry}
        material={glowMaterial}
        scale={size * 1.8}
      />

      {/* 메인 구체 */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={mainMaterial}
        scale={size}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {/* 라벨 - 메인/프로젝트 노드 또는 호버 시에만 표시 */}
      {(node.type === "main" || node.type === "project" || isHovered) && (
        <Html
          position={[0, size + 0.5, 0]}
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            className={`
              px-3 py-1.5 rounded-full
              bg-black/60 backdrop-blur-sm
              border border-white/20
              text-white text-sm font-medium
              whitespace-nowrap
              transition-all duration-300
              ${isHovered ? "scale-110 border-cyan-400/50" : ""}
            `}
            style={{
              textShadow: `0 0 10px ${color}`,
            }}
          >
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}
