import { Scene } from "./components/canvas/Scene";
import { Modal } from "./components/ui/Modal";
import "./index.css";

/**
 * Neural Nexus Portfolio
 * 살아있는 뇌의 신경망 컨셉 3D 포트폴리오
 */
function App() {
  return (
    <div className="relative w-full h-screen bg-[#000010]">
      {/* 3D 씬 */}
      <Scene />

      {/* UI 오버레이 */}
      <Modal />

      {/* 네비게이션 힌트 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <p className="text-white/40 text-sm">
          드래그로 회전 • 스크롤로 줌 • 노드 클릭으로 탐색
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-white/50 text-xs">메인</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
            <span className="text-white/50 text-xs">프로젝트</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/50 text-xs">스킬</span>
          </div>
        </div>
      </div>

      {/* 타이틀 */}
      <div className="fixed top-6 left-6 pointer-events-none">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
          Neural Nexus
        </h1>
        <p className="text-white/50 text-sm mt-1">Min Seok의 포트폴리오</p>
      </div>
    </div>
  );
}

export default App;
