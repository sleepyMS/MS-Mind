import { lazy, Suspense, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "./components/ui/Tooltip";
import { NodeFilter } from "./components/ui/NodeFilter";
import { SidePanel } from "./components/ui/SidePanel";
import { MiniMap } from "./components/ui/MiniMap";
import { ThemeSwitcher } from "./components/ui/ThemeSwitcher";
import { ControlsGuide } from "./components/ui/ControlsGuide";
import { FloatingContactButton } from "./components/ui/FloatingContactButton";
import { FeatureBoundary } from "./components/ui/FeatureBoundary";
import { SceneStatus } from "./components/ui/SceneStatus";
import { useAppStore } from "./stores/useAppStore";
import "./index.css";

const Scene = lazy(() => import("./components/canvas/Scene").then((module) => ({ default: module.Scene })));
const Modal = lazy(() => import("./components/ui/Modal").then((module) => ({ default: module.Modal })));

function DetailStatus({ failed = false }: { failed?: boolean }) {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    useAppStore.setState({ isModalOpen: false, activeNode: null, cameraTarget: null });
  };
  useEffect(() => {
    const opener = document.activeElement;
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") {
        event.preventDefault();
        if (event.key === "Escape") close();
        else closeButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if ((opener instanceof HTMLElement || opener instanceof SVGElement) && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="detail-status" className="rounded-2xl bg-[var(--bg-secondary)] p-6 text-center">
        <p id="detail-status" role={failed ? "alert" : "status"}>{t(failed ? "app.detailUnavailable" : "app.detailLoading")}</p>
        <button ref={closeButtonRef} className="mt-4 rounded-lg border border-[var(--glass-border)] px-4 py-2" onClick={close}>{t("modal.close")}</button>
      </div>
    </div>
  );
}

function App() {
  const theme = useAppStore((state) => state.theme);
  const isModalOpen = useAppStore((state) => state.isModalOpen);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || i18n.language;
    document.title = t("app.pageTitle");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("app.description"));
  }, [i18n.language, i18n.resolvedLanguage, t]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[var(--bg-primary)]">
      <FeatureBoundary fallback={<SceneStatus failed />}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <SceneStatus />
      </FeatureBoundary>
      <h1 className="sr-only">{t("app.pageTitle")}</h1>
      <Tooltip />
      <ThemeSwitcher />
      <NodeFilter />
      <SidePanel />
      <MiniMap />
      <FloatingContactButton />
      <ControlsGuide />
      {isModalOpen && (
        <FeatureBoundary fallback={<DetailStatus failed />}>
          <Suspense fallback={<DetailStatus />}>
            <Modal />
          </Suspense>
        </FeatureBoundary>
      )}
    </main>
  );
}

export default App;
