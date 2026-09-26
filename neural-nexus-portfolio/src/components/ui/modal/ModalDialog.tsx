import type { NeuralNode, ThemeType } from "../../../types";
import { getThemeColor } from "../../../utils/themeUtils";
import { ModalHeader } from "./ModalHeader";
import { ModalTabs } from "./ModalTabs";
import { ModalFooter } from "./ModalFooter";
import { NodeNavigation } from "./NodeNavigation";
import { useModalController } from "./useModalController";
import { useModalSwipe } from "./useModalSwipe";

interface ModalDialogProps {
  node: NeuralNode;
  nodes: readonly NeuralNode[];
  theme: ThemeType;
  language: string;
  onSelectNode: (nodeId: string) => void;
  onClosed: () => void;
}

export function ModalDialog({ node, nodes, theme, language, onSelectNode, onClosed }: ModalDialogProps) {
  const isDark = theme === "dark";
  const nodeColor = getThemeColor(node.color || "#00ffff", theme);
  const { activeTab, tabs, tabDirection, isVisible, isClosing, dialogRef, tabsRef, close, navigateToNode, navigateNode, changeTab } = useModalController({ node, nodes, language, onSelectNode, onClosed });
  const swipe = useModalSwipe({ nodeId: node.id, enabled: !isClosing, tabsRef: tabsRef, onNavigate: navigateNode });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" onClick={close}>
      <div
        className={`absolute inset-0 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{
          background: isDark
            ? `radial-gradient(ellipse at center, ${nodeColor}15 0%, transparent 50%), rgba(0,0,0,0.6)`
            : `radial-gradient(ellipse at center, ${nodeColor}10 0%, transparent 60%), rgba(255,255,255,0.4)`,
          backdropFilter: "blur(8px)",
        }}
      />
      <NodeNavigation direction={-1} isVisible={isVisible} isDark={isDark} nodeColor={nodeColor} onNavigate={navigateNode} />
      <NodeNavigation direction={1} isVisible={isVisible} isDark={isDark} nodeColor={nodeColor} onNavigate={navigateNode} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={node.label}
        tabIndex={-1}
        className={`relative max-h-[90vh] flex flex-col overflow-hidden rounded-3xl transition-all duration-500 ease-out outline-none ${node.type === "skill" || node.type === "lesson" ? "w-[90vw] md:w-[500px] max-w-lg" : "w-[90vw] md:w-[85vw] max-w-5xl"
          } ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
        onTouchCancel={swipe.onTouchCancel}
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
          backdropFilter: "blur(24px)",
          border: isDark ? `1px solid ${nodeColor}30` : "1px solid rgba(255,255,255,0.8)",
          boxShadow: isDark ? `0 0 60px ${nodeColor}20, 0 25px 50px -12px rgba(0,0,0,0.5)` : `0 10px 40px -10px rgba(0,0,0,0.1), 0 0 20px ${nodeColor}10`,
          transform: `translateX(${swipe.swipeOffset}px) rotate(${swipe.swipeOffset * 0.02}deg)`,
          transition: swipe.isAnimating ? "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" : "transform 0s",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4" style={{ background: `linear-gradient(90deg, transparent, ${nodeColor}, transparent)`, opacity: isDark ? 1 : 0.5 }} />
        <ModalHeader key={node.id} node={node} nodes={nodes} theme={theme} nodeColor={nodeColor} onNavigate={navigateToNode} onClose={close} />
        <ModalTabs tabs={tabs} activeTab={activeTab.id} isDark={isDark} nodeColor={nodeColor} tabsRef={tabsRef} onChange={changeTab} />
        <div className="relative px-6 pb-6 flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div
            key={`${node.id}:${activeTab.id}`}
            role="tabpanel"
            id={`modal-panel-${activeTab.id}`}
            aria-labelledby={`modal-tab-${activeTab.id}`}
            className={`transition-all duration-300 ${tabDirection === "right" ? "animate-slideFromRight" : "animate-slideFromLeft"}`}
          >
            {activeTab.render({ node, details: node.details, isDark, nodeColor, onNavigate: navigateToNode })}
          </div>
        </div>
        <ModalFooter isDark={isDark} />
      </div>
    </div>
  );
}
