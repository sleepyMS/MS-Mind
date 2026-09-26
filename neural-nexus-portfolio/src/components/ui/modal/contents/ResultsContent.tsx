import type { DetailContentProps } from "../types";
import { InlineMarkdown } from "../InlineMarkdown";

export function ResultsContent({ details, isDark, nodeColor }: DetailContentProps) {
  if (!details?.performance) return null;
  return (
    <div className="space-y-8">
      {details.performance.map((perf, idx) => (
        <div key={idx} className="space-y-4">
          <h3
            className="text-lg font-bold"
            style={{ color: isDark ? "#93c5fd" : "#1d4ed8" }}
          >
            {perf.title}
          </h3>

          {perf.description && (
            <p
              className="text-sm leading-relaxed"
              style={{
                color: isDark ? "rgba(255,255,255,0.7)" : "#4b5563",
              }}
            >
              {perf.description}
            </p>
          )}

          {perf.image && (
            <div
              className="rounded-xl overflow-hidden border"
              style={{
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={perf.image}
                alt={perf.title}
                className="w-full h-auto object-contain bg-white/5"
              />
            </div>
          )}

          {perf.headers && perf.rows && (
            <div
              className="overflow-x-auto rounded-xl border"
              style={{
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <table className="w-full text-sm text-center">
                <thead>
                  <tr
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.02)",
                      color: isDark
                        ? "rgba(255,255,255,0.9)"
                        : "#1f2937",
                    }}
                  >
                    {perf.headers.map((header, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-4 py-3 font-semibold border-b"
                        style={{
                          borderColor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.05)",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.8)"
                      : "#374151",
                  }}
                >
                  {perf.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-b last:border-0"
                      style={{
                        borderColor: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)",
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-3">
                          {typeof cell === "string"
                            ? <InlineMarkdown text={cell} nodeColor={nodeColor} isDark={isDark} />
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
