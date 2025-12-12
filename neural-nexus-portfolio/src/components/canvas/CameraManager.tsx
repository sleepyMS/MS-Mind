import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useAppStore } from "../../stores/useAppStore";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * 카메라 관리 컴포넌트
 * OrbitControls와 GSAP를 활용한 부드러운 카메라 이동
 */
export function CameraManager() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const { cameraTarget, isAnimating, setIsAnimating, isModalOpen } =
    useAppStore();

  // 타겟이 변경되면 카메라 비행 애니메이션 실행
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current) return;

    setIsAnimating(true);

    const targetPosition = new THREE.Vector3(...cameraTarget);

    // 노드 정면으로 카메라 위치 오프셋 계산
    const cameraOffset = new THREE.Vector3(0, 1, 5);
    const finalCameraPosition = targetPosition.clone().add(cameraOffset);

    // GSAP로 카메라 위치 애니메이션
    gsap.to(camera.position, {
      x: finalCameraPosition.x,
      y: finalCameraPosition.y,
      z: finalCameraPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        // 애니메이션 중 컨트롤 업데이트
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      },
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    // OrbitControls 타겟 애니메이션
    gsap.to(controlsRef.current.target, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, [cameraTarget, camera, setIsAnimating]);

  // 모달 닫힐 때 카메라 리셋 (선택적)
  useEffect(() => {
    if (!isModalOpen && controlsRef.current) {
      // 기본 뷰로 돌아가기 또는 현재 위치 유지
    }
  }, [isModalOpen]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      // 부드러운 감쇠 효과
      enableDamping={true}
      dampingFactor={0.05}
      // 줌 속도 (기본값 1.0, 높을수록 빠름)
      zoomSpeed={2.0}
      // 줌 제한
      minDistance={3}
      maxDistance={100}
      // 패닝 제한 (선택적)
      // maxPolarAngle={Math.PI / 1.5}
      // 유휴 상태 자동 회전 (선택적)
      // autoRotate={!isAnimating && !isModalOpen}
      // autoRotateSpeed={0.5}
      // 애니메이션 중 컨트롤 비활성화
      enabled={!isAnimating}
    />
  );
}
