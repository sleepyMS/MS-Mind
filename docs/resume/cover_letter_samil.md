# 자기소개서 - 삼일회계법인

> **지원 분야**: 웹 애플리케이션 풀스택 개발자
> **담당 업무**: Front-end/Back-end 신규 개발 및 개선, 기능/제품 로드맵 기획

---

## 1. 기술적 의견 제시 및 구현 전략 수립 역량

**'아키텍처 설계부터 배포까지' 전 과정을 주도한 경험이 있습니다.**

강남대학교 소프트웨어응용학부에서 4학기 연속 학부 수석을 유지하며 이론적 기반을 다졌고, **Cortex** 프로젝트(퀀트 투자 플랫폼, 1인 풀스택 개발)와 **강냉봇** 프로젝트(AI 챗봇, 프론트엔드 및 LLM RAG 시스템 담당)를 통해 실무 역량을 쌓았습니다.

Cortex 프로젝트는 **요구사항 분석 → 기술 스택 선정 → 아키텍처 설계 → 구현 → 배포**까지 전 과정을 독자적으로 수행했습니다. "실시간 금융 연산을 처리하면서 수백만 건의 시계열 데이터를 밀리초 단위로 조회"라는 기술적 과제를 해결하기 위해 **TimescaleDB Hypertables, CPU/IO 워커 분리, Generator 기반 백테스팅 엔진** 등의 구현 전략을 직접 수립하고 적용했습니다.

---

## 2. 웹 애플리케이션 개발 경험 (Front-end & Back-end)

### [Back-end: Python + FastAPI + PostgreSQL + Redis]

**Cortex 프로젝트**에서 FastAPI 기반 백엔드를 설계·구현했습니다:

| 기술                         | 적용 내용                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| **FastAPI**                  | Layered Architecture(Router → Service → Repository) 설계, Pydantic 런타임 데이터 검증 |
| **SQLAlchemy + Alembic**     | ORM 기반 모델 정의, DB 마이그레이션 버전 관리                                         |
| **PostgreSQL + TimescaleDB** | 수억 건 OHLCV 시계열 데이터 자동 청크 파티셔닝, 복합 인덱스 최적화                    |
| **Redis**                    | Celery 메시지 브로커, Pub/Sub 실시간 진행률 중계, 세션 캐싱                           |
| **Docker**                   | 단일 이미지로 API/CPU Worker/IO Worker 분리 배포                                      |

**핵심 성과:**

- **N+1 쿼리 문제 해결**: `selectinload`로 전략 목록 API 응답 1.2s → 0.1s (10배 개선)
- **CPU/IO 워커 물리적 분리**: 백테스팅 중에도 매매 주문 밀리초 체결 보장

### [Front-end: React + TypeScript + Tailwind CSS]

**Cortex 프로젝트**에서 Next.js 기반 프론트엔드를 설계·구현했습니다:

| 기술                         | 적용 내용                                        |
| ---------------------------- | ------------------------------------------------ |
| **React + Next.js**          | App Router, Server Components, 다국어(i18n) 지원 |
| **TypeScript**               | 엄격한 타입 정의로 런타임 오류 사전 방지         |
| **Tailwind CSS**             | 디자인 시스템 구축, 다크/라이트 모드 지원        |
| **Zustand + TanStack Query** | 전역 상태 관리, 서버 상태 캐싱 및 동기화         |

**강냉봇 프로젝트**에서 프론트엔드 및 RAG 시스템을 담당했습니다:

- **Lock & Queue 패턴**: Silent Auth Refresh로 401 에러 시 대기 중인 요청 일괄 재시도
- **Optimistic UI**: 서버 응답 전 UI 즉시 반영, 실패 시 롤백
- **RAG 시스템 구축**: 대학 강의 데이터 기반 검색 증강 생성 파이프라인 설계

---

## 3. REST API 및 외부 서비스 연동 경험

### REST API 설계 원칙

Cortex 프로젝트에서 **50개 이상의 REST API 엔드포인트**를 설계했습니다:

```python
# 예시: 백테스트 생성 API - 비동기 작업 패턴
@router.post("/backtests/", status_code=201)
async def create_backtest(payload: BacktestCreate, db: AsyncSession = Depends(get_db)):
    # 1. 요청 검증 및 DB 저장
    backtest = await backtest_service.create(db, payload)
    # 2. Celery 비동기 작업 위임 (Fire-and-Forget)
    run_backtest.delay(str(backtest.id))
    # 3. 작업 ID 즉시 반환 → 클라이언트는 WebSocket으로 진행률 구독
    return {"id": backtest.id, "status": "pending"}
```

### 외부 서비스 연동

| 서비스            | 연동 내용                                       |
| ----------------- | ----------------------------------------------- |
| **Binance API**   | 실시간 시세 조회, 주문 체결, WebSocket 스트리밍 |
| **Toss Payments** | 빌링키 등록, 정기 결제, Webhook 처리            |
| **Google OAuth**  | 소셜 로그인, 토큰 갱신                          |
| **OpenAI API**    | AI 챗봇 응답 생성 (강냉봇 프로젝트)             |

---

## 4. 웹 성능 최적화 및 UI/UX 개선 경험

### [성능 최적화 사례]

**Cortex 프로젝트:**

- **벡터 연산 백테스팅**: NumPy/Pandas로 45초 → 0.8초 (98% 단축)
- **Eager Loading**: N+1 쿼리 제거로 API 응답 10배 개선
- **bulk_insert_mappings**: Trial 1000개 저장 30초 → 2초 (15배 단축)

**강냉봇 프로젝트:**

- **Imperative Chart Update**: `chart.update()` 직접 호출로 React 렌더 사이클 우회
- **Memoization 최적화**: `useMemo`, `useCallback`으로 불필요한 리렌더링 방지

### [UI/UX 개선 사례]

- **실시간 피드백**: Redis Pub/Sub → WebSocket으로 백테스팅/AI 학습 진행률 실시간 표시
- **Parallel Coordinates Plot**: 수천 건의 최적화 Trial을 평행좌표 플롯으로 시각화
- **다크/라이트 모드**: Tailwind CSS `dark:` 클래스로 테마 전환 구현

---

## 5. 생성형 AI API 활용 경험

### [RAG 시스템 및 프론트엔드 - 강냉봇 프로젝트]

대학생을 위한 AI 시간표 생성 챗봇의 **프론트엔드와 RAG 시스템**을 담당했습니다:

- **Streaming Response**: `stream=True`로 타이핑 효과 구현
- **프롬프트 엔지니어링**: 사용자 의도 파악 및 구조화된 JSON 응답 유도
- **컨텍스트 관리**: 대화 히스토리 유지로 맥락 있는 응답 생성

### [AI Tool 활용 - 개발 생산성 향상]

Google Antigravity와 MCP 도구(Context7, Sequential Thinking)를 연동하여 **문서 검색 → 분석 → 테스트 자동화 워크플로우**를 구축했습니다. AI가 작성한 코드의 **보안성, 효율성, 정확성 검토 및 디버깅** 경험을 보유하고 있습니다.

---

## 6. 회사를 선택하는 기준과 삼일회계법인

저는 회사를 선택할 때 **세 가지 기준**을 중요하게 생각합니다.

### 1) 기술적 성장이 가능한 환경

단순 반복 작업이 아닌, **복잡한 문제를 해결하며 성장할 수 있는 환경**을 찾습니다. 삼일회계법인은 단순 CRUD가 아닌, 회계·감사라는 복잡한 도메인 로직을 시스템에 녹여내야 하는 환경입니다. 저는 Cortex 프로젝트에서 복식부기 크레딧 시스템, TimescaleDB 시계열 최적화, CPU/IO 워커 분리 등 **엔터프라이즈급 아키텍처**를 설계·구현한 경험이 있어, 이러한 복잡한 도메인에서 기술적으로 성장할 준비가 되어 있습니다.

### 2) 기술적 의견을 제시하고 함께 성장하는 문화

요구사항을 그대로 구현하는 것이 아닌, **"왜 이렇게 해야 하는가"를 함께 고민**할 수 있는 환경을 선호합니다. 삼일회계법인의 채용 공고에서 "신규 기능 및 제품 로드맵 기획 단계에서 기술적 의견을 제시"할 수 있는 인재를 찾고 있다는 점이 저의 가치관과 일치합니다. 저는 프로젝트에서 기술 스택 선정부터 아키텍처 설계까지 직접 결정하고 그 결과에 책임지는 경험을 해왔습니다.

### 3) 안정적인 도메인에서의 장기적 성장

금융·회계 도메인은 단기적 트렌드에 휩쓸리지 않고, **데이터 정합성과 시스템 안정성이 핵심 가치**인 분야입니다. 저는 Cortex에서 "귀찮아서 나중에"가 아닌 "처음부터 정확하게"를 원칙으로 삼아 Decimal 타입 정밀도, 복식부기 추적성, 비동기 작업 안정성을 구현했습니다. 이러한 경험이 회계법인의 시스템 개발에 직접적으로 기여할 수 있다고 확신합니다.

**결론적으로, 삼일회계법인은 복잡한 도메인 로직, 기술적 의견 존중 문화, 안정적인 성장 환경이라는 세 가지 기준을 모두 충족하는 곳입니다.**

---

## 7. 입사 지원 동기

삼일회계법인이 **웹 애플리케이션의 프론트엔드와 백엔드 전 과정을 다루는 풀스택 개발자**를 찾고 있다는 점이 저의 경험과 정확히 일치합니다.

저는 Cortex 프로젝트에서 **FastAPI + PostgreSQL + Redis 백엔드**와 **React + TypeScript + Tailwind CSS 프론트엔드**를 독자적으로 설계·구현한 경험이 있습니다. 특히 **회계법인이라는 도메인 특성상 데이터 정합성과 감사 추적이 중요**할 것으로 예상되는데, Cortex에서 구현한 **복식부기 크레딧 시스템**(Ledger/Transaction 분리, FIFO 우선순위 알고리즘)이 이러한 요구사항에 직접적으로 기여할 수 있습니다.

**신규 기능 및 제품 로드맵 기획** 단계에서 기술적 의견을 제시하고 구현 전략을 수립할 수 있는 역량을 바로 발휘하겠습니다.

---

## 8. 핵심 기술 스택

| 분류          | 기술                                                              |
| ------------- | ----------------------------------------------------------------- |
| **Languages** | Python, TypeScript, JavaScript, SQL                               |
| **Backend**   | FastAPI, SQLAlchemy, Alembic, Celery, Redis                       |
| **Database**  | PostgreSQL, TimescaleDB, Redis                                    |
| **Frontend**  | React, Next.js, TypeScript, Tailwind CSS, Zustand, TanStack Query |
| **DevOps**    | Docker, GitHub Actions, Vercel, AWS (EC2, S3)                     |
| **AI Tools**  | OpenAI API, Google Antigravity, Claude, Copilot                   |

---

## 9. 관련 프로젝트

- **[Cortex](https://github.com/sleepyMS/Cortex)**: AI 기반 퀀트 투자·자동매매 플랫폼 (1인 풀스택 개발)
- **[강냉봇](https://github.com/sleepyMS/KangNaengBot-FE)**: AI 시간표 생성 챗봇 (프론트엔드 + RAG 시스템 담당)
- **[Neural Portfolio](https://github.com/sleepyMS/MS-Mind)**: 3D 인터랙티브 포트폴리오 (Three.js, React)

---

> **"아키텍처 설계부터 배포까지 전 과정을 주도하며, 기술적 의견을 제시하고 구현 전략을 수립할 수 있는 풀스택 개발자"**
>
> 삼일회계법인의 웹 애플리케이션 개발에 즉시 기여할 준비가 되어 있습니다.
