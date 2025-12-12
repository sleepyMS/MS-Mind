import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * 후처리 효과 컴포넌트
 * Bloom과 Vignette로 시네마틱한 느낌 연출
 */
export function PostProcessing() {
  return (
    <EffectComposer>
      {/* 노드 빛남을 위한 Bloom 효과 */}
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* 시네마틱한 느낌을 위한 비네트 효과 */}
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}
