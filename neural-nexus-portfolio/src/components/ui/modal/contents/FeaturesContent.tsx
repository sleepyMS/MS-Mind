import type { DetailContentProps } from "../types";
import { InlineMarkdown } from "../InlineMarkdown";

export function FeaturesContent({ details, isDark, nodeColor }: DetailContentProps) {
  if (!details?.features) return null;
  return (
    <div className="space-y-8">
      {details.features.map((feature, idx) => (
        <div
          key={idx}
          className="relative pl-6 border-l-2 border-cyan-400/30"
        >
          <div className="absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
            <span className="text-[10px] font-bold text-cyan-400">
              {idx + 1}
            </span>
          </div>
          <h3 className="text-lg font-bold mb-3 text-cyan-400">
            {feature.title}
          </h3>
          <ul className="space-y-2">
            {feature.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed"
                style={{
                  color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                }}
              >
                <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400/50 shrink-0" />
                <span>
                  {<InlineMarkdown text={item} nodeColor={nodeColor} isDark={isDark} {...{
                    codeColor: "#22d3ee",
                  }} />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
