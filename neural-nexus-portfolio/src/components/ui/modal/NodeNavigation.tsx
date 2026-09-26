import { useTranslation } from "react-i18next";
import { MiniTooltip } from "../MiniTooltip";

interface NodeNavigationProps {
  direction: -1 | 1;
  isVisible: boolean;
  isDark: boolean;
  nodeColor: string;
  onNavigate: (direction: -1 | 1) => void;
}

export function NodeNavigation({ direction, isVisible, isDark, nodeColor, onNavigate }: NodeNavigationProps) {
  const { t } = useTranslation();
  const isPrevious = direction === -1;
  return (
    <div className="hidden md:block">
      <MiniTooltip content={t(isPrevious ? "modal.navigation.prevNode" : "modal.navigation.nextNode")}>
        <button
          onClick={(event) => { event.stopPropagation(); onNavigate(direction); }}
          className={`absolute top-1/2 -translate-y-1/2 z-10 p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${isPrevious
            ? "left-[calc(50%-min(45vw,42.5rem+2rem)-3rem)] md:left-[calc(50%-min(42.5vw,42.5rem+2.5rem)-3.5rem)]"
            : "right-[calc(50%-min(45vw,42.5rem+2rem)-3rem)] md:right-[calc(50%-min(42.5vw,42.5rem+2.5rem)-3.5rem)]"
            } ${isVisible ? "opacity-100 translate-x-0" : isPrevious ? "opacity-0 -translate-x-4" : "opacity-0 translate-x-4"}`}
          style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", backdropFilter: "blur(8px)", border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)" }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = `${nodeColor}40`;
            event.currentTarget.style.borderColor = nodeColor;
            event.currentTarget.style.boxShadow = `0 0 20px ${nodeColor}40`;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
            event.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
            event.currentTarget.style.boxShadow = "none";
          }}
          aria-label={t(isPrevious ? "modal.aria.prevNode" : "modal.aria.nextNode")}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" style={{ color: isDark ? "white" : "#1f2937" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isPrevious ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </MiniTooltip>
    </div>
  );
}
