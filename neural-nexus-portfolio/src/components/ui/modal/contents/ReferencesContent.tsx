import type { DetailContentProps } from "../types";

export function ReferencesContent({ details, isDark }: DetailContentProps) {
  if (!details?.references) return null;
  return (
    <div className="space-y-4">
      <p
        className="text-sm mb-4"
        style={{
          color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280",
        }}
      >
        본 연구에서 참고한 학술 자료입니다.
      </p>
      <div
        className="space-y-3 p-4 rounded-xl"
        style={{
          background: isDark
            ? "rgba(59, 130, 246, 0.08)"
            : "rgba(59, 130, 246, 0.05)",
          border: isDark
            ? "1px solid rgba(59, 130, 246, 0.2)"
            : "1px solid rgba(59, 130, 246, 0.15)",
        }}
      >
        {details.references.map((ref) => (
          <div
            key={ref.id}
            className="text-sm leading-relaxed pb-2"
            style={{
              color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
              borderBottom: isDark
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <span
              className="font-semibold mr-2"
              style={{ color: isDark ? "#93c5fd" : "#2563eb" }}
            >
              [{ref.id}]
            </span>
            {ref.authors} ({ref.year}).{" "}
            <span className="italic">{ref.title}</span>.{" "}
            <span
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af",
              }}
            >
              {ref.source}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
