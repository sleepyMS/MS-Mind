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

  const {
    cameraTarget,
    isAnimating,
    setIsAnimating,
    sceneRotation,
    isDragging,
  } = useAppStore();

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

    // 타겟 좌표에 현재 씬의 회전 적용
    const targetLookAt = new THREE.Vector3(...cameraTarget).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      sceneRotation
    );

    // 카메라 위치: 타겟 + 오프셋 (오프셋도 회전 필요할 수 있음, 하지만 현재는 고정 오프셋)
    // 오프셋을 씬 회전에 맞춰 회전시키면 카메라가 항상 "앞"에서 노드를 보게 됨
    const baseOffset = new THREE.Vector3(0, 2, 25);
    const rotatedOffset = baseOffset
      .clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), sceneRotation);

    const targetCameraPosition = targetLookAt.clone().add(rotatedOffset);

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
      Math.max(distance * 0.06, 0.6),
      2.0
    );

    setIsAnimating(true);
  }, [cameraTarget, camera, setIsAnimating, sceneRotation]);

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

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      // 애니메이션 중에는 damping 비활성화로 흔들림 방지
      enableDamping={!isAnimating}
      dampingFactor={0.05}
      zoomSpeed={3}
      minDistance={3}
      maxDistance={300}
      // 애니메이션 중 사용자 입력 비활성화
      enabled={!isAnimating && !isDragging}
    />
  );
}
