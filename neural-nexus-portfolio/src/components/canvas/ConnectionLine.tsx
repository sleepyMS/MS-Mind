import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "../../stores/useAppStore";
import { getThemeColor } from "../../utils/themeUtils";

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  isHighlighted?: boolean;
  isDashed?: boolean; // 간접 연결선 (점선)
  reducedMotion?: boolean;
}

/**
 * 시냅스 연결선 컴포넌트
 * 노드 사이를 전기 펄스 효과로 연결하는 쉐이더 라인
 * isDashed=true인 경우 간접 연결을 나타내는 점선 효과
 */
export const ConnectionLine = memo(function ConnectionLine({
  start,
  end,
  color = "#00ffff",
  isHighlighted = false,
  isDashed = false,
  reducedMotion = false,
}: ConnectionLineProps) {
  const theme = useAppStore((state) => state.theme);
  const themeColor = useMemo(() => getThemeColor(color, theme), [color, theme]);
  const isDark = theme === "dark";
  const lineRef = useRef<
    THREE.Line<THREE.BufferGeometry, THREE.ShaderMaterial>
  >(null);

  // 결정론적(deterministic) 곡선 생성
  const geometry = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    // 곡선을 위한 중간점 계산
    const mid = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5);

    // 결정론적 오프셋
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();

    const seed =
      (start[0] + end[0]) * 1000 +
      (start[1] + end[1]) * 100 +
      (start[2] + end[2]);
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const perpendicular = new THREE.Vector3()
      .crossVectors(direction.normalize(), new THREE.Vector3(0, 1, 0))
      .normalize();

    if (perpendicular.length() < 0.1) {
      perpendicular
        .crossVectors(direction.normalize(), new THREE.Vector3(1, 0, 0))
        .normalize();
    }

    const curveAmount = length * 0.15;
    const offsetValue = (pseudoRandom(seed) - 0.5) * 2;
    mid.add(perpendicular.multiplyScalar(curveAmount * offsetValue));

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

    return geometry;
  }, [start, end]);

  const lineObject = useMemo(() => {
    // 쉐이더 머티리얼
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color() },
        uOpacity: { value: 0 },
        uPulseSpeed: { value: isDashed ? 1.0 : 2.0 },
        uIsDashed: { value: isDashed ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      // 프래그먼트 쉐이더
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uPulseSpeed;
        uniform float uIsDashed;
        
        varying vec2 vUv;
        
        void main() {
          // 점선 효과
          float dashPattern = 1.0;
          if (uIsDashed > 0.5) {
            float dashFreq = 20.0;
            dashPattern = step(0.5, fract((vUv.x - uTime * 0.3) * dashFreq));
          }
          
          // 펄스 효과
          float pulse = sin((vUv.x - uTime * uPulseSpeed) * 10.0) * 0.5 + 0.5;
          pulse = pow(pulse, 8.0);
          
          float pulse2 = sin((vUv.x - uTime * uPulseSpeed * 1.5) * 15.0) * 0.5 + 0.5;
          pulse2 = pow(pulse2, 12.0);
          
          float combinedPulse = max(pulse * 0.8, pulse2 * 0.6);
          float baseGlow = uIsDashed > 0.5 ? 0.5 : 0.3;
          float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
          float finalAlpha = (baseGlow + combinedPulse * 0.7) * edgeFade * uOpacity * dashPattern;
          
          vec3 finalColor = uColor;
          if (uIsDashed > 0.5) {
            finalColor = mix(uColor, vec3(1.0), 0.2); 
          } else {
            finalColor = uColor + vec3(0.2, 0.1, 0.3) * combinedPulse;
          }
          
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      // 라이트 모드에서는 NormalBlending을 사용하여 배경에 묻히지 않게 함
      blending: THREE.AdditiveBlending,
    });

    // Geometry is attached through R3F props, so moving endpoints preserves
    // this line and its shader rather than creating a new material per drag.
    return new THREE.Line(undefined, material);
  }, [isDashed]);

  const appearance = `${themeColor}:${isDark}:${isDashed}`;
  const appliedAppearance = useRef("");

  // primitive 자원은 R3F가 자동 해제하지 않으므로 소유 컴포넌트가 정리한다.
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => lineObject.material.dispose(), [lineObject]);

  // 프레임 변화는 씬에 부착된 라인의 머티리얼에만 적용한다.
  useFrame((state) => {
    const material = lineRef.current?.material;
    if (material) {
      material.uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
      if (appliedAppearance.current !== appearance) {
        material.uniforms.uColor.value.set(themeColor);
        material.uniforms.uOpacity.value = isDark ? (isDashed ? 0.4 : 0.6) : isDashed ? 0.6 : 0.8;
        material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
        appliedAppearance.current = appearance;
      }

      const baseOpacity = isDark
        ? isDashed
          ? 0.35
          : 0.5
        : isDashed
          ? 0.55
          : 0.75; // 라이트 모드에서는 더 진하게

      const targetOpacity = isHighlighted ? 1.0 : baseOpacity;
      material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        material.uniforms.uOpacity.value,
        targetOpacity,
        0.1
      );
    }
  });

  return <primitive ref={lineRef} object={lineObject} geometry={geometry} />;
});
