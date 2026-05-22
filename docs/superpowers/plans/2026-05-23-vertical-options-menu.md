# 9 노드 2단계 모달 — 옵션 메뉴 → 파이프라인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `saju_orchestration_viewer`의 9 `pipe-node` 클릭 흐름을 "노드 → 모달의 옵션 메뉴 그리드 → 옵션 카드 클릭 → 옵션 전용 파이프라인 SVG" 2단계로 전환하고, ~60 옵션 × ~10단계 파이프라인을 본 시스템(`C:\Users\Admin\Desktop\사주`) 실제 코드 트레이싱 결과로 채운다.

**Architecture:** 기존 단일 모달 컨테이너 재사용. `PipelineModal`에 `state = { mode, nodeKey, optionKey }` 추가, `_renderMenu()` / `_renderPipeline()` 두 메서드 분리. 데이터는 `menus.js` 신규 + `pipelines.js` 중첩 구조 변경 (`PIPELINES[node][option]`). 단계 데이터는 본 시스템 `engine/*`, `web/server.py`, `front/js/readers/*`, `vault/decisions/ADR-*.md` 실제 코드 트레이싱.

**Tech Stack:** Vanilla JS ES modules · SVG · CSS. 빌드 도구 없음. 로컬은 `python -m http.server`, 배포는 GitHub Pages.

**Source-of-truth paths:**
- 운영 메뉴: `C:\Users\Admin\Desktop\사주\front\js\data\contents.js`
- 결정론 엔진: `C:\Users\Admin\Desktop\사주\engine\<domain>\*.py`
- 라우터: `C:\Users\Admin\Desktop\사주\web\server.py`
- 프론트 reader: `C:\Users\Admin\Desktop\사주\front\js\readers\<domain>-reader.js`
- ADR: `C:\Users\Admin\Desktop\사주\vault\decisions\ADR-*.md`
- viewer repo: `C:\Users\Admin\Desktop\사주\saju_orchestration_viewer`

---

## File Structure

**신규**
- `assets/js/data/menus.js` — 9 노드 옵션 메뉴 정의 (`MENUS` export). 운영 contents.js 7 도사 미러 + mbti·clinical viewer 전용.

**수정**
- `assets/js/data/pipelines.js` — 구조 변경: `PIPELINES[key]` → `PIPELINES[key][optionKey]` 중첩. 기존 9 단일 파이프라인은 자연 옵션(예: saju → `classic`, mbti → `myers`)으로 흡수.
- `assets/js/components/pipeline-modal.js` — 2단계 mode 분기, `_renderMenu()`, back 버튼.
- `assets/css/12-modal-steps.css` — `.pipe-menu-grid`, `.pipe-menu-card`, `.pipe-modal-back` 추가.

**무변경**
- `index.html` — 모달 컨테이너 그대로, pipe-node SVG 그대로.
- `assets/js/main.js`, `assets/js/config.js`, `assets/js/utils.js` — 무변경.

---

## Task 1: 기존 모달 회귀 baseline 캡처

**목적:** 기존 동작(노드 클릭 → 단일 파이프라인)을 스크린샷으로 캡처. 리팩토링 후 옵션 클릭 시 동일 결과인지 비교용.

**Files:**
- Read: `pw_modal_check.py` (기존 Playwright 스크립트, 모달 자동화 참고)
- Create: `pw_work/baseline_<node>.png` (9장, 각 노드 클릭 후 모달 캡처)

- [ ] **Step 1: 로컬 서버 띄우기**

```bash
cd "c:/Users/Admin/Desktop/사주/saju_orchestration_viewer"
python -m http.server 9876 &
```

Expected: `Serving HTTP on :: port 9876`

- [ ] **Step 2: 기존 Playwright 스크립트 참고하여 baseline 캡처 스크립트 작성**

`pw_work/capture_baseline.py` 작성. 9 노드(`saju · mbti · dream · divination · clinical · face · palm · name · star`)를 순회하며 모달 열고 캡처.

```python
import asyncio
from playwright.async_api import async_playwright

NODES = ['saju', 'mbti', 'dream', 'divination', 'clinical', 'face', 'palm', 'name', 'star']

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1400, 'height': 1800})
        await page.goto('http://localhost:9876/')
        await page.wait_for_selector('.pipe-node')
        for key in NODES:
            await page.click(f'[data-pipeline="{key}"]')
            await page.wait_for_selector('.pipe-modal-bg.open', timeout=3000)
            await page.wait_for_timeout(400)
            await page.screenshot(path=f'pw_work/baseline_{key}.png', full_page=True)
            await page.click('.pipe-modal-close')
            await page.wait_for_timeout(200)
        await browser.close()

asyncio.run(main())
```

- [ ] **Step 3: 실행하여 9장 캡처**

Run: `python pw_work/capture_baseline.py`
Expected: `pw_work/baseline_saju.png` ~ `pw_work/baseline_star.png` 생성 (9장)

- [ ] **Step 4: 커밋**

```bash
git add pw_work/capture_baseline.py
git commit -m "test: baseline capture script for 9 nodes (pre-2-stage modal)"
```

> 주의: `pw_work/`는 `.gitignore` 됨. 스크립트만 커밋. PNG는 로컬 참고용.

---

## Task 2: `menus.js` 신규 — 빈 골격

**목적:** 9 노드 옵션 메뉴 데이터 파일을 골격으로 먼저 생성. 추후 Task 3~11에서 도메인별로 채움.

**Files:**
- Create: `assets/js/data/menus.js`

- [ ] **Step 1: 빈 골격 작성**

```js
// assets/js/data/menus.js
// 9 pipe-node 클릭 시 모달 상단에 표시되는 옵션 메뉴 정의.
// 7 노드(saju·dream·divination·star·face·palm·name)는 운영 front/js/data/contents.js 1:1 미러.
// 2 노드(mbti·clinical)는 viewer 전용 정의 (운영 contents.js에 대응 도사 없음).
// 본 파일 각 항목의 'key' 값은 PIPELINES[<node>][<key>] 조회 키와 일치해야 한다.

export const MENUS = {
  saju:       { master: '만월 아씨', masterSub: '60갑자 사주 풀이',         items: [] },
  dream:      { master: '몽이 도령', masterSub: '꿈해몽 + HvDC 멀티에이전트', items: [] },
  divination: { master: '화선 낭자', masterSub: '꽃패·타로·주역',           items: [] },
  star:       { master: '성하 공자', masterSub: '서양 점성술 + 동양 28수',   items: [] },
  face:       { master: '운학 도사', masterSub: 'Opus Vision + 결정론 관상', items: [] },
  palm:       { master: '옥선 할미', masterSub: '4대선 + 금성대',           items: [] },
  name:       { master: '묵향 선생', masterSub: '대법원 9389 한자 작명',    items: [] },
  mbti:       { master: 'MBTI 프로필러', masterSub: '4학파 룩업 (viewer 전용)', items: [] },
  clinical:   { master: '임상 스크리닝', masterSub: '8 표준 척도 (viewer 전용)', items: [] },
};
```

- [ ] **Step 2: 커밋**

```bash
git add assets/js/data/menus.js
git commit -m "feat(menus): empty scaffold for 9-node option menus"
```

---

## Task 3: `pipeline-modal.js` 리팩토링 — 2단계 mode 분기 + back 버튼

**목적:** 모달이 메뉴 그리드 → 옵션 클릭 → 파이프라인 두 화면을 전환하도록 변경. 기존 SVG 단계 렌더 메서드(`_renderSteps` 등)는 그대로 재사용.

**Files:**
- Modify: `assets/js/components/pipeline-modal.js`

- [ ] **Step 1: 파일 헤더에 MENUS import 추가**

`assets/js/components/pipeline-modal.js` 상단 1행 `import { PIPELINES } from "../data/pipelines.js";` 다음 줄에 추가:

```js
import { MENUS } from "../data/menus.js";
```

- [ ] **Step 2: 생성자에 state 추가**

`constructor()` 안 마지막에 추가:

```js
    this.state = { mode: 'menu', nodeKey: null, optionKey: null };
    this.boundOnBackClick = () => this._goBackToMenu();
```

- [ ] **Step 3: `open()` 메서드를 메뉴 모드 진입으로 교체**

기존 `open(key)` 메서드(34~56줄)를 다음으로 교체:

```js
  open(nodeKey) {
    this.state = { mode: 'menu', nodeKey, optionKey: null };
    this._renderMenu(nodeKey);
    this.bg.classList.add("open");
    document.body.style.overflow = "hidden";
  }
```

- [ ] **Step 4: `_renderMenu()` 메서드 추가 (open() 바로 아래에)**

```js
  _renderMenu(nodeKey) {
    const menu = MENUS[nodeKey];
    const tone = PIPELINE_TONES[nodeKey] || DEFAULT_TONE;
    if (!menu) {
      this.body.innerHTML = `<p style="color:#ff7a7a">MENUS["${nodeKey}"] 미정의</p>`;
      return;
    }
    const tagClass = nodeKey;
    const cards = (menu.items || []).map(item => this._renderMenuCard(item, tone)).join('');
    const empty = (menu.items || []).length === 0
      ? `<div style="grid-column:1/-1;text-align:center;color:#9b8c63;padding:40px 0">옵션 메뉴 준비 중</div>` : '';

    this.body.innerHTML = `
      <button class="pipe-modal-close" id="pipe-modal-close" aria-label="close">×</button>
      <div class="pipe-modal-head">
        <span class="pipe-modal-tag ${tagClass}">${nodeKey.toUpperCase()}</span>
        <h3>${menu.master}</h3>
        <span class="pipe-modal-hint">${menu.masterSub || ''}</span>
      </div>
      <div class="pipe-menu-grid" style="--pipe-tone:${tone.main}">
        ${cards}
        ${empty}
      </div>
      <div class="pipe-modal-foot">카드 클릭 → 옵션 전용 파이프라인 SVG · ESC 닫기</div>
    `;
    document.getElementById("pipe-modal-close").addEventListener("click", () => this.close());
    this.body.querySelectorAll('.pipe-menu-card').forEach(card => {
      card.addEventListener('click', () => {
        const optionKey = card.getAttribute('data-option');
        this._goToPipeline(nodeKey, optionKey);
      });
    });
  }

  _renderMenuCard(item, tone) {
    const badges = [];
    if (item.tier === 'free')    badges.push(`<span class="badge badge-free">무료</span>`);
    if (item.tier === 'premium') badges.push(`<span class="badge badge-premium">프리미엄</span>`);
    if (item.tier === 'season')  badges.push(`<span class="badge badge-season">시즌</span>`);
    (item.badges || []).forEach(b => {
      if (b === 'hot') badges.push(`<span class="badge badge-hot">인기</span>`);
      if (b === 'new') badges.push(`<span class="badge badge-new">NEW</span>`);
      if (b === 'viewer-only') badges.push(`<span class="badge badge-viewer">viewer</span>`);
    });
    const tierIcon = item.tier === 'premium' ? '💎' : item.tier === 'season' ? '🌸' : '☆';
    return `
      <button class="pipe-menu-card" type="button" data-option="${item.key}">
        <div class="pipe-menu-card-badges">${badges.join('')}</div>
        <div class="pipe-menu-card-glyph">${item.glyph || ''}</div>
        <div class="pipe-menu-card-name">${item.name}</div>
        <p class="pipe-menu-card-desc">${item.desc || ''}</p>
        <div class="pipe-menu-card-meta">
          <span>⏱ ${item.est || '몇 분'}</span>
          <span>${tierIcon}</span>
        </div>
      </button>
    `;
  }
```

- [ ] **Step 5: `_goToPipeline()` / `_goBackToMenu()` 추가**

`_renderMenu()` 아래에 추가:

```js
  _goToPipeline(nodeKey, optionKey) {
    this.state = { mode: 'pipeline', nodeKey, optionKey };
    this._renderPipeline(nodeKey, optionKey);
  }

  _goBackToMenu() {
    if (!this.state.nodeKey) return;
    this.state.mode = 'menu';
    this.state.optionKey = null;
    this._renderMenu(this.state.nodeKey);
  }
```

- [ ] **Step 6: 기존 모달 본문 렌더를 `_renderPipeline()`으로 추출**

기존 `open()` 본문(SVG 렌더 부분)을 `_renderPipeline(nodeKey, optionKey)`로 이동:

```js
  _renderPipeline(nodeKey, optionKey) {
    const nodeBucket = PIPELINES[nodeKey];
    const data = nodeBucket && nodeBucket[optionKey];
    const tone = PIPELINE_TONES[nodeKey] || DEFAULT_TONE;
    if (!data) {
      this.body.innerHTML = `
        <button class="pipe-modal-close" id="pipe-modal-close" aria-label="close">×</button>
        <button class="pipe-modal-back" id="pipe-modal-back">← 메뉴로</button>
        <div class="pipe-modal-head">
          <span class="pipe-modal-tag ${nodeKey}">${nodeKey.toUpperCase()}</span>
          <h3>${optionKey} (파이프라인 준비 중)</h3>
        </div>
        <p style="padding:40px 0;text-align:center;color:#9b8c63">PIPELINES["${nodeKey}"]["${optionKey}"] 미정의</p>
      `;
      document.getElementById("pipe-modal-close").addEventListener("click", () => this.close());
      document.getElementById("pipe-modal-back").addEventListener("click", this.boundOnBackClick);
      return;
    }

    const { stepGroups, totalH } = this._renderSteps(data, tone);
    const svg = this._renderSvg(stepGroups, totalH);

    this.body.innerHTML = `
      <button class="pipe-modal-close" id="pipe-modal-close" aria-label="close">×</button>
      <button class="pipe-modal-back" id="pipe-modal-back">← 메뉴로</button>
      <div class="pipe-modal-head">
        <span class="pipe-modal-tag ${data.tagClass || nodeKey}">${nodeKey.toUpperCase()}</span>
        <h3>${data.title}</h3>
        <span class="pipe-modal-hint">${data.hint || ''}</span>
      </div>
      <div class="pipe-svg-wrap">${svg}</div>
      <div class="pipe-modal-foot">${data.foot || ''}</div>
    `;
    document.getElementById("pipe-modal-close").addEventListener("click", () => this.close());
    document.getElementById("pipe-modal-back").addEventListener("click", this.boundOnBackClick);
  }
```

- [ ] **Step 7: `close()` 메서드 state reset 추가**

```js
  close() {
    this.bg.classList.remove("open");
    document.body.style.overflow = "";
    this.state = { mode: 'menu', nodeKey: null, optionKey: null };
  }
```

- [ ] **Step 8: PIPELINE_TONES, DEFAULT_TONE import 확인**

상단 `import { PIPELINE_TONES, DEFAULT_TONE } from "../config.js";`이 이미 존재 — 그대로 둠.

- [ ] **Step 9: 로컬에서 한 번 열어보기 (Task 4·5 전 sanity check)**

로컬 서버에서 `pipe-node` 클릭 → 모달이 비어 보이고 "옵션 메뉴 준비 중" 메시지가 떠야 한다 (menus.js items가 비어 있으므로).

- [ ] **Step 10: 커밋**

```bash
git add assets/js/components/pipeline-modal.js
git commit -m "feat(modal): 2-stage state machine — menu mode + pipeline mode + back button"
```

---

## Task 4: `pipelines.js` 구조 변경 — 기존 9 단일을 옵션 흡수

**목적:** 기존 `PIPELINES.saju = {...}` (단일) → `PIPELINES.saju = { classic: {...} }` (중첩). 각 노드의 기존 단일을 자연 옵션 키로 흡수해 무손실 변환.

**옵션 키 흡수 매핑:**
| node | 기존 단일 → 옵션 키 (Phase 5~11에서 진짜 옵션 풀로 확장) |
|---|---|
| saju | `classic` (정통 사주 = 기존 14단계 그대로) |
| dream | `classic` (정통 꿈 풀이 = 기존 10단계 그대로) |
| divination | `classic` (정통 꽃패 풀이 = 기존 8단계 그대로) |
| star | `classic` (정통 별빛 풀이 = 기존 8단계 그대로) — 백엔드 미구현 주석 보존 |
| face | `classic` (정통 관상 = 기존 14단계 그대로) |
| palm | `classic` (정통 손금 풀이 = 기존 8단계 그대로) |
| name | `classic` (정통 작명 = 기존 9단계 그대로) |
| mbti | `myers` (16유형 Myers-Briggs = 기존 6단계 그대로) |
| clinical | `phq9` (PHQ-9 = 기존 7단계 그대로) |

**Files:**
- Modify: `assets/js/data/pipelines.js` (전체 구조 변환)

- [ ] **Step 1: pipelines.js 전체 읽기 (현재 158줄)**

Read: `assets/js/data/pipelines.js` (전체)

- [ ] **Step 2: 각 노드의 기존 단일을 옵션 흡수로 변환**

`PIPELINES.saju = { title, hint, tagClass, steps, foot }` 를 다음으로 교체:

```js
  saju: {
    classic: {
      title: "정통 사주 (만월 아씨)",
      hint: "/api/saju · 결정론 80% + LLM 자연어 1회",
      tagClass: "saju",
      steps: [/* 기존 14단계 그대로 */],
      foot: "관상(서버 100%) vs 사주(클라이언트 80%) — 결정론이 본질, LLM은 어조 변환"
    },
  },
```

같은 패턴으로 9 노드 모두 변환. **steps 배열 내용은 일자불변, 한 단계 객체도 수정 금지.** 변경은 오직 outer 키 한 단계 추가뿐.

- [ ] **Step 3: 옵션 미정의 노드(현재로선 없음) placeholder 처리**

해당 없음. Task 5~11에서 옵션 풀 추가 시 동일 패턴.

- [ ] **Step 4: 로컬에서 9 노드 → `classic`(또는 흡수 키) 옵션 카드 1개 보이는지 확인**

이 시점에는 menus.js items이 비어 있으므로 "옵션 메뉴 준비 중" 표시. Task 5에서 menus.js를 채우면 카드가 보임. 본 Task는 pipelines.js 구조만 바꾼 상태.

- [ ] **Step 5: 커밋**

```bash
git add assets/js/data/pipelines.js
git commit -m "refactor(pipelines): nest existing 9 pipelines under classic/myers/phq9 option keys"
```

---

## Task 5: CSS — 메뉴 그리드 + back 버튼

**목적:** 운영 `menu-content.css` 톤을 미러링하면서 viewer 다이어그램 톤과 정합되는 그리드·카드·back 버튼 스타일.

**Files:**
- Modify: `assets/css/12-modal-steps.css` (끝에 추가)

- [ ] **Step 1: 12-modal-steps.css 끝에 다음 추가**

```css

/* ===== 옵션 메뉴 그리드 (2단계 모달 stage 1) ===== */
.pipe-menu-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));
  gap:14px;
  padding:8px 0 4px;
}
.pipe-menu-card{
  position:relative;
  background:rgba(19,37,26,.35);
  border:1px solid var(--pipe-tone, #6dc375);
  border-radius:12px;
  padding:18px 16px 14px;
  cursor:pointer;
  text-align:left;
  color:var(--text);
  font-family:'Noto Serif KR',serif;
  transition:transform .15s ease, box-shadow .2s ease, background .2s ease;
}
.pipe-menu-card:hover{
  transform:translateY(-3px);
  box-shadow:0 8px 24px rgba(212,175,55,.18);
  background:rgba(19,37,26,.55);
}
.pipe-menu-card-badges{
  display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;min-height:18px;
}
.pipe-menu-card-badges .badge{
  font-size:9px;font-family:'JetBrains Mono',monospace;
  padding:2px 6px;border-radius:6px;letter-spacing:.5px;
}
.pipe-menu-card-badges .badge-free   {background:rgba(141,226,141,.12);color:#8de28d;border:1px solid #8de28d}
.pipe-menu-card-badges .badge-premium{background:rgba(244,211,94,.12);color:#f4d35e;border:1px solid #f4d35e}
.pipe-menu-card-badges .badge-season {background:rgba(255,158,181,.12);color:#ff9eb5;border:1px solid #ff9eb5}
.pipe-menu-card-badges .badge-hot    {background:rgba(255,122,122,.12);color:#ff7a7a;border:1px solid #ff7a7a}
.pipe-menu-card-badges .badge-new    {background:rgba(111,184,255,.12);color:#6fb8ff;border:1px solid #6fb8ff}
.pipe-menu-card-badges .badge-viewer {background:rgba(208,208,208,.10);color:#d0d0d0;border:1px solid #d0d0d0}
.pipe-menu-card-glyph{
  font-size:20px;color:var(--pipe-tone, #6dc375);
  font-family:'Noto Serif KR',serif;font-weight:700;
  letter-spacing:4px;margin-bottom:6px;
}
.pipe-menu-card-name{
  font-size:15px;font-weight:700;color:var(--text);margin:2px 0 6px;
}
.pipe-menu-card-desc{
  font-size:11px;color:var(--text-dim);line-height:1.55;margin:0 0 8px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}
.pipe-menu-card-meta{
  display:flex;justify-content:space-between;align-items:center;
  font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-mute);
  border-top:1px dashed rgba(212,175,55,.12);padding-top:6px;
}

/* ===== 메뉴로 돌아가기 버튼 (stage 2 → stage 1) ===== */
.pipe-modal-back{
  position:absolute;top:18px;left:24px;
  background:none;border:1px solid var(--gold-dim);
  color:var(--gold-dim);font-size:12px;
  padding:4px 12px;border-radius:14px;cursor:pointer;
  font-family:'JetBrains Mono',monospace;
  transition:color .2s, border-color .2s, background .2s;
}
.pipe-modal-back:hover{
  color:var(--gold-bri);border-color:var(--gold-bri);
  background:rgba(212,175,55,.08);
}

@media (max-width:720px){
  .pipe-menu-grid{grid-template-columns:1fr 1fr;gap:10px}
  .pipe-menu-card{padding:14px 12px 10px}
  .pipe-menu-card-name{font-size:13px}
  .pipe-modal-back{font-size:10px;padding:3px 8px}
}
```

- [ ] **Step 2: 로컬 브라우저로 시각 확인 (menus.js 비어있어도 그리드 컨테이너 자체는 노출)**

`pipe-node[data-pipeline="saju"]` 클릭 → 모달에 `← 메뉴로` 버튼이 보이지 않아야 하고(아직 menu 모드라 back 없음), "옵션 메뉴 준비 중" 메시지가 표시.

- [ ] **Step 3: 커밋**

```bash
git add assets/css/12-modal-steps.css
git commit -m "feat(css): menu grid + back button styles (2-stage modal)"
```

---

## Task 6: 도메인 1 — `saju` (만월 아씨, 10 옵션)

**목적:** 사주 10 옵션의 menus.js 항목 + 옵션별 ~10단계 pipelines.js 풀 작성. 본 시스템 실제 코드 트레이싱.

**트레이싱 소스 (사주):**
- `C:\Users\Admin\Desktop\사주\engine\saju\*.py` (만세력·신살·십성·운성, 6133줄)
- `C:\Users\Admin\Desktop\사주\engine\saju\explain.py`
- `C:\Users\Admin\Desktop\사주\front\js\core\saju-engine.js`
- `C:\Users\Admin\Desktop\사주\front\js\ui\content-system.js` (옵션별 입력 필드)
- `C:\Users\Admin\Desktop\사주\front\js\data\contents.js` saju.items (10건)
- `C:\Users\Admin\Desktop\사주\web\server.py` (`/api/saju*` 라우터)
- `C:\Users\Admin\Desktop\사주\vault\decisions\ADR-002·013·014·015·027·031·041·130·131·134·141.md` (사주 관련)

**옵션 목록 (운영 contents.js saju.items 미러):**
1. `today` 오늘의 운세 (무료·인기·5분)
2. `classic` 정통 사주 (무료·30~60초) — Task 4에서 흡수, 단계 풀 그대로
3. `year2026` 올해의 운세 2026 (시즌·인기·5~10분)
4. `wealth` 재물 사주 (프리미엄·5~10분)
5. `love` 연애 사주 (프리미엄·인기·5~10분)
6. `marriage` 결혼 사주 (프리미엄·5~10분)
7. `career` 직업 사주 (프리미엄·5~10분)
8. `suneung` 수능 운세 (시즌·NEW·5분)
9. `moving` 이사 사주 (프리미엄·5분)
10. `lifetime` 평생 운세 보감 (프리미엄·인기·15~20분)

**Files:**
- Modify: `assets/js/data/menus.js` (saju.items 10건 추가)
- Modify: `assets/js/data/pipelines.js` (saju 하위에 옵션 9개 추가, classic은 이미 있음)

- [ ] **Step 1: 사주 도메인 코드 트레이싱**

다음 파일들을 읽고 옵션별 차이점을 메모(머릿속 또는 임시 스크래치). 각 옵션은 공통 백본(60갑자·analyzeSaju·LLM)을 공유하되 입력 필드·LLM 프롬프트·렌더가 다르므로 그 차이를 단계 객체로 표현한다.

```
Read: front/js/data/contents.js (라인 9~165, saju 정의)
Read: front/js/core/saju-engine.js (전체)
Read: engine/saju/explain.py (analyzeSaju 함수)
Read: web/server.py (/api/saju, /api/saju/ask, /api/saju/fusion 라우터)
Read: vault/decisions/INDEX.md (saju 관련 ADR 항목)
Read: vault/decisions/ADR-002-saju-option-A.md (학파 회피)
Read: vault/decisions/ADR-014-saju-mbti-prediction-exception.md
Read: vault/decisions/ADR-015-saju-option-B-eokbu.md
Read: vault/decisions/ADR-031-... (있다면)
Read: vault/decisions/ADR-130/131/134/141-*.md (최근 사주 보강 ADR)
```

- [ ] **Step 2: menus.js의 saju.items 채우기**

`assets/js/data/menus.js`의 `saju.items` 배열을 운영 contents.js saju.items와 정합되게 채운다. 운영 desc·glyph·tier·badges·est를 그대로 미러.

```js
  saju: {
    master: '만월 아씨',
    masterSub: '60갑자 사주 풀이 · 결정론 80% + LLM 자연어',
    items: [
      { key:'today',    name:'오늘의 운세',      glyph:'今 日', tier:'free',    badges:['hot'], est:'5분',     desc:'일진(日辰) 기반으로 오늘 하루의 흐름을 가볍게 짚어드립니다.' },
      { key:'classic',  name:'정통 사주',        glyph:'四 柱', tier:'free',    badges:[],      est:'30~60초', desc:'일주·오행·십신·신살 등 사주의 기본 골격을 정확히 풀어드립니다.' },
      { key:'year2026', name:'올해의 운세 (2026)', glyph:'丙 午', tier:'season', badges:['hot'],est:'5~10분',  desc:'병오년 2026년의 12개월 흐름과 신년 운세를 자세히 풀어드립니다.' },
      { key:'wealth',   name:'재물 사주',        glyph:'財 寶', tier:'premium', badges:[],      est:'5~10분',  desc:'평생 재물운의 흐름·부자가 될 시기·적합한 재테크 방식을 짚어드립니다.' },
      { key:'love',     name:'연애 사주',        glyph:'緣 月', tier:'premium', badges:['hot'],est:'5~10분',  desc:'연애 스타일·이상형·인연이 오는 시기를 사주 깊이 분석으로 풀어드립니다.' },
      { key:'marriage', name:'결혼 사주',        glyph:'婚 緣', tier:'premium', badges:[],      est:'5~10분',  desc:'결혼할 시기·좋은 배우자상·결혼 후 운세·자녀운을 풀어드립니다.' },
      { key:'career',   name:'직업 사주',        glyph:'職 業', tier:'premium', badges:[],      est:'5~10분',  desc:'적성에 맞는 직업·성공할 직장 형태·사업 vs 직장 선택을 짚어드립니다.' },
      { key:'suneung',  name:'수능 운세',        glyph:'科 擧', tier:'season',  badges:['new'],est:'5분',     desc:'입시생 대상 — 수능 당일 운세·합격 가능성·시험운을 짚어드립니다.' },
      { key:'moving',   name:'이사 사주',        glyph:'移 居', tier:'premium', badges:[],      est:'5분',     desc:'이사 길일·좋은 방위·이사 후 운세를 짚어드립니다.' },
      { key:'lifetime', name:'평생 운세 보감',   glyph:'一 生', tier:'premium', badges:['hot'],est:'15~20분', desc:'평생 대운 흐름(10년 단위)·인생 그래프·황금기/시련기를 종합 풀이서로 드립니다.' },
    ]
  },
```

- [ ] **Step 3: pipelines.js의 saju 옵션 9개 추가 (classic 외)**

`PIPELINES.saju` 안에 9 옵션 추가. 각 옵션의 steps 배열은 **본 시스템 실제 코드 트레이싱**으로 도출. 단계 객체 스키마는 기존과 동일 (`{n, t, title, desc, meta, adr?, star?, warn?, ok?}`).

**`today` 단계 (예시 골격, 트레이싱 결과로 조정)**:

```js
    today: {
      title: "오늘의 운세 (만월 아씨)",
      hint: "/api/saju/today · 일진(日辰) 기반 가벼운 풀이",
      tagClass: "saju",
      steps: [
        {n:1, t:"0s",    title:"사용자 입력 — 생년월일 + 성별 (시각 선택)", desc:"올해의 운세와 달리 시각·이름·한자 미요구. 오늘 일진만 보면 됨.", meta:"front contents.js#today.fields"},
        {n:2, t:"0.05s", title:"오늘 일진(日辰) 자동 계산", desc:"클라이언트 시계 → 오늘 천간·지지 60갑자 (서버 시간 무관, 단말 기준).", meta:"engine/saju/calendar"},
        {n:3, t:"0.1s",  title:"사용자 사주 4주 산출 (시각 미정 시 3주)", desc:"동일 결정론 백본. 시각 미정이면 시주 제외.", meta:"engine/saju/explain.py"},
        {n:4, t:"0.2s",  title:"일진 ↔ 일주 합·충·형·해 매핑", desc:"오늘 일진(천간·지지) × 사용자 일주의 12 신살 룩업. ADR-002 옵션 A 디폴트.", meta:"ADR-002", adr:["ADR-002"], star:true},
        {n:5, t:"0.3s",  title:"십성·운성 단축 분석", desc:"평생 사주가 아닌 오늘 하루 → 십성·운성 1주만 보고 간략 분석.", meta:"단축 explain"},
        {n:6, t:"0.4s",  title:"buildSajuPrompt (today 모드)", desc:"만월 아씨 페르소나 + 일진 결정론 데이터 주입. 가벼운 어조 옵션.", meta:"front buildSajuPrompt(mode='today')", adr:["ADR-014"]},
        {n:7, t:"1~5s",  title:"POST /api/llm/chat — Gemini Flash Lite", desc:"오늘의 운세는 짧게 (200~400자). 다른 옵션 대비 LLM 시간 최단.", meta:"Bizrouter google/gemini-2.5-flash-lite", star:true},
        {n:8, t:"5.1s",  title:"위기 신호 + 법적 면책", desc:'1393·1577-0199 + 자문 거절. ADR-006·014 정합.', meta:"ADR-006·014", adr:["ADR-006","ADR-014"], warn:true},
        {n:9, t:"5.2s",  title:"렌더링 — 오늘 일진 카드 + 짧은 본문", desc:"오늘 천간·지지 + 합·충·형·해 1~2건 + 만월 아씨 한 문단.", meta:"renderSajuResult(mode='today')", ok:true},
      ],
      foot: "오늘의 운세는 일진 1축. 평생 사주와 동일 백본이되 깊이 축소·LLM 짧음."
    },
```

> **주의 — 트레이싱 의무**: 위 today 단계는 예시 골격이다. 실제 코드 트레이싱 결과(`engine/saju/calendar.py`의 일진 함수 존재 여부, `buildSajuPrompt`가 mode 파라미터를 받는지, `/api/saju/today` 라우트가 실제로 있는지)와 맞지 않으면 단계 객체의 `meta`·`desc`·`title`을 코드 진실에 맞게 수정한다. 라우트가 없으면 `web/server.py /api/saju + 클라이언트 today 모드` 식으로 정직히 표기.

**나머지 8 옵션(year2026·wealth·love·marriage·career·suneung·moving·lifetime)** — 동일 방식으로 각각 9~12단계 작성. 옵션마다 핵심 차이:

- `year2026`: 세운 12개월 강조, 신년 보감 어조 (입춘 기준), 평생 대운 1순환 강조
- `wealth`: 재성(財星)·식상(食傷)·관성(官星) 분석 강조, `concern` 입력 → 프롬프트 컨텍스트
- `love`: 일지(日支) 배우자궁 + 도화·홍염, `status`(현재 상태) → 프롬프트 분기 (싱글/연애/기혼)
- `marriage`: 배우자궁 + 결혼 시기(대운·세운 합·충), 자녀운 (식상·인성)
- `career`: 십성 + 격국 + 용신, `currentJob` → 적성 매칭
- `suneung`: 시험운(인성·식상·관성), `examDate`/`major` → 당일 일진 + 합격 가능성
- `moving`: 방위 + `moveYear`/`direction` → 길일·방위 추천
- `lifetime`: 평생 대운 80년 + 격국 분석 깊이, `concern` → 평생 컨텍스트

각 옵션의 단계 풀은 트레이싱한 실제 코드 경로를 `meta` 필드에 정확히 적는다 (예: `front/js/readers/saju-reader.js#renderWealthResult`, `engine/saju/wealth.py:42` 등). 함수가 없으면 추정 X — 가장 가까운 실제 함수명을 적거나 "공통 백본 재사용 + 프롬프트 컨텍스트만 다름" 식으로 정직히 표기.

- [ ] **Step 4: 로컬 브라우저로 saju 노드 검증**

`http://localhost:9876` → saju 노드 클릭 → 10 카드 보이는지 → 각 카드 클릭 → 해당 옵션 SVG 단계 풀 보이는지 → ← 메뉴로 작동하는지.

- [ ] **Step 5: 커밋**

```bash
git add assets/js/data/menus.js assets/js/data/pipelines.js
git commit -m "feat(saju): 10 options pipeline tracing (만월 아씨) — ADR-002·014·015 정합"
```

---

## Task 7: 도메인 2 — `dream` (몽이 도령, 6 옵션)

**옵션 목록 (운영 contents.js dream.items):**
1. `today` 오늘의 꿈해몽
2. `dict` 꿈 사전
3. `classic` 정통 꿈 풀이 (← Task 4에서 흡수)
4. `recurring` 반복되는 꿈
5. `baby` 태몽 풀이
6. `nightmare` 악몽 분석
7. `lucid` 자각몽 가이드

(실제 7건. spec의 ~6은 추산이었음.)

**트레이싱 소스:**
- `engine/agents/*` (14 핵심 + 6 보조)
- `engine/dream_lex/` (hvdc/hobson/freud_v2/dreamnet_v4 등)
- `front/js/readers/dream-reader.js`
- `web/server.py` `/api/dream/interpret_v2` 라우터
- `vault/decisions/ADR-021·023·055·143.md` 등 꿈 관련 ADR

- [ ] **Step 1: 트레이싱 — engine/agents/, dream_lex/ 모듈 풀 + dream-reader.js 옵션 분기 점검**

`grep "recurring\|baby\|nightmare\|lucid\|dict"` for `front/js/readers/dream-reader.js` 와 `engine/agents/` 사용. 옵션별 차이가 LLM 프롬프트인지 에이전트 선택인지 파악.

- [ ] **Step 2: menus.js dream.items 채우기** (운영 contents.js 라인 165~262 미러)

- [ ] **Step 3: pipelines.js dream 옵션 6개 추가** (classic 외 today·dict·recurring·baby·nightmare·lucid). 각 ~8~14단계.

  - 옵션별 핵심 차이:
    - `today`: 멀티에이전트 축약 (HvDC + Hobson만, A1·A2·A3만 호출)
    - `dict`: 키워드 1건 → dream_lex 룩업 직접 (LLM 0회 가능)
    - `recurring`: 빈도 + 감정 → A8 Freud v2 + 임상 권고
    - `baby`: 태몽 lexicon (전통 한국 태몽 표지자) + 학파 통설
    - `nightmare`: 임상 스크리닝 ISI/STAI-K 연계 + IRT
    - `lucid`: 자각몽 가이드 (학술이 아닌 코칭)

- [ ] **Step 4: 로컬 검증 dream 노드**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(dream): 7 options pipeline tracing (몽이 도령) — ADR-021·023·055·143 정합"
```

---

## Task 8: 도메인 3 — `divination` (화선 낭자, 10 옵션)

**옵션 목록 (운영 contents.js hwapae.items 라인 265~445):**
1. `today` 오늘의 꽃패
2. `heart` 그 사람의 속마음
3. `who-likes` 지금 나를 좋아하는 사람
4. `reunion-month` 이달의 재회 확률
5. `reunion-today` 오늘의 재회 확률
6. `breakup-thinking` 이별이 고민될 때
7. `image` 사람들이 보는 내 이미지
8. `classic` 정통 꽃패 풀이 (← 흡수)
9. `fate-one` 운명의 한 장
10. `decision` 결정의 갈림길
11. `future-fate` 미래의 인연
12. `life-card` 인생 카드

(실제 12건.)

**트레이싱 소스:** `engine/divination/hwapae/*.py` (364줄+) · `front/js/readers/hwapae-reader.js` · ADR-025·144

> **주의 — viewer pipe-node 라벨**: viewer의 `divination` 노드는 운영의 `hwapae`(화패) 도사로 매핑. spec의 "타로·주역"은 viewer 노드 라벨의 흔적이지 실제 도사는 화선 낭자(화패) 단일. 본 Task에서는 화선 낭자의 12 옵션 그대로 진행. 타로·주역은 본 시스템에 없음(`engine/divination`에 hwapae 외 모듈 미확인). Step 1에서 확인.

- [ ] **Step 1: 트레이싱 + tarot/iching 부재 확인**

```
Glob: engine/divination/**/*.py
Grep: tarot|iching for engine/
```

타로·주역이 본 시스템에 없으면 viewer 노드 hint를 "꽃패 12 옵션"으로 좁히는 게 사실성 정합. (단, viewer index.html의 `divination` 노드 텍스트는 무변경 — 본 작업 범위 밖)

- [ ] **Step 2: menus.js divination.items 채우기** (12건 운영 미러)

- [ ] **Step 3: pipelines.js divination 옵션 11개 추가** (classic 외). 각 ~8단계.

- [ ] **Step 4: 로컬 검증**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(divination): 12 options pipeline tracing (화선 낭자) — ADR-025·144 정합"
```

---

## Task 9: 도메인 4 — `star` (성하 공자, 7 옵션)

**옵션 목록 (운영 contents.js star.items 라인 446~582):**
1. `today-zodiac` 오늘의 별자리 운세
2. `big3` 빅3 분석
3. `classic` 정통 별빛 풀이 (← 흡수)
4. `love-stars` 별의 연서
5. `compatibility` 별자리 궁합
6. `east28` 동양 28수 풀이
7. `transit` 행운의 시기
8. `saju-star` 사주 + 별빛 통합 분석

(실제 8건.)

**트레이싱 주의:** 기존 viewer `star` 단일 파이프라인 foot에 "⚠ 백엔드 미구현 (설계만) — web/server.py에 /api/star/reading 라우트 없음"이라고 명시되어 있다. **본 Task는 이 사실을 유지하면서 옵션별로 어디까지 구현됐는지 정직히 표기**한다. ADR-010 사실성 분리.

- [ ] **Step 1: 트레이싱 — `/api/star*` 라우트 점검**

```
Grep: "api/star" for web/server.py
```

라우트가 실제로 있으면 정직히 반영, 없으면 옵션마다 `meta: "백엔드 미구현 — 설계 단계"` 명시.

- [ ] **Step 2: menus.js star.items 채우기** (8건). 미구현 옵션에는 `badges: ['viewer-only']` 추가하여 GitHub Pages 청중이 "아직 구현 안됨"을 알 수 있게.

- [ ] **Step 3: pipelines.js star 옵션 7개 추가** (classic 외). 각 8~10단계. 미구현 라우트는 단계 객체에 `warn: true` + meta 명시.

- [ ] **Step 4: 로컬 검증**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(star): 8 options pipeline tracing (성하 공자) — 백엔드 미구현 옵션 정직 표기"
```

---

## Task 10: 도메인 5 — `face` (운학 도사, 6 옵션)

**옵션 목록 (운영 contents.js face.items 라인 583~696):**
1. `today-impression` 오늘의 인상
2. `classic` 정통 관상 (← 흡수)
3. `part-face` 부위별 관상
4. `past-life` 나의 전생
5. `future-face` 미래의 얼굴
6. `direction` 방위 운세
7. `feng-shui` 풍수 인테리어

(실제 7건.)

**트레이싱 소스:**
- `engine/divination/face*.py` (2327줄, face_scoring + face_shape + facial_feature_classifier)
- `front/js/readers/face-reader.js` · `front/js/readers/face-visualizations.js`
- `web/server.py /api/face/reading`
- ADR-004·022·034·035·036·143·144 (관상은 11 phase 진화)

- [ ] **Step 1: 트레이싱 — face 11 phase 진화 + 7 옵션 분기**

```
Glob: engine/divination/**/face*.py
Read: front/js/readers/face-reader.js
Grep: today-impression|part-face|past-life|future-face|direction|feng-shui for front/
```

- [ ] **Step 2: menus.js face.items 채우기** (7건)

- [ ] **Step 3: pipelines.js face 옵션 6개 추가** (classic 외). 각 10~14단계 (관상은 Stage 1·2 Vision 파이프라인 복잡).

  - 옵션별 핵심 차이:
    - `today-impression`: 사진 없이 텍스트 입력 (`myMood`+`meetType`) → LLM only, Vision 미호출
    - `part-face`: `part` 선택 (눈·코·입·이마·턱·귀·전체) → face_scoring 부분 강조
    - `past-life`: 전생 결정론 룩업 (한국 도사 학파) + LLM 어조
    - `future-face`: targetYear → 결정론 노화 추정 + LLM (의학 진단 X)
    - `direction`: 방위 룩업 (현관·침실·책상·금고·신발장)
    - `feng-shui`: 공간(`roomType`) + 상황(`situation`) → 풍수 학파 통설

- [ ] **Step 4: 로컬 검증**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(face): 7 options pipeline tracing (운학 도사) — ADR-004·022·034·035·036 정합"
```

---

## Task 11: 도메인 6 — `palm` (옥선 할미, 3 옵션)

**옵션 목록 (운영 contents.js palm.items 라인 697~743):**
1. `today-line` 오늘의 손금 한 줄
2. `classic` 정통 손금 풀이 (← 흡수)
3. `line-each` 손금별 풀이

(실제 3건.)

**트레이싱 소스:**
- `engine/divination/palm_scoring.py` (685줄)
- `front/js/readers/palm-reader.js`
- `web/server.py /api/palm/reading`
- ADR-030·143·144

- [ ] **Step 1: 트레이싱**

```
Read: engine/divination/palm_scoring.py
Read: front/js/readers/palm-reader.js
Grep: today-line|line-each for front/
```

- [ ] **Step 2: menus.js palm.items 채우기** (3건)

- [ ] **Step 3: pipelines.js palm 옵션 2개 추가** (classic 외). 각 ~8단계.

- [ ] **Step 4: 로컬 검증**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(palm): 3 options pipeline tracing (옥선 할미) — ADR-030·143 정합"
```

---

## Task 12: 도메인 7 — `name` (묵향 선생, 6 옵션)

**옵션 목록 (운영 contents.js name.items 라인 832~964):**
운영 line 832~964 라인 range만큼 추산 6~10건. **Step 1에서 실제 items 정확히 카운트**.

**트레이싱 소스:**
- `engine/saju/myeong.py` 등 (name_dueum·name_baleum·name_saju_ohaeng·name_strokes·name_eumyang)
- `front/js/core/name-engine.js`
- `front/js/readers/name-reader.js`
- ADR-001·003·010·016·026·027·028·029·032·033

- [ ] **Step 1: 트레이싱 + items 정확 카운트**

```
Read: front/js/data/contents.js (라인 832~964)
Read: front/js/core/name-engine.js
Read: front/js/readers/name-reader.js
Read: engine/saju/myeong.py (있다면)
```

- [ ] **Step 2: menus.js name.items 채우기** (실제 N건)

- [ ] **Step 3: pipelines.js name 옵션 (N-1)개 추가** (classic 외). 각 9~12단계.

- [ ] **Step 4: 로컬 검증**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(name): N options pipeline tracing (묵향 선생) — ADR-026·027·028·033 정합"
```

---

## Task 13: 도메인 8 — `mbti` (viewer 전용 4 옵션)

**옵션 목록 (viewer 전용 — 운영 contents.js에 대응 도사 없음):**
1. `myers` Myers-Briggs 16유형 (← Task 4에서 흡수, 기존 6단계)
2. `jung` Jung 8 인지기능
3. `keirsey` Keirsey 4 기질
4. `socionics` Socionics 16유형

**트레이싱 소스:**
- `engine/mbti/profiles*.py` (있는지 확인)
- `web/server.py /api/profile/{type}` 라우터
- ADR-024 (MBTI 학파 통합)

- [ ] **Step 1: 트레이싱 — engine/mbti 존재 여부 확인**

```
Glob: engine/mbti/**/*.py
Glob: engine/**/mbti*.py
Grep: profile/ for web/server.py
```

- [ ] **Step 2: menus.js mbti.items 채우기** (4건, 모두 `badges: ['viewer-only']`)

```js
  mbti: {
    master: 'MBTI 프로필러',
    masterSub: '4학파 룩업 (LLM 0회 · viewer 전용)',
    items: [
      { key:'jung',      name:'Jung 8 인지기능', glyph:'認 知', tier:'free', badges:['viewer-only'], est:'<1초', desc:'Ni·Ne·Si·Se·Ti·Te·Fi·Fe 8축 위계 결정론 룩업.' },
      { key:'keirsey',   name:'Keirsey 4 기질',  glyph:'四 氣', tier:'free', badges:['viewer-only'], est:'<1초', desc:'Guardian·Artisan·Idealist·Rational 4 기질 매핑.' },
      { key:'socionics', name:'Socionics 16유형', glyph:'十 六', tier:'free', badges:['viewer-only'], est:'<1초', desc:'러시아 학파 16×16 정보교환 매트릭스.' },
      { key:'myers',     name:'Myers-Briggs 16', glyph:'M B',  tier:'free', badges:['viewer-only'], est:'<1초', desc:'INTJ~ESFP 표준 16유형 + 사주-MBTI 융합(ADR-014).' },
    ]
  },
```

- [ ] **Step 3: pipelines.js mbti 옵션 3개 추가** (myers 외). 각 5~7단계 (결정론 룩업 단순).

- [ ] **Step 4: 로컬 검증**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(mbti): 4 options pipeline tracing (viewer-only) — ADR-024 정합"
```

---

## Task 14: 도메인 9 — `clinical` (viewer 전용 8 옵션)

**옵션 목록 (viewer 전용):**
1. `phq9` PHQ-9 우울 (← 흡수)
2. `gad7` GAD-7 불안
3. `isi` ISI 불면
4. `psqi` PSQI 수면 질
5. `bdik` BDI-K 한국 우울
6. `cesd` CES-D 역학 우울
7. `staik` STAI-K 한국 불안
8. `irt` IRT 꿈 외상

**트레이싱 소스:**
- `engine/clinical/*.py` (8 척도 모듈)
- `web/server.py /api/clinical/screening` + `/api/clinical/trend`
- ADR-006 (의료 자문 거절)

- [ ] **Step 1: 트레이싱 — engine/clinical 모듈 풀**

```
Glob: engine/clinical/**/*.py
Read: engine/clinical/phq9.py (대표 1건)
Grep: clinical for web/server.py
```

- [ ] **Step 2: menus.js clinical.items 채우기** (8건, `badges: ['viewer-only']`)

- [ ] **Step 3: pipelines.js clinical 옵션 7개 추가** (phq9 외). 각 ~7단계 (모두 결정론 룩업 + LLM 0회).

- [ ] **Step 4: 로컬 검증**

- [ ] **Step 5: 커밋**

```bash
git commit -m "feat(clinical): 8 options pipeline tracing (viewer-only) — ADR-006 정합"
```

---

## Task 15: 전체 회귀 — Playwright 자동 캡처 + 시각 비교

**목적:** 9 노드 × 전체 옵션 ~60 카드 클릭 → 파이프라인 SVG 정상 표시 → ← 메뉴 복귀 → ESC 닫기 시나리오 자동 검증.

**Files:**
- Create: `pw_work/regression_2stage.py`

- [ ] **Step 1: Playwright 회귀 스크립트 작성**

```python
# pw_work/regression_2stage.py
import asyncio
from playwright.async_api import async_playwright

NODES = ['saju', 'mbti', 'dream', 'divination', 'clinical', 'face', 'palm', 'name', 'star']

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1400, 'height': 1800})
        await page.goto('http://localhost:9876/')
        await page.wait_for_selector('.pipe-node')
        report = []
        for node in NODES:
            await page.click(f'[data-pipeline="{node}"]')
            await page.wait_for_selector('.pipe-modal-bg.open', timeout=3000)
            await page.wait_for_selector('.pipe-menu-card', timeout=3000)
            cards = await page.query_selector_all('.pipe-menu-card')
            n_cards = len(cards)
            report.append(f'{node}: {n_cards} options')
            await page.screenshot(path=f'pw_work/menu_{node}.png', full_page=True)
            for i in range(n_cards):
                cards = await page.query_selector_all('.pipe-menu-card')
                opt_key = await cards[i].get_attribute('data-option')
                await cards[i].click()
                await page.wait_for_selector('.pipe-svg-wrap svg', timeout=3000)
                await page.screenshot(path=f'pw_work/pipe_{node}_{opt_key}.png', full_page=True)
                await page.click('#pipe-modal-back')
                await page.wait_for_selector('.pipe-menu-card', timeout=3000)
            await page.click('#pipe-modal-close')
            await page.wait_for_timeout(200)
        await browser.close()
        for line in report:
            print(line)

asyncio.run(main())
```

- [ ] **Step 2: 실행**

Run: `python pw_work/regression_2stage.py`
Expected: `pw_work/menu_<node>.png` 9장 + `pw_work/pipe_<node>_<option>.png` ~60장. stdout에 노드별 카드 수.

- [ ] **Step 3: 출력 카운트가 menus.js 정의와 일치하는지 검증**

```
saju: 10 options
dream: 7 options
divination: 12 options
star: 8 options
face: 7 options
palm: 3 options
name: N options (Task 12 결과)
mbti: 4 options
clinical: 8 options
```

합계가 spec의 ~60 옵션 추산과 일치하는지 확인. 일치하지 않으면 menus.js 항목 누락 점검.

- [ ] **Step 4: 시각 비교 — 5건 샘플 직접 확인**

`pw_work/pipe_saju_classic.png` ↔ `pw_work/baseline_saju.png` (Task 1) 비교. 동일 14단계가 나오는지.

다른 4건 샘플(`pipe_dream_today`, `pipe_face_part-face`, `pipe_clinical_gad7`, `pipe_star_compatibility`) 시각 확인.

- [ ] **Step 5: 커밋**

```bash
git add pw_work/regression_2stage.py
git commit -m "test: full 2-stage modal regression — 9 nodes × ~60 options auto-capture"
```

---

## Task 16: README 갱신 + 최종 push

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README.md 업데이트**

`## 다이어그램 5개 노드` 섹션을 다음으로 교체:

```markdown
## 다이어그램 9개 노드 — 2단계 모달

도메인 엔진 박스 클릭 → 옵션 메뉴 그리드 (운영 contents.js 미러) → 옵션 카드 클릭 → 옵션 전용 버티컬 SVG 파이프라인.

| 노드 | 도사 | 옵션 수 | 핵심 |
|---|---|---|---|
| 🟢 **사주 엔진** | 만월 아씨 | 10 | 60갑자 + LLM 자연어 (오늘·정통·2026·재물·연애·결혼·직업·수능·이사·평생) |
| 🔴 **MBTI 프로필러** | (viewer 전용) | 4 | Jung·Keirsey·Socionics·Myers (LLM 0회) |
| 🔵 **꿈 해석** | 몽이 도령 | 7 | HvDC + 14 핵심 에이전트 (오늘·사전·정통·반복·태몽·악몽·자각몽) |
| 🟡 **점복 (꽃패)** | 화선 낭자 | 12 | 셔플 + 위치 가중치 + LLM 자연어 |
| ⚪ **임상 스크리닝** | (viewer 전용) | 8 | PHQ-9·GAD-7·ISI·PSQI·BDI-K·CES-D·STAI-K·IRT (LLM 0회) |
| 🌸 **관상** | 운학 도사 | 7 | Opus Vision JSON + Gemini 사극 (Stage 1·2) |
| ✋ **손금** | 옥선 할미 | 3 | MediaPipe 21 키포인트 + 4대선 결정론 + LLM |
| 📛 **이름** | 묵향 선생 | N | 대법원 9389 한자 + 5중 결정론 분석 |
| ⭐ **별빛** | 성하 공자 | 8 | 서양 점성술 10행성 + 동양 28수 (일부 백엔드 미구현) |

옵션 수 합계: 약 60건. 모든 옵션의 단계는 본 시스템 실제 코드 트레이싱 결과 (engine/* + web/server.py + front/js/readers/*).
```

(Task 12 결과로 N 확정)

- [ ] **Step 2: 커밋**

```bash
git add README.md
git commit -m "docs: update README for 9 nodes × ~60 options 2-stage modal"
```

- [ ] **Step 3: push (사용자 확인 후)**

```bash
git push origin main
```

push 전 사용자 확인 필요 — 본 viewer는 별도 git repo이고 GitHub Pages 자동 배포. (CLAUDE.md 글로벌 규칙: push는 명시 요청 시에만)

---

## Self-Review (writing-plans 절차 정합)

**1. Spec 커버리지 점검:**

| spec 섹션 | Task |
|---|---|
| §2 아키텍처 | Task 3 (`pipeline-modal.js` 리팩토링) |
| §3 파일 변경 일람 | Task 2(menus.js 신규), 3(modal), 4(pipelines 구조), 5(CSS) |
| §4-1 menus.js 스키마 | Task 2 (골격), Task 6~14 (도메인별 채움) |
| §4-2 pipelines.js 중첩 | Task 4 (구조 변경), Task 6~14 (옵션 추가) |
| §5 노드↔옵션 매핑 7+2 | Task 6~14 1:1 매핑 |
| §6 단계 데이터 트레이싱 | Task 6~14 Step 1 (각 도메인 트레이싱) |
| §7 UX 명세 | Task 3 (mode 분기), Task 5 (CSS) |
| §11 Phase 순서 | Task 1~16 시퀀스 |
| §12 회귀 우려 | Task 15 (Playwright 회귀) |
| §14 성공 기준 8건 | Task 15 (자동 검증) + Task 16 (push 전 사용자 확인) |

✓ 모든 spec 요건이 Task로 매핑됨.

**2. Placeholder 스캔:**

- "본 시스템 실제 코드 트레이싱 결과로 도출" — 각 Task Step 1에 구체 grep/Read 명령 명시 ✓
- "옵션별로 9~12단계" — Task 6의 today 예시 골격 + 트레이싱 의무 명시. Task 7~14는 "옵션별 핵심 차이" 불릿으로 분기점 명시 ✓
- Task 12 `name` 옵션 수 = `N` — Step 1에서 실제 contents.js 카운트로 확정한다고 명시 ✓
- mbti·clinical step 객체 풀 코드 미제시 — 본 plan은 도메인 작업의 골격이고, 단계 객체는 트레이싱 결과 의존. 트레이싱 의무 + meta 필드 정확 표기 룰 명시로 보강 ✓ (대안: 모든 단계 객체를 plan 내에 박는 건 plan 분량 10배 + 트레이싱 안 한 채 박제될 위험)

**3. 타입 일관성:**

- 단계 객체 스키마 `{n, t, title, desc, meta, adr?, star?, warn?, ok?}` — 모든 Task에서 동일 ✓
- menus.js item 스키마 `{key, name, glyph, tier, badges, est, desc}` — Task 2 골격 + Task 6 예시 + Task 13 예시 동일 ✓
- `state = { mode, nodeKey, optionKey }` — Task 3 Step 2·3·5·6·7 일관 ✓
- 메서드 명 `_renderMenu` / `_renderPipeline` / `_goBackToMenu` / `_goToPipeline` — Task 3 내내 동일 ✓

**4. 모호성:**

- "본 시스템 ~ 트레이싱"이 실패하는 도메인(예: star 백엔드 미구현)은 Task 9 Step 1에서 `Grep` 명령으로 확인 → 미구현 옵션은 `warn: true` + meta 명시 명시 ✓
- viewer divination 노드가 운영 hwapae(꽃패)와 매핑되는 점: Task 8 주의 박스로 명시 ✓

---

## Execution Handoff

**계획 완료. 저장 위치: `docs/superpowers/plans/2026-05-23-vertical-options-menu.md`**

두 실행 방식 중 선택:

**1. Subagent-Driven (권장)** — 각 Task별 신선한 서브에이전트 dispatch + 단계 사이 리뷰. ~60 옵션 트레이싱이 도메인별로 격리되어 본 plan에 가장 적합.

**2. Inline Execution** — 현재 세션에서 executing-plans로 일괄 실행 + checkpoint 리뷰. 컨텍스트 길이 부담 큼 (도메인 9개 × engine + web + front + ADR 트레이싱).

어느 쪽으로 가시겠어요?
