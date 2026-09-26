import type { NeuralNode, NodeType, ProjectCategory, SkillCategory } from "../types/index.ts";

export const NODE_TYPE_ORDER: Exclude<NodeType, "hidden">[] = ["main", "project", "skill", "lesson"];
export const PROJECT_CATEGORY_ORDER: ProjectCategory[] = ["frontend", "backend", "ai-ml", "creative"];
export const SKILL_CATEGORY_ORDER: SkillCategory[] = ["language", "framework", "library", "tool", "database"];

/** 사이드바와 키보드 순회가 공유하는 탐색 순서. 숨김 노드는 직접 선택만 가능하다. */
export function getNavigableNodes(nodes: readonly NeuralNode[], language = "ko"): NeuralNode[] {
  return nodes.filter((node) => node.type !== "hidden").sort((left, right) => {
    const typeDifference = NODE_TYPE_ORDER.indexOf(left.type as Exclude<NodeType, "hidden">)
      - NODE_TYPE_ORDER.indexOf(right.type as Exclude<NodeType, "hidden">);
    if (typeDifference) return typeDifference;
    if (left.type === "project" && right.type === "project") {
      const difference = PROJECT_CATEGORY_ORDER.indexOf(left.category ?? "frontend")
        - PROJECT_CATEGORY_ORDER.indexOf(right.category ?? "frontend");
      if (difference) return difference;
    }
    if (left.type === "skill" && right.type === "skill") {
      const difference = SKILL_CATEGORY_ORDER.indexOf(left.skillCategory ?? "library")
        - SKILL_CATEGORY_ORDER.indexOf(right.skillCategory ?? "library");
      if (difference) return difference;
    }
    return left.label.localeCompare(right.label, language);
  });
}

export function getAdjacentNode(
  nodes: readonly NeuralNode[], activeNodeId: string, direction: -1 | 1, language = "ko",
): NeuralNode | undefined {
  const orderedNodes = getNavigableNodes(nodes, language);
  if (!orderedNodes.length) return undefined;
  const currentIndex = orderedNodes.findIndex((node) => node.id === activeNodeId);
  if (currentIndex < 0) return direction === 1 ? orderedNodes[0] : orderedNodes.at(-1);
  return orderedNodes[(currentIndex + direction + orderedNodes.length) % orderedNodes.length];
}

/** 프로젝트의 사용 기술과 상세 경험도 검색하며 입력 데이터는 변경하지 않는다. */
export function searchNodes(nodes: readonly NeuralNode[], query: string, language = "ko"): NeuralNode[] {
  const normalizedQuery = query.trim().toLocaleLowerCase(language);
  return getNavigableNodes(nodes, language).filter((node) => {
    const details = node.details;
    const searchableText = [
      node.label, details?.description, details?.extendedBio,
      details?.trouble, details?.shooting, details?.lesson,
      ...(details?.technologies ?? []), ...(details?.coreFeatures ?? []),
      ...(details?.features ?? []).flatMap((feature) => [feature.title, ...feature.items]),
      ...(details?.optimizations ?? []).flatMap((optimization) => [optimization.title, ...optimization.items]),
      ...(details?.challenges ?? []).flatMap((challenge) => [challenge.title, challenge.problem, challenge.solution]),
      ...(details?.learnings ?? []).flatMap((learning) => [learning.title, learning.content]),
    ].filter(Boolean).join("\n").toLocaleLowerCase(language);
    return searchableText.includes(normalizedQuery);
  });
}
