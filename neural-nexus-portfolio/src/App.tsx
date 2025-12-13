import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Scene } from "./components/canvas/Scene";
import { Modal } from "./components/ui/Modal";
import { Tooltip } from "./components/ui/Tooltip";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { NodeFilter } from "./components/ui/NodeFilter";
import { SidePanel } from "./components/ui/SidePanel";
import { MiniMap } from "./components/ui/MiniMap";
import { ThemeSwitcher } from "./components/ui/ThemeSwitcher";
import { useAppStore } from "./stores/useAppStore";
import "./index.css";

/**
 * Neural Nexus Portfolio
 * 살아있는 뇌의 신경망 컨셉 3D 포트폴리오
 */
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setLoading, theme } = useAppStore();
  const { t } = useTranslation();

  // HTML 요소에 data-theme 속성 설정 (CSS 변수 테마 적용)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setLoading(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* 로딩 스크린 - 항상 렌더링하되 내부에서 애니메이션 처리 */}
      <LoadingScreen
        onComplete={handleLoadingComplete}
        minDuration={2500}
        show={isLoading}
      />

      {/* 3D 씬 */}
      <Scene />

      {/* UI 오버레이 */}
      <Modal />
      <Tooltip />
      <ThemeSwitcher />
      <NodeFilter />
      <SidePanel />
      <MiniMap />

      {/* 네비게이션 힌트 */}
      <div
        className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none
          transition-all duration-700 ease-out
          ${
            isLoading
              ? "opacity-0 scale-95 translate-y-4"
              : "opacity-100 scale-100 translate-y-0"
          }
        `}
      >
        <p className="text-sm text-[var(--text-tertiary)]">
          {t("app.title") === "Neural Nexus"
            ? "Drag to rotate • Scroll to zoom • Click nodes to explore"
            : "드래그로 회전 • 스크롤로 줌 • 노드 클릭으로 탐색"}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-main)" }}
            />
            <span className="text-xs text-[var(--text-tertiary)]">
              {t("nodeTypes.main")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-project)" }}
            />
            <span className="text-xs text-[var(--text-tertiary)]">
              {t("nodeTypes.project")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-skill)" }}
            />
            <span className="text-xs text-[var(--text-tertiary)]">
              {t("nodeTypes.skill")}
            </span>
          </div>
        </div>
      </div>

      {/* 타이틀 */}
      <div
        className={`
          fixed top-6 left-6 pointer-events-none
          transition-all duration-700 ease-out delay-100
          ${
            isLoading
              ? "opacity-0 scale-90 -translate-y-4"
              : "opacity-100 scale-100 translate-y-0"
          }
        `}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
          {t("app.title")}
        </h1>
        <p className="text-sm mt-1 text-[var(--text-tertiary)]">
          {t("app.subtitle")}
        </p>
      </div>
    </div>
  );
}

export default App;
