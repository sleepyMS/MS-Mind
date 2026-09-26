import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getNodesData } from "../../data";
import { useAppStore } from "../../stores/useAppStore";
import { ModalDialog } from "./modal/ModalDialog";

/** Connects the detail dialog to application state and localized data. */
export function Modal() {
  const { i18n } = useTranslation();
  const isModalOpen = useAppStore((state) => state.isModalOpen);
  const activeNode = useAppStore((state) => state.activeNode);
  const theme = useAppStore((state) => state.theme);
  const nodePositions = useAppStore((state) => state.nodePositions);
  const setModalOpen = useAppStore((state) => state.setModalOpen);
  const setActiveNode = useAppStore((state) => state.setActiveNode);
  const setCameraTarget = useAppStore((state) => state.setCameraTarget);
  const data = getNodesData(i18n.language);
  const node = data.nodes.find((candidate) => candidate.id === activeNode);

  const selectNode = useCallback((nodeId: string) => {
    setActiveNode(nodeId);
    setCameraTarget(nodePositions.get(nodeId) ?? null);
  }, [nodePositions, setActiveNode, setCameraTarget]);

  const close = useCallback(() => {
    setModalOpen(false);
    setActiveNode(null);
    setCameraTarget(null);
  }, [setModalOpen, setActiveNode, setCameraTarget]);

  if (!isModalOpen || !node) return null;
  return <ModalDialog node={node} nodes={data.nodes} theme={theme} language={i18n.language} onSelectNode={selectNode} onClosed={close} />;
}
