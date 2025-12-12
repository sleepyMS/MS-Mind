import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  isHighlighted?: boolean;
}

/**
 * 시냅스 연결선 컴포넌트
 * 노드 사이를 전기 펄스 효과로 연결하는 쉐이더 라인
 */
export function ConnectionLine({
  start,
  end,
  color = "#00ffff",
  isHighlighted = false,
}: ConnectionLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // CatmullRom 곡선을 사용한 부드러운 라인 지오메트리 생성
  const geometry = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    // 곡선을 위한 중간점 계산
    const mid = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5);

    // 유기적인 곡선을 위한 수직 오프셋 추가
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();

    // 부드러운 곡선을 위한 컨트롤 포인트 생성
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * length * 0.2,
      (Math.random() - 0.5) * length * 0.2,
      (Math.random() - 0.5) * length * 0.2
    );
    mid.add(offset);

    const curve = new THREE.CatmullRomCurve3([startVec, mid, endVec]);
    const points = curve.getPoints(50);
    const geom = new THREE.BufferGeometry().setFromPoints(points);

    // 쉐이더용 UV 좌표 추가
    const uvs = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
      uvs[i * 2] = i / (points.length - 1);
      uvs[i * 2 + 1] = 0;
    }
    geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    return geom;
  }, [start, end]);

  // 전기 펄스 효과를 위한 쉐이더 머티리얼 생성
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 0.6 },
        uPulseSpeed: { value: 2.0 },
      },
      // 버텍스 쉐이더
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      // 프래그먼트 쉐이더 - 전기 펄스 애니메이션
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uPulseSpeed;
        
        varying vec2 vUv;
        
        void main() {
          // 라인을 따라 이동하는 여러 펄스 생성
          float pulse = sin((vUv.x - uTime * uPulseSpeed) * 10.0) * 0.5 + 0.5;
          pulse = pow(pulse, 8.0);  // 펄스를 더 날카롭게
          
          // 두 번째 더 빠른 펄스
          float pulse2 = sin((vUv.x - uTime * uPulseSpeed * 1.5) * 15.0) * 0.5 + 0.5;
          pulse2 = pow(pulse2, 12.0);
          
          // 펄스 합성
          float combinedPulse = max(pulse * 0.8, pulse2 * 0.6);
          float baseGlow = 0.3;  // 기본 빛남
          float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);  // 양끝 페이드
          float finalAlpha = (baseGlow + combinedPulse * 0.7) * edgeFade * uOpacity;
          
          // 펄스에 따른 색상 변화
          vec3 finalColor = uColor + vec3(0.2, 0.1, 0.3) * combinedPulse;
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // 가산 블렌딩으로 빛나는 효과
    });
  }, [color]);

  // 쉐이더 애니메이션 업데이트
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // 하이라이트 시 투명도 증가
      const targetOpacity = isHighlighted ? 1.0 : 0.5;
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        targetOpacity,
        0.1
      );
    }
  });

  return (
    <primitive object={new THREE.Line(geometry, material)} ref={lineRef}>
      <primitive object={material} ref={materialRef} attach="material" />
    </primitive>
  );
}
