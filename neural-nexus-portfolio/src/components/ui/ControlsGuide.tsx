import { useState, useEffect, useId, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";

const touchQuery = "(max-width: 767px), (pointer: coarse)";
const getTouchMode = () => window.matchMedia(touchQuery).matches;
const getServerTouchMode = () => false;
const subscribeTouchMode = (notify: () => void) => {
  const query = window.matchMedia(touchQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

/**
 * 여닫을 수 있는 컨트롤 가이드 패널
 * 데스크톱/모바일 조작 방법 안내
 */
export function ControlsGuide() {
  const theme = useAppStore((state) => state.theme);
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const [userOpen, setIsOpen] = useState<boolean | null>(null);
  const isMobile = useSyncExternalStore(subscribeTouchMode, getTouchMode, getServerTouchMode);
  const isOpen = userOpen ?? !isMobile;
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 모바일에서 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobile &&
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.defaultPrevented || useAppStore.getState().isModalOpen) return;
      if (event.key === "Escape") {
        setIsOpen(false);
        if (panelRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const desktopControls = [
    {
      icon: "🖱️",
      action: t("controls.desktop.leftDrag"),
      description: t("controls.desktop.rotate"),
    },
    {
      icon: "🖱️",
      action: t("controls.desktop.rightDrag"),
      description: t("controls.desktop.pan"),
    },
    {
      icon: "🔄",
      action: t("controls.desktop.scroll"),
      description: t("controls.desktop.zoom"),
    },
    {
      icon: "⚡",
      action: t("controls.desktop.wheelDrag"),
      description: t("controls.desktop.fastZoom"),
    },
    {
      icon: "👆",
      action: t("controls.desktop.click"),
      description: t("controls.desktop.details"),
    },
  ];

  const mobileControls = [
    {
      icon: "☝️",
      action: t("controls.mobile.oneFinger"),
      description: t("controls.mobile.rotate"),
    },
    {
      icon: "✌️",
      action: t("controls.mobile.twoFinger"),
      description: t("controls.mobile.pan"),
    },
    {
      icon: "🤏",
      action: t("controls.mobile.pinch"),
      description: t("controls.mobile.zoom"),
    },
    {
      icon: "👆",
      action: t("controls.mobile.tap"),
      description: t("controls.mobile.details"),
    },
  ];

  const controls = isMobile ? mobileControls : desktopControls;

  return (
    <>
      {/* 토글 버튼 */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 md:bottom-auto md:top-1/2 md:right-4 md:-translate-y-1/2
          z-40 w-10 h-10 rounded-full flex items-center justify-center
          transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95
          ${isOpen ? "rotate-180" : ""}
        `}
        style={{
          background: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(0,0,0,0.1)",
          boxShadow: isDark
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 4px 20px rgba(0,0,0,0.1)",
        }}
        aria-label={t("controls.aria.guide")}
      >
        <svg
          className="w-5 h-5"
          style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#4b5563" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* 가이드 패널 */}
      <div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-label={t("controls.aria.guide")}
        aria-hidden={!isOpen}
        inert={!isOpen}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
        className={`
          fixed z-30 transition-all duration-300 ease-out
          bottom-20 right-6 md:bottom-auto md:top-1/2 md:right-16 md:-translate-y-1/2
          ${
            isOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }
        `}
      >
        <div
          className="p-4 rounded-2xl min-w-[200px]"
          style={{
            background: isDark
              ? "rgba(10,10,25,0.95)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {/* 헤더 */}
          <div
            className="flex items-center gap-2 mb-3 pb-2"
            style={{
              borderBottom: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-base">🎮</span>
            <span
              className="text-sm font-semibold"
              style={{ color: isDark ? "white" : "#1f2937" }}
            >
              {isMobile
                ? t("controls.title.mobile")
                : t("controls.title.desktop")}
            </span>
          </div>

          {/* 컨트롤 목록 */}
          <div className="space-y-2">
            {controls.map((control, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm w-5 text-center">{control.icon}</span>
                <div className="flex-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
                    }}
                  >
                    {control.action}
                  </span>
                  <span
                    className="text-xs ml-2"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280",
                    }}
                  >
                    → {control.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 디바이스 전환 힌트 */}
          <div
            className="mt-3 pt-2 text-center"
            style={{
              borderTop: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <span
              className="text-[10px]"
              style={{
                color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
              }}
            >
              {isMobile
                ? t("controls.mode.mobile")
                : t("controls.mode.desktop")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
