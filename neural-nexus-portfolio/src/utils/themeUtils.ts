export const NEON_COLORS = {
  cyan: "#00ffff",
  magenta: "#ff00ff",
  lime: "#88ce02", // Changed from pure green to lime for better neon match
  green: "#00ff88",
  yellow: "#ffff00",
  amber: "#f59e0b",
};

export const PRINT_COLORS = {
  cyan: "#0077be", // Ocean Blue
  magenta: "#800080", // Purple
  lime: "#4a7a00", // Dark Lime/Green
  green: "#008040", // Dark Green
  yellow: "#d4af37", // Metallic Gold/Dark Yellow
  amber: "#d97706", // Dark Amber
};

/**
 * 주어진 색상을 현재 테마에 맞춰 변환합니다.
 * 다크 모드일 경우 네온 색상을 그대로 반환하고,
 * 라이트 모드일 경우 가독성이 좋은 잉크/프린트 색상으로 변환합니다.
 */
export function getThemeColor(color: string, theme: "dark" | "light"): string {
  if (theme === "dark") return color;

  // 색상 매핑 로직 (대략적인 매칭)
  const lowerColor = color.toLowerCase();

  if (lowerColor === NEON_COLORS.cyan || lowerColor === "#0891b2")
    return PRINT_COLORS.cyan;
  if (lowerColor === NEON_COLORS.magenta || lowerColor === "#c026d3")
    return PRINT_COLORS.magenta;
  if (
    lowerColor === NEON_COLORS.lime ||
    lowerColor === NEON_COLORS.green ||
    lowerColor === "#65a30d" ||
    lowerColor.includes("88ce02")
  )
    return PRINT_COLORS.lime;
  if (lowerColor === NEON_COLORS.yellow || lowerColor.includes("ffff00"))
    return PRINT_COLORS.yellow;
  if (lowerColor === NEON_COLORS.amber || lowerColor.includes("f59e0b"))
    return PRINT_COLORS.amber;

  // 매칭되는 색상이 없으면 원본 색상을 유지하되, 일부 자동 조절 시도 가능
  // 여기서는 일단 원본 반환
  return color;
}
