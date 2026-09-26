import type { ReactNode } from "react";

interface InlineMarkdownProps {
  text: string;
  nodeColor: string;
  isDark: boolean;
  codeColor?: string;
  boldCode?: boolean;
}

/** Inline emphasis, code and links used inside detail lists and tables. */
export function InlineMarkdown({ text, nodeColor, isDark, codeColor = nodeColor, boldCode = false }: InlineMarkdownProps) {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    if (match[1] || (match[3] && boldCode)) {
      parts.push(<strong key={index} style={{ color: codeColor, fontWeight: 700 }}>{match[1] ? match[2] : match[4]}</strong>);
    } else if (match[3]) {
      parts.push(
        <code key={index} style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", color: codeColor, padding: "1px 6px", borderRadius: "4px", fontSize: "0.9em", fontFamily: "monospace" }}>
          {match[4]}
        </code>,
      );
    } else if (match[5]) {
      parts.push(
        <a key={index} href={match[7]} target="_blank" rel="noopener noreferrer" style={{ color: codeColor, textDecoration: "underline", textUnderlineOffset: "2px" }}>
          {match[6]}
        </a>,
      );
    }
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts.length ? parts : text}</>;
}
