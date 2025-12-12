import { useAppStore } from "../../stores/useAppStore";
import type { NodeType } from "../../types";

interface FilterOption {
  type: NodeType;
  label: string;
  color: string;
  icon: string;
}

const filterOptions: FilterOption[] = [
  { type: "main", label: "메인", color: "#00ffff", icon: "👤" },
  { type: "project", label: "프로젝트", color: "#ff00ff", icon: "🚀" },
  { type: "skill", label: "스킬", color: "#88ce02", icon: "⚡" },
];

/**
 * 노드 타입별 필터 토글 버튼
 */
export function NodeFilter() {
  const { visibleNodeTypes, toggleNodeType } = useAppStore();

  return (
    <div className="fixed top-6 right-6 z-30">
      <div
        className="flex gap-1 p-1.5 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {filterOptions.map((option) => {
          const isActive = visibleNodeTypes.includes(option.type);

          return (
            <button
              key={option.type}
              onClick={() => toggleNodeType(option.type)}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-xl
                transition-all duration-300 ease-out
                ${isActive ? "scale-100" : "scale-95 opacity-50"}
              `}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${option.color}25, ${option.color}10)`
                  : "transparent",
                border: isActive
                  ? `1px solid ${option.color}40`
                  : "1px solid transparent",
              }}
              title={`${option.label} ${isActive ? "숨기기" : "보기"}`}
            >
              <span className="text-sm">{option.icon}</span>

              <span
                className="hidden md:inline text-xs font-medium transition-colors"
                style={{
                  color: isActive ? option.color : "rgba(255,255,255,0.5)",
                }}
              >
                {option.label}
              </span>

              <div
                className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-300
                  ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}
                `}
                style={{ backgroundColor: option.color }}
              />

              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ boxShadow: `0 0 20px ${option.color}30` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
