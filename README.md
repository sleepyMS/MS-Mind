# 🧠 Neural Nexus Portfolio

> **d3-force 물리 엔진 기반 3D 인터랙티브 포트폴리오**
>
> 뉴런 네트워크처럼 연결된 프로젝트, 기술, 경험을 탐색할 수 있는 몰입형 3D 포트폴리오

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r182-000000?logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

### 최신 프로젝트와 AI 활용 경험

- **느린 뇌, 빠른 손**: 로컬 Qwen3.8 27B를 활용한 투자 자동화. 데이터 수집, 비용을 반영한 전략 평가, 주문 게이트웨이, 운영 콘솔을 구현해 개인 투자에 활용하며 기능별 검증과 개선을 진행합니다.
- **디자인 프로그램 (구현 중)**: Jev를 활용한 디자인 도구 개발 경험을 소개합니다.
- Codex·Claude Code를 활용한 설계·구현·오류 분석·검증 경험을 한국어와 영어 프로필, 프로젝트, 기술 노드에 반영했습니다.

### 🌐 3D 뉴런 네트워크 시각화

- **d3-force-3d** 물리 엔진으로 노드들이 자연스럽게 배치
- **React Three Fiber**로 WebGL 기반 3D 렌더링
- 노드 간 연결선으로 관계 시각화
- 마우스/터치로 회전, 줌, 이동 가능

### 📱 반응형 상세 모달

- 탭 기반 UI로 Overview / Features / Tech Stack / Code 정보 제공
- 프로젝트별 GitHub, 배포, 블로그 링크 지원
- 연결된 노드 간 빠른 탐색

### 🎨 테마 & 다국어 지원

- **다크/라이트 모드** 전환 (부드러운 전환 애니메이션)
- **i18next** 기반 한국어/영어 지원
- 시맨틱 컬러 시스템으로 일관된 디자인

### 🔍 노드 탐색 시스템

- 사이드바에서 타입별(메인/프로젝트/스킬/교훈) 필터링
- 카테고리별(프론트엔드/백엔드/AI-ML/크리에이티브) 분류
- 실시간 검색 기능
- 미니맵으로 전체 구조 파악

---

## 🛠️ Tech Stack

### Core

| 기술           | 버전 | 용도          |
| -------------- | ---- | ------------- |
| **React**      | 19.x | UI 프레임워크 |
| **TypeScript** | 5.9  | 타입 안정성   |
| **Vite**       | 7.x  | 빌드 도구     |

### 3D & Animation

| 기술                  | 용도                    |
| --------------------- | ----------------------- |
| **Three.js**          | WebGL 3D 렌더링         |
| **React Three Fiber** | React에서 Three.js 사용 |
| **@react-three/drei** | R3F 헬퍼 컴포넌트       |
| **d3-force-3d**       | 물리 기반 레이아웃      |
| **GSAP**              | 카메라 애니메이션       |

### State & Styling

| 기술             | 용도                   |
| ---------------- | ---------------------- |
| **Zustand**      | 경량 상태 관리         |
| **Tailwind CSS** | 유틸리티 기반 스타일링 |
| **i18next**      | 다국어 지원            |

---

## 📁 Project Structure

```
neural-nexus-portfolio/
├── public/                # 정적 파일 (이미지, 폰트)
├── src/
│   ├── assets/            # 에셋 파일
│   ├── components/
│   │   ├── canvas/        # 3D 관련 컴포넌트
│   │   │   ├── Background.tsx      # 배경 효과
│   │   │   ├── CameraManager.tsx   # 카메라 제어
│   │   │   ├── ConnectionLine.tsx  # 노드 연결선
│   │   │   ├── Node.tsx            # 3D 노드
│   │   │   ├── PostProcessing.tsx  # 후처리 효과
│   │   │   └── Scene.tsx           # 메인 씬
│   │   └── ui/            # UI 컴포넌트
│   │       ├── Modal.tsx           # 상세 모달
│   │       ├── SidePanel.tsx       # 사이드바
│   │       ├── NodeFilter.tsx      # 필터 바
│   │       ├── MiniMap.tsx         # 미니맵
│   │       ├── ThemeSwitcher.tsx   # 테마 전환
│   │       ├── LanguageSwitcher.tsx# 언어 전환
│   │       └── ...
│   ├── data/
│   │   ├── nodes.ko.json  # 📌 한국어 포트폴리오 데이터
│   │   ├── nodes.en.json  # 📌 영어 포트폴리오 데이터
│   │   └── index.ts       # 데이터 로더 및 정규화
│   ├── hooks/             # 커스텀 훅
│   ├── locales/           # 번역 파일 (ko, en)
│   ├── stores/
│   │   └── useAppStore.ts # Zustand 전역 상태
│   ├── types/             # TypeScript 타입 정의
│   └── utils/             # 유틸리티 함수
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.12+ (`neural-nexus-portfolio/.nvmrc`: 22)
- npm or pnpm

### Installation

```bash
# 저장소 클론
git clone https://github.com/sleepyMS/MS-Mind.git
cd MS-Mind/neural-nexus-portfolio

# nvm을 사용하는 경우 프로젝트 Node 버전 선택
nvm use

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### Build

```bash
# 프로덕션 빌드
npm run build

# 데이터 연결, 탐색 순서, 레이아웃 경계 검사
npm test

# 코드 검사
npm run lint

# 빌드 결과 미리보기
npm run preview
```

---

## 🎨 Customization

### 포트폴리오 데이터 수정

핵심 데이터는 `src/data/nodes.ko.json` (한국어)와 `src/data/nodes.en.json` (영어)에 정의됩니다. 한 언어에서만 노드 간 연결을 정의해도 시스템이 자동으로 양방향으로 연결합니다.

#### 노드 타입

| 타입      | 설명                   |
| --------- | ---------------------- |
| `main`    | 메인 프로필 노드 (1개) |
| `project` | 프로젝트 노드          |
| `skill`   | 기술 스택 노드         |
| `lesson`  | 교훈/배운 점 노드      |

#### 노드 구조 예시

```json
{
  "id": "project-example",
  "type": "project",
  "category": "frontend",
  "label": "프로젝트 이름",
  "connections": ["skill-react", "skill-typescript"],
  "color": "#61DAFB",
  "details": {
    "description": "프로젝트 설명",
    "link": "https://github.com/...",
    "deployLink": "https://vercel.app/...",
    "technologies": ["React", "TypeScript"],
    "features": [
      {
        "title": "주요 기능",
        "items": ["기능 1", "기능 2"]
      }
    ]
  }
}
```

### 테마 색상 수정

`src/index.css`에서 CSS 변수를 수정:

```css
:root {
  --color-main: #00ffff; /* 메인 강조색 */
  --color-accent: #ff00ff; /* 보조 강조색 */
}
```

### 다국어 추가

1. `src/locales/` 의 로케일 JSON 파일 수정 (UI 텍스트)
2. `src/data/nodes.{lang}.json` 수정 (노드 콘텐츠)
3. 상세 가이드는 [Customization Guide](./docs/CUSTOMIZATION.md)를 참고하세요.

---

## 🖱️ Controls

### 데스크톱

| 조작          | 동작       |
| ------------- | ---------- |
| 좌클릭 드래그 | 회전       |
| 우클릭 드래그 | 이동       |
| 스크롤 휠     | 줌 인/아웃 |
| 노드 클릭     | 상세 보기  |

### 모바일

| 조작             | 동작      |
| ---------------- | --------- |
| 한 손가락 드래그 | 회전      |
| 두 손가락 드래그 | 이동      |
| 핀치 인/아웃     | 줌        |
| 노드 탭          | 상세 보기 |

---

## 📚 Documentation

프로젝트를 더 깊이 이해하고 커스터마이징하려면 아래 문서들을 참고하세요:

| 문서                                              | 설명                                                        |
| ------------------------------------------------- | ----------------------------------------------------------- |
| [📖 Customization Guide](./docs/CUSTOMIZATION.md) | 포트폴리오 데이터 수정, 테마 커스터마이징, 다국어 추가 방법 |
| [🏗️ Architecture](./docs/ARCHITECTURE.md)         | 시스템 아키텍처, 데이터 흐름, 상태 관리 구조                |
| [🧩 Components](./docs/COMPONENTS.md)             | Canvas/UI 컴포넌트 상세 레퍼런스                            |
| [🤝 Contributing](./CONTRIBUTING.md)              | 기여 가이드, 커밋 컨벤션, PR 프로세스                       |
| [검증 기록 (2026-09-26)](./docs/VERIFICATION-2026-09-26.md) | 콘텐츠 최신화·구조 개선의 자동 검사와 브라우저 확인 |

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [d3-force-3d](https://github.com/vasturiano/d3-force-3d)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/sleepyMS">sleepyMS</a>
</p>

### 2026-09-26 품질 개선

- 3D 그래프 중심의 탐색을 유지하고 모바일·키보드 접근성 개선
- 3D·상세 화면·연락 폼의 지연 로딩과 기능별 실패 격리
- 그래프 계산·모달 탭·이벤트 수명을 분리하고 필요한 상태만 구독
- 검증 결과와 번들 비교: [검증 기록](docs/VERIFICATION-2026-09-26.md)
