import { cloneElement, useId, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "../../stores/useAppStore";

interface MiniTooltipProps {
  children: ReactElement<{ "aria-describedby"?: string }>;
  content: string;
  className?: string;
  disabled?: boolean;
}

/** 마우스와 키보드로 같은 설명을 제공하고 화면 안에 표시한다. */
export function MiniTooltip({ children, content, className = "inline-flex", disabled = false }: MiniTooltipProps) {
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === "dark";
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const isVisible = !disabled && (hovered || focused) && !dismissed;

  const updatePosition = (x: number, y: number) => {
    const width = Math.min(240, window.innerWidth - 24);
    setCoords({
      x: Math.max(12, Math.min(x + 12, window.innerWidth - width - 12)),
      y: Math.max(12, y + 64 > window.innerHeight ? y - 64 : y + 16),
    });
  };

  return (
    <>
      <div
        className={className}
        onMouseEnter={(event) => {
          updatePosition(event.clientX, event.clientY);
          setHovered(true);
          setDismissed(false);
        }}
        onMouseMove={(event) => updatePosition(event.clientX, event.clientY)}
        onMouseLeave={() => setHovered(false)}
        onFocus={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          updatePosition(bounds.left, bounds.bottom);
          setFocused(true);
          setDismissed(false);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isVisible) {
            setDismissed(true);
            event.stopPropagation();
          }
        }}
      >
        {cloneElement(children, {
          "aria-describedby": [children.props["aria-describedby"], isVisible ? id : undefined].filter(Boolean).join(" ") || undefined,
        })}
      </div>
      {isVisible && typeof document !== "undefined" && createPortal(
        <div
          id={id}
          role="tooltip"
          style={{
            position: "fixed", left: coords.x, top: coords.y, zIndex: 99999,
            maxWidth: "min(240px, calc(100vw - 24px))", padding: "6px 10px",
            fontSize: "12px", fontWeight: 500, borderRadius: "8px", pointerEvents: "none",
            background: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.98)",
            color: isDark ? "white" : "#1f2937", backdropFilter: "blur(8px)",
            border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >{content}</div>,
        document.body
      )}
    </>
  );
}
