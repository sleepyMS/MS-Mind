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
import { ControlsGuide } from "./components/ui/ControlsGuide";
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
      <LoadingScreen onComplete={handleLoadingComplete} minDuration={2500} />

      {/* 3D 씬 */}
      <Scene />

      {/* UI 오버레이 */}
      <Modal />
      <Tooltip />
      <ThemeSwitcher />
      <NodeFilter />
      <SidePanel />
      <MiniMap />

      {/* 컨트롤 가이드 */}
      {!isLoading && <ControlsGuide />}

      {/* 타이틀 - 데스크톱에서만 표시 */}
      <div
        className={`
          hidden md:block fixed top-6 left-6 pointer-events-none
          transition-all duration-700 ease-out delay-100
          ${
            isLoading
              ? "opacity-0 scale-90 -translate-y-4"
              : "opacity-100 scale-100 translate-y-0"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Neural Nexus Logo"
            className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            {t("app.title")}
          </h1>
        </div>
        <p className="text-sm mt-1 text-[var(--text-tertiary)]">
          {t("app.subtitle")}
        </p>
      </div>
    </div>
  );
}

export default App;
