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
 *
 * 주의: start와 end 위치가 정확히 노드 중심과 일치해야 함
 */
export function ConnectionLine({
  start,
  end,
  color = "#00ffff",
  isHighlighted = false,
}: ConnectionLineProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // 결정론적(deterministic) 곡선 생성 - 랜덤 제거
  // start와 end 좌표를 시드로 사용하여 일관된 곡선 생성
  const lineObject = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    // 곡선을 위한 중간점 계산
    const mid = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5);

    // 결정론적 오프셋: 좌표값을 기반으로 일관된 오프셋 생성
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();

    // 시드 값을 좌표에서 생성 (일관성 보장)
    const seed =
      (start[0] + end[0]) * 1000 +
      (start[1] + end[1]) * 100 +
      (start[2] + end[2]);
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // 부드러운 곡선을 위한 수직 오프셋 (결정론적)
    const perpendicular = new THREE.Vector3()
      .crossVectors(direction.normalize(), new THREE.Vector3(0, 1, 0))
      .normalize();

    // 방향이 거의 수직일 경우 다른 축 사용
    if (perpendicular.length() < 0.1) {
      perpendicular
        .crossVectors(direction.normalize(), new THREE.Vector3(1, 0, 0))
        .normalize();
    }

    // 결정론적 오프셋 적용 (곡선의 휘어짐 정도)
    const curveAmount = length * 0.15;
    const offsetValue = (pseudoRandom(seed) - 0.5) * 2;
    mid.add(perpendicular.multiplyScalar(curveAmount * offsetValue));

    // 직선에 가까운 곡선 (3개의 점으로 부드러운 곡선)
    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    const points = curve.getPoints(30);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // 쉐이더용 UV 좌표 추가
    const uvs = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
      uvs[i * 2] = i / (points.length - 1);
      uvs[i * 2 + 1] = 0;
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    // 전기 펄스 효과를 위한 쉐이더 머티리얼
    const material = new THREE.ShaderMaterial({
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
          pulse = pow(pulse, 8.0);
          
          // 두 번째 더 빠른 펄스
          float pulse2 = sin((vUv.x - uTime * uPulseSpeed * 1.5) * 15.0) * 0.5 + 0.5;
          pulse2 = pow(pulse2, 12.0);
          
          // 펄스 합성
          float combinedPulse = max(pulse * 0.8, pulse2 * 0.6);
          float baseGlow = 0.3;
          float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
          float finalAlpha = (baseGlow + combinedPulse * 0.7) * edgeFade * uOpacity;
          
          // 펄스에 따른 색상 변화
          vec3 finalColor = uColor + vec3(0.2, 0.1, 0.3) * combinedPulse;
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Line(geometry, material);
  }, [start[0], start[1], start[2], end[0], end[1], end[2], color]);

  // 쉐이더 애니메이션 업데이트
  useFrame((state) => {
    const material = lineObject.material as THREE.ShaderMaterial;
    if (material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // 하이라이트 시 투명도 증가
      const targetOpacity = isHighlighted ? 1.0 : 0.5;
      material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        material.uniforms.uOpacity.value,
        targetOpacity,
        0.1
      );
    }
  });

  return <primitive object={lineObject} />;
}
