import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAdjacentNode } from "../../../data/catalog";
import type { NeuralNode } from "../../../types";
import { getAvailableTabs } from "./tabRegistry";
import type { ModalTabId } from "./types";

interface ModalControllerOptions {
  node: NeuralNode;
  nodes: readonly NeuralNode[];
  language: string;
  onSelectNode: (nodeId: string) => void;
  onClosed: () => void;
}

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Owns one open dialog session; renderers receive callbacks, never the store. */
export function useModalController({ node, nodes, language, onSelectNode, onClosed }: ModalControllerOptions) {
  const [entered, setEntered] = useState(false);
  const [closingNodeId, setClosingNodeId] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ nodeId: string; tab: ModalTabId; direction: "left" | "right" } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabs = useMemo(() => getAvailableTabs(node), [node]);
  const activeTab = (selection?.nodeId === node.id && tabs.find((tab) => tab.id === selection.tab)) || tabs[0];
  const isClosing = closingNodeId === node.id;

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);


  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.focus({ preventScroll: true });
    let nextFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (nextFrame !== undefined) cancelAnimationFrame(nextFrame);
      if ((previousFocus instanceof HTMLElement || previousFocus instanceof SVGElement) && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  // Navigation can remove the focused project card or connection-menu item.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus({ preventScroll: true });
    return cancelClose;
  }, [node.id, cancelClose]);


  const close = useCallback(() => {
    cancelClose();
    setClosingNodeId(node.id);
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      onClosed();
    }, 300);
  }, [cancelClose, node.id, onClosed]);

  const navigateToNode = useCallback((nodeId: string) => {
    if (!nodes.some((candidate) => candidate.id === nodeId)) return;
    cancelClose();
    setClosingNodeId(null);
    setSelection(null);
    onSelectNode(nodeId);
  }, [nodes, cancelClose, onSelectNode]);

  const navigateNode = useCallback((direction: -1 | 1) => {
    const target = getAdjacentNode(nodes, node.id, direction, language);
    if (target) navigateToNode(target.id);
  }, [nodes, node.id, language, navigateToNode]);

  const changeTab = (tabId: ModalTabId) => {
    const nextIndex = tabs.findIndex((tab) => tab.id === tabId);
    if (nextIndex === -1) return;
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.id);
    setSelection({ nodeId: node.id, tab: tabId, direction: nextIndex > currentIndex ? "right" : "left" });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)].filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) {
          event.preventDefault();
          dialog.focus();
        } else if (!dialog.contains(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      const target = event.target;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"], [role="tablist"]')))) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        navigateNode(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, navigateNode]);

  return {
    activeTab,
    tabs,
    tabDirection: selection?.nodeId === node.id ? selection.direction : "right",
    isVisible: entered && !isClosing,
    isClosing,
    dialogRef,
    tabsRef,
    close,
    navigateToNode,
    navigateNode,
    changeTab,
  };
}
