# 🧩 Components Reference

> Neural Nexus Portfolio 컴포넌트 상세 레퍼런스

각 컴포넌트의 역할, Props, 핵심 로직을 설명합니다.

---

## 📋 목차

1. [Canvas 컴포넌트](#canvas-컴포넌트)
2. [UI 컴포넌트](#ui-컴포넌트)

---

## Canvas 컴포넌트

3D 렌더링을 담당하는 React Three Fiber 기반 컴포넌트들입니다.

### Scene.tsx

**역할**: 메인 3D 씬 컨테이너, d3-force 물리 시뮬레이션 실행

**위치**: `src/components/canvas/Scene.tsx`

**핵심 로직**:

```typescript
// d3-force-3d 시뮬레이션 초기화
const simulation = forceSimulation(nodes, 3)
  .force("charge", forceManyBody().strength(-100))
  .force("link", forceLink(links).distance(50).strength(0.5))
  .force("center", forceCenter())
  .force("collision", forceCollide().radius(20));
```

**렌더링 구조**:

```
<Canvas>
  <Scene>
    <Background />
    <CameraManager />
    {nodes.map(node => <Node />)}
    {links.map(link => <ConnectionLine />)}
    <PostProcessing />
  </Scene>
</Canvas>
```

---

### Node.tsx

**역할**: 개별 3D 노드 (구체 + 텍스트 라벨)

**위치**: `src/components/canvas/Node.tsx`

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| `node` | `NeuralNode` | 노드 데이터 |
| `position` | `[number, number, number]` | 3D 위치 |

**시각 효과**:

- 기본: 타입별 색상의 구체
- 호버: 글로우 효과, 스케일 업
- 액티브: 연결 노드 하이라이트

**인터랙션**:

```typescript
// 클릭 핸들러
const handleClick = () => {
  setActiveNode(node.id);
  setModalOpen(true);
  setCameraTarget(position);
};

// 호버 핸들러
const handlePointerOver = () => {
  setHoveredNode(node.id);
  setHighlightedNodes(node.connections);
};
```

---

### ConnectionLine.tsx

**역할**: 두 노드 사이 연결선

**위치**: `src/components/canvas/ConnectionLine.tsx`

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| `start` | `[number, number, number]` | 시작점 |
| `end` | `[number, number, number]` | 끝점 |
| `color` | `string` | 선 색상 |
| `isHighlighted` | `boolean` | 하이라이트 여부 |

**구현**:

```typescript
<Line
  points={[start, end]}
  color={color}
  lineWidth={isHighlighted ? 2 : 0.5}
  opacity={isHighlighted ? 1 : 0.3}
/>
```

---

### CameraManager.tsx

**역할**: 카메라 이동 애니메이션 (노드 선택 시)

**위치**: `src/components/canvas/CameraManager.tsx`

**사용 기술**: GSAP + OrbitControls

**핵심 로직**:

```typescript
useEffect(() => {
  if (cameraTarget) {
    gsap.to(camera.position, {
      x: cameraTarget[0] + offset,
      y: cameraTarget[1] + offset,
      z: cameraTarget[2] + offset,
      duration: 1.5,
      ease: "power2.inOut",
    });

    gsap.to(controls.target, {
      x: cameraTarget[0],
      y: cameraTarget[1],
      z: cameraTarget[2],
      duration: 1.5,
    });
  }
}, [cameraTarget]);
```

---

### Background.tsx

**역할**: 배경 그라디언트 및 파티클 효과

**위치**: `src/components/canvas/Background.tsx`

**테마 적용**:

- 다크 모드: 어두운 우주 배경 + 별 파티클
- 라이트 모드: 밝은 그라디언트 배경

---

### PostProcessing.tsx

**역할**: 후처리 효과 (Bloom, Vignette)

**위치**: `src/components/canvas/PostProcessing.tsx`

**효과**:

```typescript
<EffectComposer>
  <Bloom intensity={0.5} luminanceThreshold={0.9} />
  <Vignette darkness={0.5} offset={0.5} />
</EffectComposer>
```

---

## UI 컴포넌트

2D 오버레이 UI 컴포넌트들입니다.

### Modal.tsx와 modal/

**역할**: 노드 상세 정보 조립과 표시. 책임과 의존 방향은 [아키텍처](./ARCHITECTURE.md#책임과-의존-방향-2026-09-26)를 따릅니다.

- `Modal.tsx`: 현재 노드·언어·테마를 조회하고 선택/닫기 콜백을 연결합니다.
- `modal/ModalDialog.tsx`: 헤더·탭·본문·푸터를 조합합니다.
- `modal/useModalController.ts`: 선택 탭, 키보드 탐색, 포커스와 닫기 애니메이션의 수명을 관리합니다.
- `modal/useModalSwipe.ts`: 수직 스크롤과 수평 스와이프를 구분하고 전환 작업을 정리합니다.
- `modal/tabRegistry.tsx`: 탭 ID·번역 키·표시 조건·본문 렌더러의 정본입니다.
- `modal/contents/`: 프로필, 프로젝트, 기능, 문제 해결, 코드, 실험 결과 등의 표현 컴포넌트입니다. 전역 스토어 대신 필요한 props를 받습니다.

**탭 구조**:

| 대상 | 탭 |
|------|----|
| 프로필 | `profile`, `projects`, `research` |
| 프로젝트·기술 | `description`, `features`, `optimizations`, `trouble`, `code`, `results`, `references`, `lesson`, `skills` |

실제 제공되는 데이터가 있는 탭만 표시됩니다. 기술 선정 이유는 `description`에 포함됩니다.

**탐색**:

- ESC로 닫기, 좌우 방향키로 사이드바와 같은 순서의 노드를 순회합니다.
- 탭에 포커스가 있으면 방향키와 Home/End로 탭을 선택합니다. 입력 필드의 방향키는 가로채지 않습니다.
- 연결 노드 메뉴와 주요 프로젝트에서 해당 노드로 바로 이동합니다.
- 모바일은 본문 가로 스와이프로 순회하고 탭 바에서는 탭 스크롤을 우선합니다.
- 닫기·노드 변경·언마운트 시 이전 전환 타이머를 취소합니다.

---

### SidePanel.tsx

**역할**: 노드 탐색 사이드바

**위치**: `src/components/ui/SidePanel.tsx`

**기능**:

- 검색: `data/catalog.ts`에서 노드명·설명·사용 기술·기능·문제 해결 경험을 검색하고 모달 순회와 같은 순서로 정렬
- 타입별 그룹화: Main, Project, Skill, Lesson
- 카테고리별 서브그룹: Frontend, Backend, AI-ML 등
- 접기/펼치기: 그룹 및 서브그룹

**계층 구조**:

```
└── SidePanel
    ├── SearchInput
    ├── TypeGroup (Main)
    │   └── NodeItem
    ├── TypeGroup (Projects)
    │   ├── CategoryGroup (Frontend)
    │   │   └── NodeItem
    │   └── CategoryGroup (Backend)
    │       └── NodeItem
    └── TypeGroup (Skills)
        ├── SkillCategoryGroup (Language)
        └── SkillCategoryGroup (Framework)
```

---

### NodeFilter.tsx

**역할**: 상단 노드 필터 바

**위치**: `src/components/ui/NodeFilter.tsx`

**기능**:

- 노드 타입 토글: Main, Project, Skill, Lesson
- 카테고리 필터: Frontend, Backend, AI-ML, Creative

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| `visibleTypes` | `NodeType[]` | 표시할 타입 |
| `onToggleType` | `(type) => void` | 타입 토글 핸들러 |

---

### MiniMap.tsx

**역할**: 전체 노드 구조 미니맵

**위치**: `src/components/ui/MiniMap.tsx`

**기능**:

- 전체 노드 위치 2D 표시
- 현재 뷰포트 영역 표시
- 클릭으로 해당 위치로 이동

---

### ThemeSwitcher.tsx

**역할**: 다크/라이트 테마 전환 버튼

**위치**: `src/components/ui/ThemeSwitcher.tsx`

**애니메이션**:

- 태양 ↔ 달 아이콘 전환
- 씬 180도 회전 효과

---

### LanguageSwitcher.tsx

**역할**: 언어 전환 드롭다운

**위치**: `src/components/ui/LanguageSwitcher.tsx`

**지원 언어**:

- 🇰🇷 한국어 (ko)
- 🇺🇸 English (en)

---

### ControlsGuide.tsx

**역할**: 마우스/터치 조작 가이드

**위치**: `src/components/ui/ControlsGuide.tsx`

**반응형**:

- 데스크톱: 마우스 조작법
- 모바일: 터치 조작법

---

### FloatingContactButton.tsx

**역할**: 플로팅 연락 버튼 및 폼

**위치**: `src/components/ui/FloatingContactButton.tsx`

**기능**:

- 클릭 시 연락 폼 팝오버
- EmailJS 연동 메일 전송

---

### ContactForm.tsx

**역할**: 연락 폼 컴포넌트

**위치**: `src/components/ui/ContactForm.tsx`

**필드**:

- 이름 (필수)
- 이메일 (필수)
- 메시지 (필수)

---

## 📚 관련 문서

- [README.md](../README.md) - 프로젝트 개요
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [CUSTOMIZATION.md](./CUSTOMIZATION.md) - 커스터마이징 가이드

## 초기 진입과 지연 로딩 (2026-09-26)

프로필과 프로젝트는 기존 사이드바와 3D 노드에서 연다. 그래프를 가리는 상시 소개 카드는 표시하지 않는다. `SceneStatus`는 전체 화면을 가리지 않는 준비 안내이며, 3D가 실패해도 HTML 목록과 상세 화면은 사용할 수 있다. `Modal`과 `ContactForm`은 사용할 때 불러오고 `FeatureBoundary`가 실패를 해당 기능 안에 가둔다.

닫힌 사이드바·연락창·조작 안내·모바일 필터는 접근성 트리와 키보드 순회에서 제외된다. 상세 화면과 로딩 대체 화면은 Escape·포커스 순환·복귀를 제공한다. 미니맵 노드는 Tab으로 선택한 뒤 Enter/Space로 열 수 있다. 문의 설정이 없을 때는 `ContactFallback`이 프로필의 이메일 링크를 표시한다. 실제 메일 전송은 유효한 입력을 제출했을 때만 실행한다.
