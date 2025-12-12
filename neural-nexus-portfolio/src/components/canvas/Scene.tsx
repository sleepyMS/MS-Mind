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

interface ConnectionData {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  sourceId: string;
  targetId: string;
  isIndirect?: boolean; // 간접 연결 여부
}

/**
 * 메인 3D 씬 컴포넌트
 * 모든 뉴런 노드와 시냅스 라인을 렌더링하고 관리
 */
export function Scene() {
  const { highlightedNodes, isModalOpen, visibleNodeTypes } = useAppStore();

  // JSON 데이터를 타입화된 데이터로 변환
  const data = nodesData as NeuralData;
  const nodes = data.nodes;

  // 포스 시뮬레이션으로 유기적인 노드 위치 계산
  const positions = useForceGraph(nodes);

  // 모든 연결선 데이터 생성 (직접 연결)
  const allConnections = useMemo(() => {
    const lines: ConnectionData[] = [];
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
          const color = node.color || targetNode?.color || "#00ffff";

          lines.push({
            id: linkId,
            start: startPos,
            end: endPos,
            color,
            sourceId: node.id,
            targetId,
            isIndirect: false,
          });
        }
      });
    });

    return lines;
  }, [nodes, positions]);

  // visible 노드 ID 집합
  const visibleNodeIds = useMemo(() => {
    return new Set(
      nodes.filter((n) => visibleNodeTypes.includes(n.type)).map((n) => n.id)
    );
  }, [nodes, visibleNodeTypes]);

  // 간접 연결 계산: 숨겨진 노드를 통해 연결된 visible 노드들을 찾아 연결
  const indirectConnections = useMemo(() => {
    const indirect: ConnectionData[] = [];
    const processed = new Set<string>();

    // BFS로 visible 노드에서 다른 visible 노드까지의 경로 찾기
    const findConnectedVisibleNodes = (
      startId: string,
      visited: Set<string>
    ): string[] => {
      const result: string[] = [];
      const queue = [startId];
      visited.add(startId);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentNode = nodes.find((n) => n.id === currentId);
        if (!currentNode) continue;

        for (const neighborId of currentNode.connections) {
          if (visited.has(neighborId)) continue;
          visited.add(neighborId);

          if (visibleNodeIds.has(neighborId)) {
            // visible 노드에 도달
            result.push(neighborId);
          } else {
            // 숨겨진 노드를 통해 계속 탐색
            queue.push(neighborId);
          }
        }
      }

      return result;
    };

    // 각 visible 노드에서 간접 연결 찾기
    nodes.forEach((node) => {
      if (!visibleNodeIds.has(node.id)) return;

      const visited = new Set<string>();
      // 직접 연결된 visible 노드 제외
      node.connections.forEach((directId) => {
        if (visibleNodeIds.has(directId)) {
          visited.add(directId);
        }
      });
      visited.add(node.id);

      // 숨겨진 노드들만 시작점으로
      node.connections.forEach((neighborId) => {
        if (!visibleNodeIds.has(neighborId) && !visited.has(neighborId)) {
          const connectedVisible = findConnectedVisibleNodes(
            neighborId,
            new Set(visited)
          );

          connectedVisible.forEach((targetId) => {
            const linkId = [node.id, targetId].sort().join("-indirect");
            if (processed.has(linkId)) return;
            processed.add(linkId);

            const startPos = positions.get(node.id);
            const endPos = positions.get(targetId);

            if (startPos && endPos) {
              const targetNode = nodes.find((n) => n.id === targetId);
              const color = node.color || targetNode?.color || "#00ffff";

              indirect.push({
                id: linkId,
                start: startPos,
                end: endPos,
                color,
                sourceId: node.id,
                targetId,
                isIndirect: true,
              });
            }
          });
        }
      });
    });

    return indirect;
  }, [nodes, positions, visibleNodeIds]);

  // 직접 연결선 필터링 (양쪽 노드 모두 visible일 때만)
  const directConnections = useMemo(() => {
    return allConnections.filter((conn) => {
      return (
        visibleNodeIds.has(conn.sourceId) && visibleNodeIds.has(conn.targetId)
      );
    });
  }, [allConnections, visibleNodeIds]);

  // 최종 연결선: 직접 + 간접
  const finalConnections = useMemo(() => {
    return [...directConnections, ...indirectConnections];
  }, [directConnections, indirectConnections]);

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

        {/* 뉴런 노드들 - visibleNodeTypes에 따라 표시/숨김 */}
        {nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;

          const isVisible = visibleNodeTypes.includes(node.type);
          if (!isVisible) return null;

          return <Node key={node.id} node={node} position={position} />;
        })}

        {/* 시냅스 연결선들 - 직접 + 간접 연결 */}
        {finalConnections.map((conn) => (
          <ConnectionLine
            key={conn.id}
            start={conn.start}
            end={conn.end}
            color={conn.color}
            isHighlighted={
              highlightedNodes.includes(conn.sourceId) &&
              highlightedNodes.includes(conn.targetId)
            }
            isDashed={conn.isIndirect}
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
