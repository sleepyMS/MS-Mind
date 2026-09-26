import type { DetailContentProps } from "../types";

export function ResearchContent({ details, isDark, nodeColor }: DetailContentProps) {
  if (!details?.researchInterests) return null;
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 gap-6">
        {details.researchInterests.map((interest, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.6)",
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            }}
          >
            <h3
              className="text-lg font-bold mb-4 flex items-center gap-2"
              style={{ color: nodeColor }}
            >
              <span>🔬</span> {interest.category}
            </h3>
            <ul className="space-y-3">
              {interest.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed opacity-90"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-sm shrink-0"
                    style={{
                      backgroundColor: nodeColor,
                      opacity: 0.7,
                    }}
                  ></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
