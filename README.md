# 月下夢 LLM Orchestration Dashboard

본 시스템 [月下夢](https://saju-mbti-fusion-production.up.railway.app/) (사주·MBTI 융합 SaaS)의 LLM 오케스트레이션 토폴로지 발표용 대시보드.

## 라이브

→ **https://technoetic.github.io/saju-orchestration-viewer/**

## 다이어그램 5개 노드

도메인 엔진 박스 클릭 → 모달로 세부 파이프라인 (버티컬 SVG):

| 노드 | 단계 수 | 핵심 |
|---|---|---|
| 🟢 **사주 엔진** | 14 | 클라이언트 결정론 80% + LLM 자연어 1회 |
| 🔴 **MBTI 프로필러** | 6 | Jung·Keirsey·Socionics 룩업 (LLM 0회) |
| 🔵 **꿈 해석** | 10 | HvDC + Hobson + 14 핵심 + 6 보조 + 4 학파 + 임상 |
| 🟡 **점복 (타로·주역·화패)** | 8 | 결정론 셔플 + LLM 자연어 |
| ⚪ **임상 스크리닝** | 7 | PHQ-9·GAD-7·ISI·PSQI·BDI-K·CES-D·STAI-K·IRT (LLM 0회) |

## 본 시스템 핵심 결정 — 사실성 분리

- LLM은 도메인 데이터를 받아 **해석만** 수행
- 결정론 엔진 (사주 60갑자·MBTI 룩업·HvDC 코딩·카드 셔플)이 본질
- 학파 명칭·운명 매핑은 본 시스템 코드 DB 출처에서만 흐름

## 파일

- `index.html` — 메인 대시보드 (단일 페이지)
- `openapi.json` — 본 시스템 API 스키마 스냅샷
- `session_evolution/` — 관상 도메인 11 phase 진화 별도 시각화

## 본 repo

호스팅 전용. 본 시스템 운영 코드는 [saju-mbti-fusion](https://github.com/Technoetic/saju-mbti-fusion).
