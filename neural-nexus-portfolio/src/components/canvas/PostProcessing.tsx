import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useAppStore } from "../../stores/useAppStore";

/**
 * 후처리 효과 컴포넌트
 * Bloom과 Vignette로 시네마틱한 느낌 연출
 * 라이트 모드에서는 Bloom 강도를 줄여 과도한 밝기 방지
 */
export function PostProcessing() {
  const { theme } = useAppStore();
  const isDark = theme === "dark";

  return (
    <EffectComposer>
      {/* 노드 빛남을 위한 Bloom 효과 - 라이트 모드에서는 약하게 */}
      <Bloom
        intensity={isDark ? 1.5 : 0.3}
        luminanceThreshold={isDark ? 0.2 : 0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* 시네마틱한 느낌을 위한 비네트 효과 - 라이트 모드에서는 약하게 */}
      <Vignette offset={0.3} darkness={isDark ? 0.6 : 0.2} />
    </EffectComposer>
  );
}
