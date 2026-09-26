import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { ModalTabDefinition } from "./tabRegistry";
import type { ModalTabId } from "./types";

interface ModalTabsProps {
  tabs: readonly ModalTabDefinition[];
  activeTab: ModalTabId;
  isDark: boolean;
  nodeColor: string;
  tabsRef: RefObject<HTMLDivElement | null>;
  onChange: (tab: ModalTabId) => void;
}

export function ModalTabs({ tabs, activeTab, isDark, nodeColor, tabsRef, onChange }: ModalTabsProps) {
  const { t } = useTranslation();
  return (<div className="px-6 pb-4">
    <div
      ref={tabsRef}
      role="tablist"
      className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-none"
      style={{
        background: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.03)",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`modal-tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`modal-panel-${tab.id}`}
            aria-label={t(tab.labelKey)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              const index = tabs.findIndex((entry) => entry.id === tab.id);
              let nextIndex = index;
              if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
              else if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
              else if (event.key === "Home") nextIndex = 0;
              else if (event.key === "End") nextIndex = tabs.length - 1;
              else return;
              event.preventDefault();
              onChange(tabs[nextIndex].id);
              tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
            }}
            className={`
                      relative shrink-0 flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-300 cursor-pointer
                      ${!isActive ? "hover:bg-white/10 active:scale-95" : ""}
                    `}
            style={{
              color: isActive
                ? isDark
                  ? "white"
                  : "#1f2937"
                : isDark
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(0,0,0,0.5)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = isDark
                  ? "white"
                  : "#1f2937";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              // 항상 transform 초기화 (active 상태 변경 시에도)
              e.currentTarget.style.transform = "translateY(0)";
              if (!isActive) {
                e.currentTarget.style.color = isDark
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(0,0,0,0.5)";
              }
            }}
          >
            {isActive && (
              <div
                className="absolute inset-0 rounded-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${nodeColor}30, ${nodeColor}15)`,
                  border: `1px solid ${nodeColor}40`,
                  boxShadow: `0 0 15px ${nodeColor}20`,
                }}
              />
            )}
            <span className="relative z-10 transition-transform duration-200">
              {tab.icon}
            </span>
            <span className="relative z-10 hidden sm:inline">
              {t(tab.labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  </div>

  );
}
