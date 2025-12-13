import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { NeuralNode } from "../../types";
import { useAppStore } from "../../stores/useAppStore";
import { getThemeColor } from "../../utils/themeUtils";

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
 *
 * 참고: 떠다니는 애니메이션 제거됨 - 연결선과 위치 동기화 문제 방지
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
    theme,
    setIsDragging,
    updateNodePosition,
  } = useAppStore();

  const { camera, raycaster, pointer } = useThree();

  // 드래그 상태 관리
  const dragRef = useRef({
    active: false,
    dragging: false, // 실제 드래그 발생 여부 (threshold 통과 시 true)
    startPointer: new THREE.Vector2(), // 드래그 시작 시 포인터 위치
    plane: new THREE.Plane(),
    offset: new THREE.Vector3(),
  });

  const isActive = activeNode === node.id;
  const isHovered = hoveredNode === node.id;
  const isHighlighted = highlightedNodes.includes(node.id);

  const size = NODE_SIZES[node.type] || 0.5;

  // 테마에 따른 색상 변환 (라이트 모드에서는 더 진한 색상 사용)
  const rawColor = node.color || DEFAULT_COLORS[node.type] || "#ffffff";
  const color = useMemo(
    () => getThemeColor(rawColor, theme),
    [rawColor, theme]
  );

  // 메모이징된 지오메트리 및 머티리얼 (성능 최적화)
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const isDark = theme === "dark";

  const mainMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color, // 발광 색상
      emissiveIntensity: isDark ? 0.5 : 0.1, // 라이트 모드에서는 발광 최소화
      metalness: 0.3,
      roughness: 0.4,
    });
  }, [color, isDark]);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: isDark ? 0.15 : 0.1, // 라이트 모드에서도 글로우를 좀 더 보이게 (0.05 -> 0.1)
    });
  }, [color, isDark]);

  // 매 프레임 애니메이션 (호버/활성 효과만, 위치 이동 없음)
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
    // 기본 강도 설정
    const baseIntensity = isDark ? 0.5 : 0.2; // 라이트 모드 발광 약간 증가
    const hoverIntensity = isDark ? 1.2 : 0.4;
    const highlightIntensity = isDark ? 0.8 : 0.3;

    const targetIntensity =
      isHovered || isActive
        ? hoverIntensity
        : isHighlighted
        ? highlightIntensity
        : baseIntensity;

    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      targetIntensity,
      delta * 5
    );

    // 글로우 투명도 애니메이션
    const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
    // 기본 투명도 설정
    const baseOpacity = isDark ? 0.1 : 0.1; // 라이트 모드 투명도 증가
    const hoverOpacity = isDark ? 0.3 : 0.2;
    const highlightOpacity = isDark ? 0.2 : 0.15;

    const targetOpacity =
      isHovered || isActive
        ? hoverOpacity
        : isHighlighted
        ? highlightOpacity
        : baseOpacity;

    glowMat.opacity = THREE.MathUtils.lerp(
      glowMat.opacity,
      targetOpacity,
      delta * 5
    );

    // 참고: 떠다니는 애니메이션 제거됨
    // 연결선 끝점이 노드 중심과 항상 일치하도록 위치 고정
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
    // 드래그 중이었다면 클릭 이벤트 무시 (드래그 종료 시 active가 false로 되지만,
    // 여기서 거리 등을 체크할 수 있음. 하지만 간단히 드래그 직후 클릭 방지는
    // isDragging 상태나 별도 ref로 처리 가능. 현재는 드래그와 클릭을 구분해야 함.)

    // 만약 마우스가 거의 움직이지 않았다면 클릭으로 처리
    // 하지만 지금 구조에서는 active가 false가 된 직후에 click이 발생.
    // 일단 클릭 동작 수행. (드래그 시에도 클릭이 발생하는 부작용은 추후 개선)

    if (useAppStore.getState().isDragging) return;

    setActiveNode(node.id);
    setCameraTarget(position);
    // 카메라 애니메이션 후 모달 열기
    setTimeout(() => {
      setModalOpen(true);
    }, 1000);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    if (!meshRef.current || !meshRef.current.parent?.parent) return;

    // 드래그 시작 정보 저장
    dragRef.current.active = true;
    dragRef.current.dragging = false;
    dragRef.current.startPointer.copy(pointer);

    // 노드의 월드 좌표 구하기
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);

    // 드래그 평면 설정 (월드 좌표 기준)
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    dragRef.current.plane.setFromNormalAndCoplanarPoint(normal, worldPos);

    // 교차점 계산 (월드 좌표)
    const intersectPoint = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(dragRef.current.plane, intersectPoint);

    if (intersectPoint) {
      // 월드 교차점을 부모의 로컬 좌표로 변환
      const parent = meshRef.current.parent.parent;
      const intersectLocal = intersectPoint.clone();
      parent.worldToLocal(intersectLocal);

      // 오프셋 계산 (현재 로컬 위치 - 교차점 로컬 위치)
      dragRef.current.offset.subVectors(
        new THREE.Vector3(...position),
        intersectLocal
      );
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    if (dragRef.current.active) {
      dragRef.current.active = false;

      if (dragRef.current.dragging) {
        // 드래그가 발생했던 경우에만 isDragging 상태 해제 딜레이
        dragRef.current.dragging = false;
        setTimeout(() => setIsDragging(false), 50);
      } else {
        // 드래그 없이 클릭만 한 경우 즉시 상태 정리 (사실 여기서 isDragging은 false 상태임)
      }

      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current.active) return;
    e.stopPropagation();

    // 드래그 시작 여부 판단 (Threshold 체크)
    if (!dragRef.current.dragging) {
      const dist = pointer.distanceTo(dragRef.current.startPointer);
      if (dist > 0.01) {
        // Threshold: 0.01 (화면 비율 기준, 적절히 조정 가능)
        dragRef.current.dragging = true;
        setIsDragging(true); // 이 시점에서 글로벌 드래그 상태 활성화
      } else {
        return; // Threshold를 넘지 않으면 이동 처리 안 함
      }
    }

    if (!meshRef.current || !meshRef.current.parent?.parent) return;

    // 현재 포인터 위치에서 평면 교차점 다시 계산
    const intersectPoint = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(dragRef.current.plane, intersectPoint);

    if (intersectPoint) {
      // 월드 교차점을 부모의 로컬 좌표로 변환
      const parent = meshRef.current.parent.parent;
      const intersectLocal = intersectPoint.clone();
      parent.worldToLocal(intersectLocal);

      // 새 위치 = 로컬 교차점 + 오프셋
      const newPos = intersectLocal.add(dragRef.current.offset);
      updateNodePosition(node.id, [newPos.x, newPos.y, newPos.z]);
    }
  };

  // === 라벨용 DOM 드래그 핸들러 ===
  const handleLabelMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!meshRef.current || !meshRef.current.parent?.parent) return;

    // 드래그 시작 정보 저장
    dragRef.current.active = true;
    dragRef.current.dragging = false;
    dragRef.current.startPointer.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    // 노드의 월드 좌표 구하기
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);

    // 드래그 평면 설정 (월드 좌표 기준)
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    dragRef.current.plane.setFromNormalAndCoplanarPoint(normal, worldPos);

    // 교차점 계산 (월드 좌표)
    const currentPointer = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    const intersectPoint = new THREE.Vector3();
    raycaster.setFromCamera(currentPointer, camera);
    raycaster.ray.intersectPlane(dragRef.current.plane, intersectPoint);

    if (intersectPoint) {
      // 월드 교차점을 부모의 로컬 좌표로 변환
      const parent = meshRef.current.parent.parent;
      const intersectLocal = intersectPoint.clone();
      parent.worldToLocal(intersectLocal);

      // 오프셋 계산 (현재 로컬 위치 - 교차점 로컬 위치)
      dragRef.current.offset.subVectors(
        new THREE.Vector3(...position),
        intersectLocal
      );
    }

    // 글로벌 이벤트 리스너 등록
    window.addEventListener("mousemove", handleLabelMouseMove);
    window.addEventListener("mouseup", handleLabelMouseUp);
  };

  const handleLabelMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.active) return;
    e.preventDefault();

    const currentPointer = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    // 드래그 시작 여부 판단 (Threshold 체크)
    if (!dragRef.current.dragging) {
      const dist = currentPointer.distanceTo(dragRef.current.startPointer);
      if (dist > 0.01) {
        dragRef.current.dragging = true;
        setIsDragging(true);
      } else {
        return;
      }
    }

    if (!meshRef.current || !meshRef.current.parent?.parent) return;

    // 현재 포인터 위치에서 평면 교차점 다시 계산
    const intersectPoint = new THREE.Vector3();
    raycaster.setFromCamera(currentPointer, camera);
    raycaster.ray.intersectPlane(dragRef.current.plane, intersectPoint);

    if (intersectPoint) {
      // 월드 교차점을 부모의 로컬 좌표로 변환
      const parent = meshRef.current.parent.parent;
      const intersectLocal = intersectPoint.clone();
      parent.worldToLocal(intersectLocal);

      // 새 위치 = 로컬 교차점 + 오프셋
      const newPos = intersectLocal.add(dragRef.current.offset);
      updateNodePosition(node.id, [newPos.x, newPos.y, newPos.z]);
    }
  };

  const handleLabelMouseUp = () => {
    if (dragRef.current.active) {
      dragRef.current.active = false;

      if (dragRef.current.dragging) {
        dragRef.current.dragging = false;
        setTimeout(() => setIsDragging(false), 50);
      }
    }

    // 글로벌 이벤트 리스너 제거
    window.removeEventListener("mousemove", handleLabelMouseMove);
    window.removeEventListener("mouseup", handleLabelMouseUp);
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
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      />

      {/* 라벨 - 메인/프로젝트 노드 또는 호버 시에만 표시 */}
      {(node.type === "main" || node.type === "project" || isHovered) && (
        <Html
          position={[0, size + 0.5, 0]}
          center
          zIndexRange={[10, 0]}
          style={{
            userSelect: "none",
          }}
        >
          <div
            className={`
              px-3 py-1.5 rounded-full
              bg-black/60 backdrop-blur-sm
              border
              text-sm font-medium
              whitespace-nowrap
              transition-all duration-300
              cursor-pointer
              ${isHovered ? "scale-110" : ""}
            `}
            style={{
              borderColor: isHovered ? color : "rgba(255,255,255,0.2)",
              color: "#ffffff",
              textShadow: `0 0 10px ${color}`,
            }}
            onMouseEnter={handlePointerOver}
            onMouseLeave={handlePointerOut}
            onClick={handleClick}
            onMouseDown={handleLabelMouseDown}
          >
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}
