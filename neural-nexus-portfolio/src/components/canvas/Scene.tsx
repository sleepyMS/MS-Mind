import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Node } from "./Node";
import { ConnectionLine } from "./ConnectionLine";
import { CameraManager } from "./CameraManager";
import { Background } from "./Background";
import { PostProcessing } from "./PostProcessing";
import { useForceGraph } from "../../hooks/useForceGraph";
import { useAppStore } from "../../stores/useAppStore";
import nodesData from "../../data/nodes.json";
import type { NeuralData } from "../../types";

/**
 * 메인 3D 씬 컴포넌트
 * 모든 뉴런 노드와 시냅스 라인을 렌더링하고 관리
 */
export function Scene() {
  const { highlightedNodes, isModalOpen } = useAppStore();

  // JSON 데이터를 타입화된 데이터로 변환
  const data = nodesData as NeuralData;
  const nodes = data.nodes;

  // 포스 시뮬레이션으로 유기적인 노드 위치 계산
  const positions = useForceGraph(nodes);

  // 연결선 데이터 생성
  const connections = useMemo(() => {
    const lines: {
      id: string;
      start: [number, number, number];
      end: [number, number, number];
      color: string;
      sourceId: string;
      targetId: string;
    }[] = [];
    const processed = new Set<string>();

    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const linkId = [node.id, targetId].sort().join("-");
        if (processed.has(linkId)) return;
        processed.add(linkId);

        const startPos = positions.get(node.id);
        const endPos = positions.get(targetId);

        if (startPos && endPos) {
          const targetNode = nodes.find((n) => n.id === targetId);
          // 연결된 노드들의 색상 혼합
          const color = node.color || targetNode?.color || "#00ffff";

          lines.push({
            id: linkId,
            start: startPos,
            end: endPos,
            color,
            sourceId: node.id,
            targetId,
          });
        }
      });
    });

    return lines;
  }, [nodes, positions]);

  return (
    <div
      className={`w-full h-screen ${
        isModalOpen ? "opacity-70" : ""
      } transition-opacity duration-500`}
    >
      <Canvas
        camera={{ position: [0, 5, 25], fov: 60 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{ background: "#000010" }}
      >
        {/* 조명 설정 */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#00ffff"
        />
        <pointLight position={[10, -10, 10]} intensity={0.5} color="#ff00ff" />

        {/* 배경 요소 (별, 파티클) */}
        <Background />

        {/* 뉴런 노드들 */}
        {nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;

          return <Node key={node.id} node={node} position={position} />;
        })}

        {/* 시냅스 연결선들 */}
        {connections.map((conn) => (
          <ConnectionLine
            key={conn.id}
            start={conn.start}
            end={conn.end}
            color={conn.color}
            isHighlighted={
              highlightedNodes.includes(conn.sourceId) &&
              highlightedNodes.includes(conn.targetId)
            }
          />
        ))}

        {/* 카메라 컨트롤 */}
        <CameraManager />

        {/* 후처리 효과 (Bloom) */}
        <PostProcessing />
      </Canvas>
    </div>
  );
}
