import { useTranslation } from "react-i18next";

export function ModalFooter({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();
  return (<div
    className="px-6 pb-4 flex justify-end items-center gap-4 pt-3"
    style={{
      borderTop: isDark
        ? "1px solid rgba(255,255,255,0.05)"
        : "1px solid rgba(0,0,0,0.05)",
    }}
  >
    {/* 모바일: 스와이프 힌트 */}
    <span
      className="text-xs flex items-center gap-1.5 transition-colors duration-300 md:hidden"
      style={{
        color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
      }}
    >
      {t("modal.navigation.swipeTraverse")}
    </span>

    {/* 데스크톱: 키보드 힌트 */}
    <span
      className="text-xs hidden md:flex items-center gap-1.5 transition-colors duration-300"
      style={{
        color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
      }}
    >
      <kbd
        className="px-1.5 py-0.5 rounded font-mono text-[10px]"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
        }}
      >
        ←
      </kbd>
      <kbd
        className="px-1.5 py-0.5 rounded font-mono text-[10px]"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
        }}
      >
        →
      </kbd>
      {t("modal.navigation.traverse")}
    </span>
    <span
      className="text-xs hidden md:flex items-center gap-1.5 transition-colors duration-300"
      style={{
        color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
      }}
    >
      <kbd
        className="px-1.5 py-0.5 rounded font-mono text-[10px]"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
        }}
      >
        ESC
      </kbd>
      {t("modal.close")}
    </span>
  </div>
  );
}
