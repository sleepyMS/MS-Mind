import assert from "node:assert/strict";
import { test } from "node:test";
import { getAdjacentNode, getNavigableNodes, searchNodes } from "../src/data/catalog.ts";
import type { NeuralNode } from "../src/types/index.ts";

const nodes: NeuralNode[] = [
  { id: "hidden", label: "Hidden", type: "hidden", connections: [] },
  { id: "backend", label: "A backend", type: "project", category: "backend", connections: [] },
  { id: "frontend", label: "Z frontend", type: "project", category: "frontend", connections: [], details: {
    description: "A design tool", technologies: ["Jev"], features: [{ title: "Workflow", items: ["Editing"] }],
  } },
  { id: "me", label: "Profile", type: "main", connections: [] },
];

test("키보드 순회는 사이드바 순서를 따르고 숨김 노드를 제외해 양방향 순환한다", () => {
  const originalOrder = nodes.map((node) => node.id);
  const order = getNavigableNodes(nodes, "en");
  assert.deepEqual(order.map((node) => node.id), ["me", "frontend", "backend"]);
  for (let index = 0; index < order.length; index++) {
    assert.equal(getAdjacentNode(nodes, order[index].id, 1, "en")?.id, order[(index + 1) % order.length].id);
    assert.equal(getAdjacentNode(nodes, order[index].id, -1, "en")?.id, order[(index - 1 + order.length) % order.length].id);
  }
  assert.deepEqual(nodes.map((node) => node.id), originalOrder);
  assert.equal(getAdjacentNode([], "missing", 1), undefined);
  assert.equal(getAdjacentNode(nodes, "hidden", 1, "en")?.id, "me");
});

test("검색은 사용 기술과 상세 기능을 포함하고 공백·대소문자를 정규화한다", () => {
  for (const query of ["  jEv ", "editing", "design tool"]) {
    assert.deepEqual(searchNodes(nodes, query, "en").map((node) => node.id), ["frontend"]);
  }
  assert.deepEqual(searchNodes(nodes, "  ", "en"), getNavigableNodes(nodes, "en"));
  assert.deepEqual(searchNodes(nodes, "hidden", "en"), []);
});
