import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateGraphLayout, getLayoutTopology } from "../src/graph/layout.ts";
import type { GraphNode } from "../src/graph/layout.ts";
import { getVisibleGraph } from "../src/graph/visibility.ts";
import type { NeuralNode } from "../src/types/index.ts";

test("시뮬레이션은 원본 노드·연결을 변경하지 않고 유효한 3D 좌표를 반환한다", () => {
  const nodes: readonly GraphNode[] = Object.freeze([
    Object.freeze({ id: "me", type: "main", connections: Object.freeze(["project"]) }),
    Object.freeze({ id: "project", type: "project", connections: Object.freeze(["me", "missing", "project"]) }),
  ]);
  const original = JSON.stringify(nodes);
  const positions = calculateGraphLayout(nodes);
  assert.equal(positions.size, 2);
  assert.deepEqual(positions.get("me"), [0, 0, 0]);
  for (const position of positions.values()) assert.ok(position.every(Number.isFinite));
  assert.equal(JSON.stringify(nodes), original);
  assert.equal(calculateGraphLayout([]).size, 0);
});

test("번역과 노드·연결 나열 순서 변경은 레이아웃을 초기화하지 않는다", () => {
  const korean = [
    { id: "a", type: "main" as const, label: "소개", connections: ["b", "c"] },
    { id: "b", type: "project" as const, label: "프로젝트", connections: ["a"] },
  ];
  const english = [
    { ...korean[1], label: "Project" },
    { ...korean[0], label: "Profile", connections: ["c", "b"] },
  ];
  assert.equal(getLayoutTopology(korean), getLayoutTopology(english));
  assert.notEqual(getLayoutTopology(korean), getLayoutTopology([{ ...korean[0], connections: [] }, korean[1]]));
});

test("카테고리 필터는 연결된 스킬만 남기고 프로젝트 타입 숨김과 독립적으로 동작한다", () => {
  const nodes: NeuralNode[] = [
    { id: "me", label: "Me", type: "main", connections: ["web", "model"] },
    { id: "web", label: "Web", type: "project", category: "frontend", connections: ["me", "react"] },
    { id: "model", label: "Model", type: "project", category: "ai-ml", connections: ["me", "python"] },
    { id: "react", label: "React", type: "skill", connections: ["web"] },
    { id: "python", label: "Python", type: "skill", connections: ["model"] },
    { id: "moon", label: "Moon", type: "hidden", connections: [] },
  ];
  const shown = getVisibleGraph(nodes, ["main", "project", "skill"], ["frontend"]);
  assert.deepEqual([...shown.nodeIds], ["me", "web", "react"]);
  assert.deepEqual(shown.connections.map((edge) => [edge.sourceId, edge.targetId, edge.isIndirect]), [
    ["me", "web", false], ["web", "react", false],
  ]);
  const projectsHidden = getVisibleGraph(nodes, ["main", "skill"], ["frontend"]);
  assert.deepEqual([...projectsHidden.nodeIds], ["me", "react"]);
  assert.deepEqual(projectsHidden.connections.map((edge) => [edge.sourceId, edge.targetId, edge.isIndirect]), [
    ["me", "react", true],
  ]);
});

test("간접 경로는 숨긴 노드만 통과하고 순환·누락·중복 경로가 직접 연결을 덮지 않는다", () => {
  const nodes: NeuralNode[] = [
    { id: "a", label: "A", type: "project", category: "frontend", color: "#123456", connections: ["hidden-x", "b", "missing"] },
    { id: "b", label: "B", type: "project", category: "frontend", connections: ["a", "hidden-x", "c"] },
    { id: "c", label: "C", type: "project", category: "frontend", connections: ["b"] },
    { id: "hidden-x", label: "X", type: "skill", connections: ["a", "b", "hidden-y"] },
    { id: "hidden-y", label: "Y", type: "skill", connections: ["hidden-x", "a", "d"] },
    { id: "d", label: "D", type: "project", category: "frontend", connections: ["hidden-y"] },
  ];
  const original = JSON.stringify(nodes);
  const graph = getVisibleGraph(nodes, ["project"], ["frontend"]);
  const pairs = graph.connections.map((edge) => [edge.sourceId, edge.targetId].sort().join("-"));
  assert.equal(new Set(pairs).size, pairs.length);
  assert.deepEqual(pairs, ["a-b", "b-c", "a-d", "b-d"]);
  assert.equal(graph.connections[0].isIndirect, false);
  assert.equal(graph.connections[2].isIndirect, true);
  assert.equal(graph.connections[2].color, "#123456");
  assert.equal(JSON.stringify(nodes), original);
  assert.deepEqual(getVisibleGraph([], ["main"], ["frontend"]).connections, []);
});
