import type { DetailContentProps } from "../types";

export function SkillsContent({ details, isDark, nodeColor }: DetailContentProps) {
  if (!details?.skills) return null;
  return (
    <div className="space-y-6">
      {details.skills.map((skillGroup, idx) => (
        <div key={idx}>
          <h3
            className="text-sm font-semibold mb-3 uppercase tracking-wider"
            style={{
              color: isDark
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.5)",
            }}
          >
            {skillGroup.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillGroup.items.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:scale-105 cursor-default"
                style={{
                  background: isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.05)",
                  border: `1px solid ${nodeColor}30`,
                  color: nodeColor,
                  fontWeight: 500,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
