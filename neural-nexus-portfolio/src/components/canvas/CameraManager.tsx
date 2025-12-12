import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../../stores/useAppStore";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * 카메라 관리 컴포넌트
 * 부드러운 Lerp 기반 카메라 이동
 */
export function CameraManager() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const { cameraTarget, isAnimating, setIsAnimating, isModalOpen } =
    useAppStore();

  // 애니메이션 상태를 ref로 관리 (렌더링 최적화)
  const animationRef = useRef({
    isActive: false,
    progress: 0,
    startPosition: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(),
    startLookAt: new THREE.Vector3(),
    targetLookAt: new THREE.Vector3(),
    duration: 1.5,
  });

  // 타겟이 변경되면 애니메이션 시작
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current) return;

    const targetLookAt = new THREE.Vector3(...cameraTarget);
    const cameraOffset = new THREE.Vector3(0, 2, 8);
    const targetCameraPosition = targetLookAt.clone().add(cameraOffset);

    // 현재 위치 저장
    animationRef.current.startPosition.copy(camera.position);
    animationRef.current.targetPosition.copy(targetCameraPosition);
    animationRef.current.startLookAt.copy(controlsRef.current.target);
    animationRef.current.targetLookAt.copy(targetLookAt);
    animationRef.current.progress = 0;
    animationRef.current.isActive = true;

    // 이동 거리에 따라 duration 조절 (멀면 더 오래)
    const distance = camera.position.distanceTo(targetCameraPosition);
    animationRef.current.duration = Math.min(
      Math.max(distance * 0.1, 1.0),
      2.5
    );

    setIsAnimating(true);
  }, [cameraTarget, camera, setIsAnimating]);

  // 매 프레임 부드러운 보간
  useFrame((_, delta) => {
    if (!animationRef.current.isActive || !controlsRef.current) return;

    const anim = animationRef.current;

    // 진행도 업데이트 (더 부드러운 이징)
    anim.progress += delta / anim.duration;

    if (anim.progress >= 1) {
      // 애니메이션 완료
      anim.progress = 1;
      anim.isActive = false;
      setIsAnimating(false);
    }

    // easeInOutCubic 이징 함수
    const t = anim.progress;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // 카메라 위치 보간
    camera.position.lerpVectors(anim.startPosition, anim.targetPosition, ease);

    // OrbitControls 타겟 보간
    controlsRef.current.target.lerpVectors(
      anim.startLookAt,
      anim.targetLookAt,
      ease
    );

    // 컨트롤 업데이트 (damping 비활성화 상태에서)
    controlsRef.current.update();
  });

  // 모달 닫힐 때 처리
  useEffect(() => {
    if (!isModalOpen && controlsRef.current) {
      // 현재 위치 유지
    }
  }, [isModalOpen]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      // 애니메이션 중에는 damping 비활성화로 흔들림 방지
      enableDamping={!isAnimating}
      dampingFactor={0.05}
      zoomSpeed={1.5}
      minDistance={3}
      maxDistance={100}
      // 애니메이션 중 사용자 입력 비활성화
      enabled={!isAnimating}
    />
  );
}
