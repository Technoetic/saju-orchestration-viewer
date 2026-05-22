# 9 노드 2단계 모달 — 옵션 메뉴 → 파이프라인

**날짜**: 2026-05-23
**대상 repo**: `Technoetic/saju-orchestration-viewer` (로컬: `C:\Users\Admin\Desktop\사주\saju_orchestration_viewer`)
**기존 동작**: 9 `pipe-node` SVG 클릭 → 모달로 단일 파이프라인 SVG 표시
**변경 동작**: 9 `pipe-node` SVG 클릭 → 모달로 **옵션 메뉴 그리드** 표시 → 옵션 카드 클릭 → 모달 본문이 **해당 옵션 전용 파이프라인 SVG**로 전환

## 1. 결정 사항 (브레인스토밍 합의)

| Q | 결정 | 근거 |
|---|---|---|
| Q1 도입 범위 | **모든 9 노드** 2단계 강제 | 사용자 결정 |
| Q2 메뉴 데이터 출처 | **운영 `front/js/data/contents.js` 1:1 미러링** | 진실성·운영 정합 |
| Q3 mbti·clinical 대응 | 운영에 도사 없음 → **viewer 전용 옵션 정의 예외** | mbti 4학파 / clinical 8 척도 |
| Q4 옵션 파이프라인 작성 범위 | **모든 옵션 풀 작성** (~55 옵션 × ~10단계) | 발표 완성도 |
| Q5 단계 데이터 출처 | **본 시스템 실제 코드 경로 트레이싱** | ADR-010 사실성 분리 완전 정합 |

## 2. 아키텍처

```
pipe-node 클릭 (saju · dream · divination · star · face · palm · name · mbti · clinical)
    ↓
PipelineModal.open(key)
    ↓
state = { mode: 'menu', nodeKey: key }
    ↓
_renderMenu(key) — MENUS[key].items 카드 그리드 표시
    ↓
사용자가 옵션 카드 클릭 → optionKey 결정
    ↓
state = { mode: 'pipeline', nodeKey: key, optionKey }
    ↓
_renderPipeline(key, optionKey) — PIPELINES[key][optionKey].steps SVG 렌더
    ↓
"← 메뉴로" 버튼 → state.mode = 'menu' 복귀 (그리드 재표시)
```

**원칙**:
- 단일 모달 컨테이너 (`#pipe-modal-bg`) 재사용 — DOM 재생성 없음
- `PipelineModal` 클래스에 상태 추가, `_renderMenu()` / `_renderPipeline()` 두 책임 분리
- 데이터: 메뉴 = `menus.js` (신규), 파이프라인 = `pipelines.js` (구조 변경)

## 3. 파일 변경 일람

| 파일 | 변경 | 영향 |
|---|---|---|
| `assets/js/data/menus.js` | **신규** | 9 노드 옵션 메뉴 정의 (운영 contents.js 미러링 + mbti·clinical 자체) |
| `assets/js/data/pipelines.js` | **구조 변경** | `PIPELINES[key]` → `PIPELINES[key][optionKey]` 중첩, 옵션마다 ~10단계 풀 정의 |
| `assets/js/components/pipeline-modal.js` | **리팩토링** | 2단계 mode state + `_renderMenu()` + 옵션 클릭 핸들러 + back 버튼 |
| `assets/css/12-modal-steps.css` | **확장** | `.pipe-menu-grid`, `.pipe-menu-card`, `.pipe-modal-back` 스타일 |
| `index.html` | **무변경** | 모달 컨테이너·pipe-node SVG 그대로 |

## 4. 데이터 스키마

### 4-1. `menus.js`

```js
export const MENUS = {
  <nodeKey>: {
    master: '도사 이름' | '도메인 이름',
    masterSub: '한 줄 부제',
    items: [
      {
        key: 'optionKey',           // PIPELINES[node][key] 조회용
        name: '한글 이름',
        glyph: '漢 字',              // 한자 2자
        desc: '한 줄 설명 (60자 이내)',
        tier: 'free' | 'premium' | 'season',
        badges: ['hot'|'new'],      // 선택
        est: '⏱ 시간',              // 선택
      },
      // ...
    ]
  }
};
```

### 4-2. `pipelines.js` (구조 변경)

**기존 (단일)**:
```js
PIPELINES.saju = { title, hint, tagClass, steps: [...], foot }
```

**변경 후 (옵션 분기)**:
```js
PIPELINES.saju = {
  today:    { title: '오늘의 운세 파이프라인',   hint, tagClass: 'saju', steps: [...], foot },
  classic:  { title: '정통 사주 파이프라인 (14단계)', hint, tagClass: 'saju', steps: [...기존 14단계...], foot },
  year2026: { title: '2026 올해의 운세 파이프라인', hint, tagClass: 'saju', steps: [...], foot },
  // ... 9 옵션 더
};
```

기존 단일 파이프라인 9개는 자연스러운 옵션(예: 사주 → `classic`, mbti → `myers`)으로 **흡수**.

## 5. 노드 ↔ 옵션 매핑 (브레인스토밍 Q3 결과)

| viewer 노드 | 운영 도사 | 옵션 N | 출처 |
|---|---|---|---|
| `saju` | 만월 아씨 | 10 | contents.js#saju.items |
| `dream` | 몽이 도령 | 6 | contents.js#dream.items |
| `divination` | 화선 낭자 | 10 | contents.js#hwapae.items |
| `star` | 성하 공자 | 7 | contents.js#star.items |
| `face` | 운학 도사 | 6 | contents.js#face.items |
| `palm` | 옥선 할미 | 3 | contents.js#palm.items |
| `name` | 묵향 선생 | 6 | contents.js#name.items |
| `mbti` | (없음) | 4 | **viewer 전용**: jung·keirsey·socionics·myers |
| `clinical` | (없음) | 8 | **viewer 전용**: phq9·gad7·isi·psqi·bdik·cesd·staik·irt |

합계: **~60 옵션** (사용자 추산 55에서 변동 가능, contents.js 실측 기준)

## 6. 단계 데이터 작성 전략 (Q5 = A)

각 옵션의 ~10단계는 **본 시스템 실제 코드를 트레이싱하여 도출**한다. ADR-010 사실성 분리 원칙과 정합.

### 6-1. 트레이싱 소스

| 단계 종류 | 트레이싱 소스 |
|---|---|
| 입력 수집 | `front/js/data/contents.js`의 옵션별 `fields[]` 배열 |
| 결정론 분석 | `engine/<도메인>/*.py` (예: `engine/saju/explain.py`, `engine/divination/hwapae/*.py`, `engine/clinical/*.py`) |
| LLM 프롬프트 빌더 | `front/js/readers/<도메인>-reader.js`의 `build<도메인>Prompt`, `engine/agents/*` |
| 라우터 | `web/server.py` (예: `/api/saju/ask`, `/api/dream/interpret_v2`) |
| ADR 정합 | `vault/decisions/ADR-*.md` (chip 표시) |
| 면책·위기 신호 | `engine/safety/*.py` |
| 렌더 출력 | `front/js/readers/<도메인>-reader.js`의 `render*Result` |

### 6-2. 단계 카테고리 (모든 옵션 공통 골격)

```
1. 입력 (fields 트레이싱)
2~4. 결정론 분석 (engine 모듈별)
5~6. 백본 분석 (옵션별 추가 — 예: 사주 wealth → 재성·식상 분석)
7. LLM 프롬프트 빌더 (페르소나 + 결정론 주입)
8. POST /api/llm/chat (Gemini)
9. 위기·면책·ADR 후처리
10. 렌더 (페르소나 본문 + 시각화)
```

옵션별로 분량이 다를 수 있으므로 5~14단계 가변. `star` (단순 룩업) = 6단계, `dream` (HvDC + 20 에이전트) = 14단계 같이 자연 변동.

### 6-3. 단계 객체 스키마 (기존 그대로)

```js
{
  n: 1, t: '0s', title: '...', desc: '...', meta: '경로/근거',
  adr: ['ADR-002', 'ADR-014'],   // 선택
  star: true,                     // 강조 (선택)
  warn: true,                     // 면책·위기 신호 (선택)
  ok: true                        // 최종 출력 (선택)
}
```

## 7. UX 명세

### 7-1. 메뉴 화면 (mode = 'menu')

```
┌──────────────────────────────────────── × ┐
│ [도메인 태그] 도사/도메인 이름             │
│ 한 줄 부제                                  │
├────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ [무료]   │ │ [프리] [인기] │ │ [시즌]   │ │
│ │ 今 日   │ │ 四 柱       │ │ 丙 午    │ │
│ │ 오늘의 운세│ │ 정통 사주    │ │ 올해의 운세│ │
│ │ 일진 기반...│ │ 일주·오행... │ │ 병오년...│ │
│ │ ⏱ 5분    │ │ ⏱ 30~60초 │ │ ⏱ 5~10분│ │
│ └─────────┘ └─────────┘ └─────────┘       │
│ ... (N개)                                   │
├────────────────────────────────────────────┤
│ ESC 닫기 · 카드 클릭으로 파이프라인 보기   │
└────────────────────────────────────────────┘
```

- 카드 hover 시 `tone.main` 글로우 (도메인 톤 미러링)
- 카드 클릭 시 → 파이프라인 화면 전환

### 7-2. 파이프라인 화면 (mode = 'pipeline')

```
┌──────────────────────────────────────── × ┐
│ ← 메뉴로                                    │
│ [도메인 태그] 옵션 제목                     │
│ /api/... · 결정론 N% + LLM M회             │
├────────────────────────────────────────────┤
│                                              │
│   [기존 SVG 14단계 — 그대로]                │
│                                              │
├────────────────────────────────────────────┤
│ 결정론 본문 + ADR 정합 메시지              │
└────────────────────────────────────────────┘
```

- 기존 `_renderSteps()` / `_renderSvg()` 메서드 무수정 재사용
- "← 메뉴로" 버튼: `state.mode = 'menu'`로 전환 후 `_renderMenu()` 재호출

### 7-3. 키보드·접근성

- `Escape`: 모달 전체 닫기 (기존 동작 유지)
- 메뉴 모드 → "← 메뉴로" 버튼 없음 (이미 메뉴)
- 파이프라인 모드 → "← 메뉴로" 버튼 표시 + Backspace 키도 동일 동작
- 모달 백그라운드 클릭: 닫기 (기존)

## 8. 모듈 책임 분리

```
PipelineModal
├── state: { mode, nodeKey, optionKey }
├── init() — pipe-node 클릭 핸들러 + Escape + bg-click
├── open(nodeKey) — mode='menu' 진입
├── close() — 모달 닫기 + state reset
├── _renderMenu(nodeKey) — MENUS[nodeKey] 그리드 렌더 + 카드 클릭 핸들러
├── _renderPipeline(nodeKey, optionKey) — PIPELINES[nodeKey][optionKey] SVG 렌더 + back 핸들러
├── _renderSteps(data, tone) — 기존 그대로 (재사용)
├── _stepStyle(s, tone) — 기존 그대로
├── _renderAdrChips(...) — 기존 그대로
└── _renderSvg(...) — 기존 그대로
```

## 9. CSS 추가 (`12-modal-steps.css`)

```css
.pipe-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  padding: 20px 0;
}
.pipe-menu-card {
  background: rgba(19, 37, 26, 0.6);
  border: 1px solid var(--pipe-tone, #6dc375);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
}
.pipe-menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.18);
}
.pipe-menu-card .glyph { font-size: 22px; ... }
.pipe-menu-card .name  { font-size: 15px; font-weight: 700; ... }
.pipe-menu-card .desc  { font-size: 11px; color: #9b8c63; ... }
.pipe-menu-card .meta  { font-family: 'JetBrains Mono', monospace; ... }
.pipe-modal-back {
  background: none; border: 1px solid #6e5a26; color: #d4af37;
  padding: 4px 10px; cursor: pointer; border-radius: 6px;
}
```

도메인 톤은 인라인 style `--pipe-tone: <PIPELINE_TONES[key].main>`로 주입.

## 10. 데이터 동기화 (Q2 = A "운영 contents.js 미러링")

운영 `front/js/data/contents.js`는 본 viewer와 별도 git repo. 미러링 전략:

- **수동 복사 (v1)**: contents.js의 7 도사 items[] 배열을 menus.js로 옮길 때 viewer 호환 필드(`tier`/`badges`/`est`)만 추출. mbti·clinical은 viewer 전용 정의 추가.
- **자동 sync (향후 v2, YAGNI)**: 본 작업에서는 도입하지 않음. 운영 contents.js 변경 시 수동 PR.

미러링 시점 운영 contents.js의 **commit SHA**를 menus.js 헤더 주석에 기록 → 추적성 확보.

```js
// menus.js
// Mirrored from front/js/data/contents.js @ <commit-sha>
// 2026-05-23 기준 7 도사 × N옵션
```

## 11. 작업 순서 (Phase)

| Phase | 작업 | 산출물 |
|---|---|---|
| P1 | 9 도메인 코드 트레이싱 — 단계 풀 도출 (사용자 1회 검수) | 도메인별 단계 메모 (인메모리) |
| P2 | `menus.js` 작성 (7 미러 + 2 viewer 전용) | `assets/js/data/menus.js` |
| P3 | `pipelines.js` 구조 변경 — `PIPELINES[node][option]` 중첩 + 옵션별 단계 풀 적재 | `assets/js/data/pipelines.js` |
| P4 | `pipeline-modal.js` 리팩토링 — 2단계 mode + back 버튼 | `assets/js/components/pipeline-modal.js` |
| P5 | CSS 추가 — 메뉴 그리드 + 백 버튼 | `assets/css/12-modal-steps.css` |
| P6 | 로컬 브라우저 검증 (Playwright `pw_live_check.py` 활용) | 스크린샷 9 노드 × 일부 옵션 |
| P7 | 커밋 + push (viewer repo) | git log |

각 Phase는 별도 commit. 진행 중 발견되는 ADR 정합 이슈는 단계 객체의 `adr` 배열로 명시.

## 12. 회귀 우려·완화

| 우려 | 완화 |
|---|---|
| 옵션 클릭 시 SVG 재계산 비용 (모달 열림 후 60+ 클릭 가능) | `_renderPipeline()` 결과를 `Map<optionKey, html>`에 캐시 |
| 메뉴 화면에서 ESC 닫기 → 다음 열림 시 메뉴부터 시작? | YES — 의도. open()은 항상 mode='menu'로 시작 |
| 기존 파이프라인 URL 딥링크 (예: `?pipeline=saju`) | 현재 코드 미사용 — 영향 없음 |
| 모바일 그리드 (220px 카드 × 3열) | `auto-fill` + `minmax(220px, 1fr)`로 단열 자동 축소 |
| viewer 전용 mbti·clinical 옵션이 실제 본 시스템에 없는 카드로 오해 | menus.js mbti·clinical에 `viewer-only` 배지 추가 |

## 13. 비범위 (YAGNI)

- 옵션 검색·필터 — 옵션 ~60개지만 도메인별로 분산되어 그리드만으로 충분
- 옵션 즐겨찾기·최근 본 옵션 — 발표용 viewer 목적과 무관
- 모바일 전용 레이아웃 변형 — `auto-fill` 자동 축소로 충분
- 옵션 검색 URL 쿼리 파라미터 — 발표 흐름에선 노드 → 메뉴 → 옵션이 자연스러움
- 자동 sync — 운영 contents.js 변경 빈도 낮음, 수동 PR로 충분

## 14. 성공 기준

- [ ] 9 `pipe-node` 클릭 시 모달이 메뉴 그리드로 먼저 표시된다
- [ ] 메뉴 카드 ~60개가 운영 contents.js와 일치 (mbti·clinical 제외)
- [ ] 카드 클릭 시 해당 옵션의 ~10단계 파이프라인 SVG가 표시된다
- [ ] "← 메뉴로" 버튼 클릭 시 메뉴로 복귀한다
- [ ] ESC·백그라운드 클릭으로 모달이 닫힌다
- [ ] 모든 옵션의 단계가 실제 코드 경로(engine/web/front) 트레이싱 결과를 반영한다
- [ ] ADR-006·010·014 등 본 시스템 ADR 정합이 단계의 `adr` 배열로 표시된다
- [ ] 로컬 `python -m http.server` 또는 GitHub Pages에서 깨짐 없이 동작

## 15. 다음 단계

이 spec 승인 후 → **writing-plans** 스킬로 실행 계획 작성.
