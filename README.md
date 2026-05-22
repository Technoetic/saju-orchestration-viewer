# 月下夢 LLM Orchestration Dashboard

본 시스템 [月下夢](https://saju-mbti-fusion.fly.dev/) (사주·MBTI 융합 SaaS)의 LLM 오케스트레이션 토폴로지 발표용 대시보드.

## 라이브

→ **https://technoetic.github.io/saju-orchestration-viewer/**

## 다이어그램 9개 노드 — 2단계 모달 (옵션 메뉴 → 파이프라인)

도메인 엔진 박스 클릭 → 옵션 메뉴 그리드 → 옵션 카드 클릭 → 옵션 전용 버티컬 SVG 파이프라인.

운영 [front/js/data/contents.js](https://github.com/Technoetic/saju-mbti-fusion/blob/main/front/js/data/contents.js)의 7 도사 메뉴를 viewer로 1:1 미러링 (saju·dream·divination·star·face·palm·name). mbti·clinical 2 노드는 운영에 대응 도사 없음 — viewer 전용 4학파·8 척도 옵션.

| 노드 | 도사 | 옵션 수 | 핵심 |
|---|---|---|---|
| 🟢 **사주** | 만월 아씨 | 10 | 60갑자 + LLM 자연어 (오늘·정통·2026·재물·연애·결혼·직업·수능·이사·평생) |
| 🔴 **MBTI** | (viewer 전용) | 4 | Jung·Keirsey·Socionics·Myers 4 학파 (LLM 0회) |
| 🔵 **꿈** | 몽이 도령 | 7 | HvDC + 14 핵심 에이전트 (오늘·사전·정통·반복·태몽·악몽·자각몽) |
| 🟡 **꽃패** | 화선 낭자 | 12 | 셔플 + 위치 가중치 + LLM 자연어 (12 옵션) |
| ⚪ **임상** | (viewer 전용) | 8 | PHQ-9·GAD-7·ISI·PSQI·BDI-K·CES-D·STAI-K·IRT (LLM 0회) |
| 🌸 **관상** | 운학 도사 | 7 | Opus Vision JSON + Gemini 사극 (Stage 1·2) |
| ✋ **손금** | 옥선 할미 | 3 | MediaPipe 21 키포인트 + 4대선 결정론 + Vision Opus 4.7 |
| 📛 **이름** | 묵향 선생 | 8 | 대법원 9389 한자 + 5중 결정론 분석 (오늘 한자·정통·운명 한 자·신생아·개명·법인·필명·사주 작명) |
| ⭐ **별빛** | 성하 공자 | 8 | 서양 점성술 빅3 + 동양 28수 (today-zodiac·big3·classic·love·궁합·28수·transit·사주+별빛) |

**옵션 수 합계: 67건.** 모든 옵션의 파이프라인 단계는 운영 시스템 실제 코드 트레이싱 결과 (engine/* + web/server.py + front/js/readers/*). ADR-010 사실성 분리 정합.

## 본 시스템 핵심 결정 — 사실성 분리

- LLM은 도메인 데이터를 받아 **해석만** 수행
- 결정론 엔진 (사주 60갑자·MBTI 룩업·HvDC 코딩·카드 셔플·천체 좌표·관상 12궁·손금 4대선·작명 5중 분석)이 본질
- 학파 명칭·운명 매핑은 운영 코드 DB 출처에서만 흐름
- ADR-006 (의료·법률·금융 자문 거절), ADR-010 (사실성 분리), ADR-014 (사주↔MBTI 단정 회피)

## 파일

- `index.html` — 메인 대시보드 (단일 페이지)
- `assets/js/components/pipeline-modal.js` — 2단계 모달 state machine
- `assets/js/data/menus.js` — 9 노드 × 67 옵션 메뉴 데이터 (운영 contents.js 미러)
- `assets/js/data/pipelines.js` — 67 옵션별 파이프라인 단계 풀
- `pw_work/regression_2stage.py` — Playwright 자동 회귀 (9 노드 × 67 옵션 캡처)
- `docs/superpowers/specs/2026-05-23-vertical-options-menu-design.md` — 본 작업 설계
- `docs/superpowers/plans/2026-05-23-vertical-options-menu.md` — 본 작업 실행 계획
- `openapi.json` — 운영 API 스키마 스냅샷

## 본 repo

호스팅 전용. 운영 코드는 [saju-mbti-fusion](https://github.com/Technoetic/saju-mbti-fusion).
