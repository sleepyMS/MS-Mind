# 🎨 Customization Guide

> Neural Nexus Portfolio를 나만의 포트폴리오로 커스터마이징하는 완벽 가이드

이 문서에서는 포트폴리오 데이터를 수정하여 자신만의 포트폴리오를 만드는 방법을 설명합니다.

---

## 📋 목차

1. [개요](#개요)
2. [노드 타입](#노드-타입)
3. [데이터 스키마](#데이터-스키마)
4. [단계별 가이드](#단계별-가이드)
5. [테마 커스터마이징](#테마-커스터마이징)
6. [다국어 추가](#다국어-추가)

---

## 개요

모든 포트폴리오 데이터는 `neural-nexus-portfolio/src/data/nodes.{lang}.json` 파일에 정의됩니다.

```
neural-nexus-portfolio/
└── src/
    └── data/
        ├── nodes.ko.json  ← 한국어 데이터를 수정합니다
        └── nodes.en.json  ← 영어 데이터를 수정합니다 (번역)
```

---

## 노드 타입

포트폴리오는 4가지 타입의 노드로 구성됩니다:

| 타입      | 설명                        | 권장 개수 |
| --------- | --------------------------- | --------- |
| `main`    | 메인 프로필 노드 (자기소개) | 1개       |
| `project` | 프로젝트 노드               | 5-15개    |
| `skill`   | 기술 스택 노드              | 10-20개   |
| `lesson`  | 회고/교훈 노드              | 0-5개     |

---

## 데이터 스키마

### 공통 필드 (모든 노드)

```json
{
  "id": "unique-id",           // 고유 식별자 (케밥케이스 권장)
  "type": "project",           // 노드 타입
  "label": "표시 이름",         // 화면에 표시될 이름
  "connections": ["skill-1"],  // 연결할 노드 ID 배열
  "color": "#61DAFB",          // 노드 색상 (선택)
  "details": { ... }           // 상세 정보 객체
}
```

---

### 1. Main 노드 (메인 프로필)

메인 노드는 포트폴리오의 중심이 되는 자기소개 노드입니다.

```json
{
  "id": "me",
  "type": "main",
  "label": "이름",
  "connections": ["project-1", "project-2"],
  "details": {
    "description": "자기소개 텍스트\n\\n으로 줄바꿈",

    "personalInfo": [
      { "key": "이름", "value": "홍길동" },
      { "key": "이메일", "value": "email@example.com" },
      { "key": "연락처", "value": "+82 10-xxxx-xxxx" }
    ],

    "philosophy": {
      "title": "철학/모토 제목",
      "content": "상세 설명"
    },

    "extendedBio": "확장된 자기소개 (여러 문단)",

    "profile": {
      "education": [
        {
          "period": "2020.03 – 현재",
          "school": "대학교명",
          "major": "전공명",
          "status": "재학 중",
          "gpa": "4.0 / 4.5"
        }
      ],
      "career": [
        {
          "period": "2023.01 – 2023.06",
          "company": "회사명",
          "role": "직무",
          "description": "업무 설명"
        }
      ],
      "skills": [
        {
          "category": "Languages",
          "items": ["Python", "JavaScript", "TypeScript"]
        }
      ]
    },

    "keyProjects": [
      {
        "id": "project-1",
        "title": "프로젝트명",
        "desc": "한 줄 설명",
        "tech": ["React", "Node.js"]
      }
    ],

    "researchInterests": [
      {
        "category": "분야명",
        "items": ["관심 주제 1", "관심 주제 2"]
      }
    ],

    "awards": [
      {
        "date": "2024.01",
        "title": "수상명",
        "issuer": "수여 기관"
      }
    ]
  }
}
```

---

### 2. Project 노드 (프로젝트)

프로젝트 노드에는 `category` 필드가 추가됩니다.

#### 카테고리 종류

| 카테고리   | 설명                       |
| ---------- | -------------------------- |
| `frontend` | 프론트엔드 프로젝트        |
| `backend`  | 백엔드 프로젝트            |
| `ai-ml`    | AI/ML 프로젝트             |
| `creative` | 크리에이티브/기타 프로젝트 |

#### 기본 구조

```json
{
  "id": "project-myproject",
  "type": "project",
  "category": "frontend",
  "label": "프로젝트명",
  "connections": ["skill-react", "skill-typescript"],
  "color": "#00D8FF",
  "details": {
    "description": "프로젝트 설명",
    "technologies": ["React", "TypeScript", "TailwindCSS"],

    "link": "https://github.com/...",
    "deployLink": "https://vercel.app/...",
    "blogLink": "https://blog.example.com/...",

    "features": [
      {
        "title": "주요 기능",
        "items": ["기능 1", "기능 2", "기능 3"]
      }
    ],

    "optimizations": [
      {
        "title": "성능 최적화",
        "items": ["최적화 내용 1", "최적화 내용 2"]
      }
    ],

    "challenges": [
      {
        "title": "문제 해결 경험",
        "problem": "발생했던 문제",
        "solution": "해결 방법"
      }
    ],

    "learnings": [
      {
        "title": "배운 점",
        "content": "프로젝트를 통해 배운 내용"
      }
    ],

    "techStackDocs": [
      {
        "name": "React",
        "description": "이 기술을 선택한 이유"
      }
    ],

    "coreFeatures": ["반응형", "다크모드", "접근성"],

    "codeExamples": [
      {
        "title": "코드 예시 제목",
        "category": "Hook",
        "description": "코드 설명",
        "filePath": "src/hooks/useExample.ts",
        "githubLink": "https://github.com/.../useExample.ts",
        "snippet": "const useExample = () => { ... }"
      }
    ]
  }
}
```

#### 논문/연구 프로젝트 추가 필드

```json
{
  "details": {
    "pdfLink": "https://..../paper.pdf",

    "references": [
      {
        "id": 1,
        "title": "참고 논문 제목",
        "authors": "저자명",
        "year": "2024",
        "source": "학회/저널명"
      }
    ],

    "performance": [
      {
        "title": "실험 결과",
        "description": "결과 설명",
        "image": "/images/result-graph.png",
        "headers": ["Model", "Accuracy", "F1-Score"],
        "rows": [
          ["LSTM", "92.3%", "0.91"],
          ["TFT", "95.1%", "0.94"]
        ]
      }
    ]
  }
}
```

---

### 3. Skill 노드 (기술 스택)

스킬 노드에는 `skillCategory` 필드가 추가됩니다.

#### 스킬 카테고리 종류

| 카테고리    | 설명            | 예시               |
| ----------- | --------------- | ------------------ |
| `language`  | 프로그래밍 언어 | Python, TypeScript |
| `framework` | 프레임워크      | React, FastAPI     |
| `library`   | 라이브러리      | Three.js, Pandas   |
| `tool`      | 도구            | Docker, Git        |
| `database`  | 데이터베이스    | PostgreSQL, Redis  |

#### 구조

```json
{
  "id": "skill-react",
  "type": "skill",
  "skillCategory": "framework",
  "label": "React",
  "connections": ["skill-typescript", "skill-zustand"],
  "color": "#61DAFB",
  "details": {
    "description": "React에 대한 설명 및 숙련도"
  }
}
```

---

### 4. Lesson 노드 (교훈/회고)

프로젝트에서 배운 교훈을 별도 노드로 표현할 때 사용합니다.

```json
{
  "id": "lesson-1",
  "type": "lesson",
  "label": "교훈 제목",
  "connections": ["project-1", "project-2"],
  "color": "#FFD700",
  "details": {
    "description": "교훈의 상세 내용"
  }
}
```

---

## 단계별 가이드

### Step 1: 메인 프로필 수정하기

1. `src/data/nodes.ko.json` 파일의 첫 번째 노드(`id: "me"`)를 찾습니다
2. `label`을 본인 이름으로 변경합니다
3. `details.personalInfo`에 개인 정보를 입력합니다
4. `details.profile`에 학력, 경력, 기술 스택을 입력합니다
5. `src/data/nodes.en.json` 파일도 동일하게 (영문으로) 수정합니다

```json
{
  "id": "me",
  "type": "main",
  "label": "Your Name",
  ...
}
```

### Step 2: 기존 프로젝트 수정하기

1. `type: "project"` 노드들을 찾습니다
2. 본인 프로젝트 정보로 수정하거나 삭제합니다
3. 연결된 스킬 노드 ID를 적절히 변경합니다

### Step 3: 새 프로젝트 추가하기

1. 파일 끝에 새 프로젝트 노드를 추가합니다:

```json
{
  "id": "project-newproject",
  "type": "project",
  "category": "frontend",
  "label": "새 프로젝트",
  "connections": ["skill-react"],
  "color": "#FF6B6B",
  "details": {
    "description": "프로젝트 설명",
    "technologies": ["React"],
    "link": "https://github.com/..."
  }
}
```

2. 메인 노드의 `connections`에 새 프로젝트 ID를 추가합니다:

```json
{
  "id": "me",
  "connections": [..., "project-newproject"]
}
```

### Step 4: 스킬 노드 추가/수정하기

```json
{
  "id": "skill-newskill",
  "type": "skill",
  "skillCategory": "framework",
  "label": "New Framework",
  "connections": ["skill-typescript"],
  "color": "#00D8FF",
  "details": {
    "description": "이 기술에 대한 설명"
  }
}
```

### Step 5: 노드 연결 설정하기

연결은 **양방향**으로 설정하는 것이 좋습니다. 다만, 시스템에서 자동으로 양방향 연결을 생성하므로 한 곳에서만 정의해도 됩니다. (예: `nodes.ko.json`의 한 노드에서만 다른 노드를 참조)

```json
// nodes.ko.json
{
  "id": "project-a",
  "connections": ["skill-react"]
}
```

---

## 테마 커스터마이징

### 색상 변경

`src/index.css`에서 CSS 변수를 수정합니다:

```css
:root {
  --color-main: #00ffff; /* 메인 강조색 */
  --color-accent: #ff00ff; /* 보조 강조색 */
  --glass-bg: rgba(10, 10, 30, 0.8); /* 글래스모피즘 배경 */
}
```

### 노드 색상

각 노드의 `color` 필드로 개별 색상을 지정할 수 있습니다:

```json
{
  "id": "skill-python",
  "color": "#3776AB" // Python 공식 색상
}
```

---

## 다국어 추가

### 1. UI 번역 파일 수정

`src/locales/` 폴더에 있는 JSON 파일을 수정합니다:

- `ko.json`: 한국어 UI 텍스트
- `en.json`: 영어 UI 텍스트

### 2. 노드 데이터 번역

`src/data/` 폴더의 데이터를 번역합니다:

- `nodes.ko.json`: 한국어 노드 상세 정보
- `nodes.en.json`: 영어 노드 상세 정보

### 3. 언어 추가 (선택)

새로운 언어(예: 일본어)를 추가하려면:

1. `src/locales/ja.json` 생성 및 UI 번역
2. `src/data/nodes.ja.json` 생성 및 노드 데이터 번역
3. `src/data/index.ts`에서 새 데이터 로드 및 등록
4. `src/i18n.ts`에서 새 로케일 등록
5. `src/components/ui/LanguageSwitcher.tsx`에 옵션 추가

---

## 💡 팁

### ID 네이밍 규칙

- **케밥케이스** 사용: `project-my-app`, `skill-react`
- **접두사** 사용: 타입별로 `project-`, `skill-`, `lesson-` 접두사 권장
- **고유성** 보장: 모든 ID는 유일해야 합니다

### 연결 최적화

- 너무 많은 연결은 시각적으로 복잡해집니다
- 프로젝트당 3-5개의 스킬 연결을 권장합니다
- 핵심 기술만 연결하고, 부가 기술은 `technologies` 배열에 나열하세요

### 색상 선택

- 공식 브랜드 색상 사용 권장 (React: #61DAFB, Python: #3776AB)
- 비슷한 색상의 노드가 너무 많지 않도록 주의하세요
- [Coolors](https://coolors.co/) 같은 색상 팔레트 도구 활용

---

## 📚 관련 문서

- [README.md](../README.md) - 프로젝트 개요
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [COMPONENTS.md](./COMPONENTS.md) - 컴포넌트 레퍼런스
