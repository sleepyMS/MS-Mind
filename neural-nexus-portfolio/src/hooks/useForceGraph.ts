import { useMemo, useEffect } from "react";
import type { NeuralNode } from "../types";
import { calculateGraphLayout, getLayoutTopology } from "../graph/layout";
import type { GraphNode } from "../graph/layout";
import { useAppStore } from "../stores/useAppStore";

/** 물리 계산의 결과만 React 수명과 위치 저장소에 연결한다. */
export function useForceGraph(nodes: readonly NeuralNode[]) {
  const setNodePositions = useAppStore((state) => state.setNodePositions);
  const topology = useMemo(() => getLayoutTopology(nodes), [nodes]);
  const positions = useMemo(() => {
    const graphNodes: GraphNode[] = JSON.parse(topology);
    return calculateGraphLayout(graphNodes);
  }, [topology]);

  useEffect(() => {
    setNodePositions(positions);
  }, [positions, setNodePositions]);

  return positions;
}
