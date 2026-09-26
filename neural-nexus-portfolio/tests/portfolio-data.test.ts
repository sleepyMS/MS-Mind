import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { NeuralData } from "../src/types/index.ts";

function readData(language: string): NeuralData {
  return JSON.parse(readFileSync(new URL(`../src/data/nodes.${language}.json`, import.meta.url), "utf8"));
}

test("양 언어의 프로젝트·기술 연결과 주요 프로젝트 참조가 같은 노드를 가리킨다", () => {
  const korean = readData("ko");
  const english = readData("en");
  for (const { nodes } of [korean, english]) {
    const ids = new Set(nodes.map((node) => node.id));
    assert.equal(ids.size, nodes.length, "중복 ID는 연결 대상을 덮어쓴다");
    assert.equal(nodes.filter((node) => node.type === "main").length, 1);
    for (const node of nodes) {
      assert.ok(node.label.trim());
      for (const connection of node.connections) assert.ok(ids.has(connection), `${node.id} -> ${connection}`);
      for (const project of node.details?.keyProjects ?? []) {
        assert.equal(nodes.find((candidate) => candidate.id === project.id)?.type, "project", project.id);
      }
    }
  }
  const topology = ({ nodes }: NeuralData) => nodes.map((node) => ({
    id: node.id, type: node.type, category: node.category, skillCategory: node.skillCategory,
    connections: [...node.connections].sort(),
  })).sort((left, right) => left.id.localeCompare(right.id));
  assert.deepEqual(topology(korean), topology(english));
});
