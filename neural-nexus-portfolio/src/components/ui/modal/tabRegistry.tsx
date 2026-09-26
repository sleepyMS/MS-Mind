import type { ReactNode } from "react";
import type { NeuralNode } from "../../../types";
import type { ModalContentContext, ModalTabId } from "./types";
import { ProfileContent } from "./contents/ProfileContent";
import { ProjectsContent } from "./contents/ProjectsContent";
import { ResearchContent } from "./contents/ResearchContent";
import { DescriptionContent } from "./contents/DescriptionContent";
import { FeaturesContent } from "./contents/FeaturesContent";
import { OptimizationsContent } from "./contents/OptimizationsContent";
import { TroubleContent } from "./contents/TroubleContent";
import { CodeContent } from "./contents/CodeContent";
import { ResultsContent } from "./contents/ResultsContent";
import { ReferencesContent } from "./contents/ReferencesContent";
import { LessonContent } from "./contents/LessonContent";
import { SkillsContent } from "./contents/SkillsContent";

export interface ModalTabDefinition {
  id: ModalTabId;
  labelKey: string;
  icon: string;
  isAvailable: (node: NeuralNode) => boolean;
  render: (context: ModalContentContext) => ReactNode;
}

// Availability, order, labels and rendering share one definition per tab.
const modalTabs: readonly ModalTabDefinition[] = [
  {
    id: "profile",
    labelKey: "modal.tabs.profile",
    icon: "👤",
    isAvailable: (node) => node.type === "main",
    render: ({ details, isDark, nodeColor }) => (
      <ProfileContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "projects",
    labelKey: "modal.tabs.projects",
    icon: "⭐",
    isAvailable: (node) => node.type === "main" && Boolean(node.details?.keyProjects?.length),
    render: ({ details, isDark, nodeColor, onNavigate }) => (
      <ProjectsContent details={details} isDark={isDark} nodeColor={nodeColor} navigateToNode={onNavigate} />
    ),
  },
  {
    id: "research",
    labelKey: "modal.tabs.research",
    icon: "🔬",
    isAvailable: (node) => node.type === "main" && Boolean(node.details?.researchInterests?.length),
    render: ({ details, isDark, nodeColor }) => (
      <ResearchContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "description",
    labelKey: "modal.tabs.description",
    icon: "📝",
    isAvailable: (node) => node.type !== "main",
    render: ({ details, isDark, nodeColor }) => (
      <DescriptionContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "features",
    labelKey: "modal.tabs.features",
    icon: "🚀",
    isAvailable: (node) => node.type !== "main" && Boolean(node.details?.features?.length),
    render: ({ details, isDark, nodeColor }) => (
      <FeaturesContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "optimizations",
    labelKey: "modal.tabs.optimizations",
    icon: "⚡",
    isAvailable: (node) => Boolean(node.details?.optimizations?.length),
    render: ({ details, isDark, nodeColor }) => (
      <OptimizationsContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "trouble",
    labelKey: "modal.tabs.trouble",
    icon: "🔧",
    isAvailable: (node) => Boolean(node.details?.trouble || node.details?.shooting || node.details?.challenges?.length),
    render: ({ details, isDark, nodeColor }) => (
      <TroubleContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "code",
    labelKey: "modal.tabs.code",
    icon: "💻",
    isAvailable: (node) => Boolean(node.details?.codeExamples?.length),
    render: ({ details, isDark, nodeColor }) => (
      <CodeContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "results",
    labelKey: "modal.tabs.results",
    icon: "📊",
    isAvailable: (node) => Boolean(node.details?.performance?.length),
    render: ({ details, isDark, nodeColor }) => (
      <ResultsContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "references",
    labelKey: "modal.tabs.references",
    icon: "📚",
    isAvailable: (node) => Boolean(node.details?.references?.length),
    render: ({ details, isDark, nodeColor }) => (
      <ReferencesContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "lesson",
    labelKey: "modal.tabs.lesson",
    icon: "💡",
    isAvailable: (node) => node.type !== "main" && Boolean(node.details?.lesson || node.details?.learnings?.length),
    render: ({ details, isDark, nodeColor }) => (
      <LessonContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
  {
    id: "skills",
    labelKey: "modal.tabs.skills",
    icon: "🛠️",
    isAvailable: (node) => node.type !== "main" && Boolean(node.details?.skills?.length),
    render: ({ details, isDark, nodeColor }) => (
      <SkillsContent details={details} isDark={isDark} nodeColor={nodeColor} />
    ),
  },
];

export function getAvailableTabs(node: NeuralNode): ModalTabDefinition[] {
  return modalTabs.filter((tab) => tab.isAvailable(node));
}
