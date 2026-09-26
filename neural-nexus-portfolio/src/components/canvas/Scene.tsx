import { memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Canvas, useFrame } from "@react-three/fiber";
import { Node } from "./Node";
import { ConnectionLine } from "./ConnectionLine";
import { CameraManager } from "./CameraManager";
import { Background } from "./Background";
import { PostProcessing } from "./PostProcessing";
import { useForceGraph } from "../../hooks/useForceGraph";
import { useAppStore } from "../../stores/useAppStore";
import { getNodesData } from "../../data";
import * as THREE from "three";
import { getVisibleGraph } from "../../graph/visibility";
import { useReducedMotion } from "./useReducedMotion";

/** 씬 배경과 안개의 수명을 소유하고 테마 사이를 부드럽게 보간한다. */
function SceneColor({ isDark }: { isDark: boolean }) {
  const backgroundRef = useRef<THREE.Color>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const [initialTheme] = useState(isDark);
  const initialColor = initialTheme ? "#000010" : "#87ceeb";
  const targetColor = useMemo(
    () => new THREE.Color(isDark ? "#000010" : "#87ceeb"),
    [isDark]
  );
  const targetFogNear = isDark ? 50 : 500;
  const targetFogFar = isDark ? 250 : 1000;

  useFrame((_, delta) => {
    const lerpSpeed = delta * 2;
    backgroundRef.current?.lerp(targetColor, lerpSpeed);

    const fog = fogRef.current;
    if (fog) {
      fog.color.lerp(targetColor, lerpSpeed);
      fog.near += (targetFogNear - fog.near) * lerpSpeed;
      fog.far += (targetFogFar - fog.far) * lerpSpeed;
    }
  });

  return (
    <>
      <color ref={backgroundRef} attach="background" args={[initialColor]} />
      <fog
        ref={fogRef}
        attach="fog"
        args={[initialColor, initialTheme ? 50 : 500, initialTheme ? 250 : 1000]}
      />
    </>
  );
}

/**
 * 테마 전환 시 씬 전체를 회전시키는 래퍼 컴포넌트
 * 180도 회전하며 밤/낮이 바뀌는 효과 구현
 */
function SceneTransitionWrapper({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const sceneRotation = useAppStore((state) => state.sceneRotation);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (reducedMotion) {
      groupRef.current.rotation.y = sceneRotation;
      return;
    }

    // 현재 회전값에서 목표 회전값으로 부드럽게 이동 (댐핑)
    // delta * 2는 부드러운 가속/감속을 제공
    groupRef.current.rotation.y +=
      (sceneRotation - groupRef.current.rotation.y) * delta * 2;
  });

  return <group ref={groupRef}>{children}</group>;
}

/** Commits only after the scene's texture-dependent Suspense boundary is ready. */
function SceneReady() {
  const setLoading = useAppStore((state) => state.setLoading);
  useEffect(() => { setLoading(false); }, [setLoading]);
  return null;
}

/**
 * 메인 3D 씬 컴포넌트
 * 모든 뉴런 노드와 시냅스 라인을 렌더링하고 관리
 */
export const Scene = memo(function Scene() {
  const highlightedNodes = useAppStore((state) => state.highlightedNodes);
  const isModalOpen = useAppStore((state) => state.isModalOpen);
  const visibleNodeTypes = useAppStore((state) => state.visibleNodeTypes);
  const visibleCategories = useAppStore((state) => state.visibleCategories);
  const theme = useAppStore((state) => state.theme);
  const positions = useAppStore((state) => state.nodePositions);
  const isDark = theme === "dark";
  const { i18n } = useTranslation();
  const reducedMotion = useReducedMotion();

  // JSON 데이터를 타입화된 데이터로 변환 (언어별)
  const data = getNodesData(i18n.language);
  const nodes = data.nodes;

  // 포스 시뮬레이션으로 유기적인 노드 위치 계산 (초기화)
  useForceGraph(nodes);

  // Dragging changes coordinates only; filtering and hidden paths stay cached.
  const visibleGraph = useMemo(
    () => getVisibleGraph(nodes, visibleNodeTypes, visibleCategories),
    [nodes, visibleNodeTypes, visibleCategories],
  );
  const highlightedIds = useMemo(() => new Set(highlightedNodes), [highlightedNodes]);

  return (
    <div
      className={`w-full h-screen ${isModalOpen ? "opacity-70" : ""
        } transition-opacity duration-500`}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 5, 25], fov: 60 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          {/* Three.js 배경색 직접 설정 */}
          <SceneColor isDark={isDark} />

          {/* 조명 설정 - 테마별 밝기/색상 조정 */}
          <ambientLight intensity={isDark ? 0.3 : 1.0} />
          <pointLight
            position={[10, 10, 10]}
            intensity={isDark ? 0.8 : 1.5}
            color={isDark ? "#ffffff" : "#fffacd"}
          />
          <pointLight
            position={[-10, -10, -10]}
            intensity={isDark ? 0.5 : 0.4}
            color={isDark ? "#00ffff" : "#87ceeb"}
          />
          <pointLight
            position={[10, -10, 10]}
            intensity={isDark ? 0.5 : 0.4}
            color={isDark ? "#ff00ff" : "#ffa500"}
          />

          {/* 테마 전환 시 전체 씬 회전 */}
          <SceneTransitionWrapper reducedMotion={reducedMotion}>
            {/* 배경 요소 (별, 파티클) */}
            <Background reducedMotion={reducedMotion} />

            {/* 뉴런 노드들 - visibleNodeIds에 따라 표시/숨김 (타입 + 카테고리 필터) */}
            {nodes.map((node) => {
              const position = positions.get(node.id);
              if (!position) return null;

              // visibleNodeIds에 포함된 노드만 렌더링
              if (!visibleGraph.nodeIds.has(node.id)) return null;

              return <Node key={node.id} node={node} position={position} />;
            })}

            {/* 시냅스 연결선들 - 직접 + 간접 연결 */}
            {visibleGraph.connections.map((connection) => {
              const start = positions.get(connection.sourceId);
              const end = positions.get(connection.targetId);
              if (!start || !end) return null;
              return (
                <ConnectionLine
                  key={connection.id}
                  start={start}
                  end={end}
                  color={connection.color}
                  isHighlighted={highlightedIds.has(connection.sourceId) && highlightedIds.has(connection.targetId)}
                  isDashed={connection.isIndirect}
                  reducedMotion={reducedMotion}
                />
              );
            })}
          </SceneTransitionWrapper>

          {/* 카메라 컨트롤 */}
          <CameraManager reducedMotion={reducedMotion} />

          {/* 후처리 효과 (Bloom) */}
          <PostProcessing />
          <SceneReady />
        </Suspense>
      </Canvas>
    </div>
  );
});
