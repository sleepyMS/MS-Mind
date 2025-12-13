import { useEffect, useState, useRef } from "react";
import { useAppStore } from "../../stores/useAppStore";
import gsap from "gsap";

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

/**
 * 초기 로딩 스크린 컴포넌트
 * 시간 기반 진행률 + 실제 에셋 로딩 진행률 조합
 */
export function LoadingScreen({
  onComplete,
  minDuration = 1500,
}: LoadingScreenProps) {
  const { loadingProgress } = useAppStore();
  const [timeProgress, setTimeProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());
  const completedRef = useRef(false);

  // 시간 기반 진행률 (0-100, minDuration 동안)
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setTimeProgress(newProgress);
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration]);

  // 최종 진행률: 시간 기반과 실제 로딩의 최대값
  const displayProgress =
    loadingProgress > 0
      ? Math.max(timeProgress, loadingProgress)
      : timeProgress;

  // 완료 조건 및 애니메이션
  useEffect(() => {
    if (completedRef.current) return;

    if (timeProgress >= 100) {
      if (loadingProgress > 0 && loadingProgress < 100) {
        return;
      }

      completedRef.current = true;

      // GSAP 애니메이션으로 부드러운 퇴장 효과 구현
      if (containerRef.current) {
        // 즉시 애니메이션 시작 (딜레이 제거)
        gsap.to(containerRef.current, {
          duration: 1.2,
          scale: 1.5, // 빨려들어가는 효과
          opacity: 0,
          filter: "blur(20px)",
          ease: "power3.inOut", // 부드러운 가속/감속
          onComplete: () => {
            setShouldRender(false);
            onComplete?.();
          },
        });
      }
    }
  }, [timeProgress, loadingProgress, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000010] origin-center"
    >
      {/* 뉴럴 네트워크 애니메이션 */}
      <div className="relative w-48 h-48 mb-8">
        {/* 중앙 노드 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle, #00ffff 0%, #00ffff50 100%)",
            boxShadow: "0 0 40px #00ffff50",
          }}
        />

        {/* 연결선 & 서브노드 */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <div
            key={angle}
            className="absolute top-1/2 left-1/2 origin-center"
            style={{
              transform: `rotate(${angle}deg)`,
              animation: `neuralPulse 1.5s ease-in-out infinite ${i * 0.2}s`,
            }}
          >
            {/* 연결선 */}
            <div
              className="absolute h-px w-16 left-4"
              style={{
                background: "linear-gradient(90deg, #00ffff50, transparent)",
              }}
            />
            {/* 서브노드 */}
            <div
              className="absolute w-3 h-3 rounded-full left-20 -translate-y-1/2"
              style={{
                background: i % 2 === 0 ? "#ff00ff" : "#00ffff",
                boxShadow: `0 0 20px ${
                  i % 2 === 0 ? "#ff00ff50" : "#00ffff50"
                }`,
              }}
            />
          </div>
        ))}

        {/* 외부 링 */}
        <div
          className="absolute inset-0 rounded-full animate-spin-slow"
          style={{
            border: "1px dashed rgba(0, 255, 255, 0.2)",
          }}
        />
        <div
          className="absolute inset-4 rounded-full animate-spin-slow"
          style={{
            border: "1px dashed rgba(255, 0, 255, 0.2)",
            animationDirection: "reverse",
            animationDuration: "4s",
          }}
        />
      </div>

      {/* 브랜딩 */}
      <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
        Neural Nexus
      </h2>
      <p className="text-white/40 text-sm mb-6">포트폴리오 로딩 중...</p>

      {/* 프로그레스 바 */}
      <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${displayProgress}%`,
            background: "linear-gradient(90deg, #00ffff, #ff00ff)",
            boxShadow: "0 0 20px #00ffff50",
          }}
        />
      </div>

      {/* 퍼센트 */}
      <span className="text-white/30 text-xs mt-2 font-mono">
        {Math.round(displayProgress)}%
      </span>
    </div>
  );
}
