import type { ProjectContentProps } from "../types";
import { useTranslation } from "react-i18next";

export function ProjectsContent({ details, isDark, nodeColor, navigateToNode }: ProjectContentProps) {
  const { t } = useTranslation();
  if (!details?.keyProjects) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
      {details.keyProjects.map((project, idx) => (
        <button
          key={idx}
          className="group relative p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 text-left w-full overflow-hidden cursor-pointer active:scale-[0.98]"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.05)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigateToNode(project.id);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${nodeColor}50`;
            e.currentTarget.style.boxShadow = `0 8px 30px ${nodeColor}20, 0 4px 15px ${nodeColor}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Hover Glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${nodeColor}15, transparent 70%)`,
            }}
          />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
              <h3
                className="text-lg font-bold group-hover:text-cyan-400 transition-colors"
                style={{
                  color: isDark ? "white" : "#1f2937",
                }}
              >
                {project.title}
              </h3>
              <span
                className="text-xs opacity-50 group-hover:opacity-100 transition-opacity font-mono"
                style={{ color: nodeColor }}
              >
                {t("modal.openProject")}
              </span>
            </div>
            <p
              className="text-sm mb-4 line-clamp-2 opacity-80 flex-1 leading-relaxed"
              style={{
                color: isDark ? "rgba(255,255,255,0.7)" : "#4b5563",
              }}
            >
              {project.desc}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {project.tech.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-1 rounded-full font-medium"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                    color: isDark
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(0,0,0,0.7)",
                  }}
                >
                  {t}
                </span>
              ))}
              {project.tech.length > 4 && (
                <span className="text-[10px] opacity-50 self-center">
                  +{project.tech.length - 4}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
