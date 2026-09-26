import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";

export function SceneStatus({ failed = false }: { failed?: boolean }) {
  const isLoading = useAppStore((state) => state.isLoading);
  const { t } = useTranslation();
  if (!isLoading && !failed) return null;

  return (
    <p role="status" className="scene-status">
      {!failed && <span className="scene-status-dot" aria-hidden="true" />}
      {t(failed ? "app.sceneUnavailable" : "app.loading")}
    </p>
  );
}
