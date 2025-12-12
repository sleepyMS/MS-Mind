import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

/**
 * 초기 로딩 스크린 컴포넌트
 * 신경망 형태의 애니메이션으로 로딩 상태 표시
 */
export function LoadingScreen({
  onComplete,
  minDuration = 2000,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex flex-col items-center justify-center
        bg-[#000010] transition-opacity duration-500
        ${isExiting ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
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
          className="h-full rounded-full transition-all duration-100 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #00ffff, #ff00ff)",
            boxShadow: "0 0 20px #00ffff50",
          }}
        />
      </div>

      {/* 퍼센트 */}
      <span className="text-white/30 text-xs mt-2 font-mono">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
