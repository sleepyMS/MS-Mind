import type { NeuralNode, NodeType, ProjectCategory } from "../types/index.ts";

type GraphViewNode = Pick<NeuralNode, "id" | "type" | "category" | "color" | "connections">;

export interface VisibleConnection {
  id: string;
  sourceId: string;
  targetId: string;
  color: string;
  isIndirect: boolean;
}

export interface VisibleGraph {
  nodeIds: ReadonlySet<string>;
  connections: readonly VisibleConnection[];
}

const connectionId = (source: string, target: string) => JSON.stringify([source, target].sort());

/** Filtering and hidden-path traversal depend on topology, never on dragged coordinates. */
export function getVisibleGraph(
  nodes: readonly GraphViewNode[],
  visibleNodeTypes: readonly NodeType[],
  visibleCategories: readonly ProjectCategory[],
): VisibleGraph {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const types = new Set(visibleNodeTypes);
  const categories = new Set(visibleCategories);
  const selectedProjects = new Set(nodes
    .filter((node) => node.type === "project" && node.category && categories.has(node.category))
    .map((node) => node.id));
  const nodeIds = new Set(nodes.filter((node) => {
    if (!types.has(node.type)) return false;
    if (node.type === "project") return selectedProjects.has(node.id);
    if (node.type === "skill") return node.connections.some((id) => selectedProjects.has(id));
    return true;
  }).map((node) => node.id));

  const connections: VisibleConnection[] = [];
  const connectedPairs = new Set<string>();
  const connect = (source: GraphViewNode, target: GraphViewNode, isIndirect: boolean) => {
    const id = connectionId(source.id, target.id);
    if (source.id === target.id || connectedPairs.has(id)) return;
    connectedPairs.add(id);
    connections.push({ id, sourceId: source.id, targetId: target.id, color: source.color || target.color || "#00ffff", isIndirect });
  };

  // Direct edges take precedence when a hidden path also reaches the same pair.
  for (const node of nodes) {
    if (!nodeIds.has(node.id)) continue;
    for (const targetId of node.connections) {
      const target = nodeById.get(targetId);
      if (target && nodeIds.has(targetId)) connect(node, target, false);
    }
  }

  for (const source of nodes) {
    if (!nodeIds.has(source.id)) continue;
    const visited = new Set([source.id]);
    const queue = [source];
    // A cursor avoids shifting the entire queue on every visit. Each hidden
    // node is visited once per source, even when several paths reach it.
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      for (const neighborId of current.connections) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);
        const neighbor = nodeById.get(neighborId);
        if (!neighbor) continue;
        if (nodeIds.has(neighborId)) {
          connect(source, neighbor, true);
        } else {
          queue.push(neighbor);
        }
      }
    }
  }

  return { nodeIds, connections };
}
