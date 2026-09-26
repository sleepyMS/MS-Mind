import type { NeuralNode, NodeDetails } from "../../../types";

export type ModalTabId =
  | "profile"
  | "projects"
  | "research"
  | "description"
  | "features"
  | "optimizations"
  | "trouble"
  | "code"
  | "results"
  | "references"
  | "lesson"
  | "skills";

export interface DetailContentProps {
  details: NodeDetails | undefined;
  isDark: boolean;
  nodeColor: string;
}

export interface ProjectContentProps extends DetailContentProps {
  navigateToNode: (nodeId: string) => void;
}

export interface ModalContentContext extends DetailContentProps {
  node: NeuralNode;
  onNavigate: (nodeId: string) => void;
}
