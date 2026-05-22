export const PIPELINES = {
  saju: {
    classic: {
    title: "사주 엔진 파이프라인",
    hint: "/api/saju · 결정론 80% + LLM 자연어 1회",
    tagClass: "saju",
    steps: [
      {n:1, t:"0s",    title:"사용자 입력 5필드", desc:"이름·생년월일시·성별·시간 미상 시 12지 힌트. 한글 이름은 자동 성·이름 분리 (대법원 9389한자).", meta:"front step-input"},
      {n:2, t:"0.1s",  title:"절기 12개 정밀 계산", desc:"황경 → JD 변환 + 뉴턴 반복. 사주 연도 입춘 기준 결정.", meta:"calcSolarTerms · 클라이언트 JS"},
      {n:3, t:"0.2s",  title:"사주 4주(年月日時) 천간·지지 확정", desc:"60갑자 결정론. 日柱·日干 = 본원. 같은 입력 = 같은 출력 100%.", meta:"ADR-002 옵션 A 디폴트", star:true},
      {n:4, t:"0.3s",  title:"analyzeSaju 4중 분석", desc:"십성·운성·신살·장간·오행분포 + 용신/기신 후보 (옵션 B 억부론 이재승 2019 KCI).", meta:"ADR-002·015·031", adr:["ADR-002","ADR-015","ADR-031"]},
      {n:5, t:"0.4s",  title:"大運 8순환 (10년×8 = 80년)", desc:"年干 음양+성별 → 순행/역행. 출생시 ↔ 다음 절 JD 거리로 시작 나이 소수점 산출.", meta:"calculateDaewoon"},
      {n:6, t:"0.5s",  title:"歲運 ±10년", desc:"연단위 합·충·형·해 + 대운과의 상호작용.", meta:"calculateSewoon"},
      {n:7, t:"0.8s",  title:"성명학 五行 보완도 (선택)", desc:"한자 자원오행 + 발음오행. 사주 五行 ↔ 이름 五行 매핑 → 보완 점수.", meta:"engine/saju/myeong.py · ADR-027 KCI 94자", adr:["ADR-027"]},
      {n:8, t:"0.9s",  title:"generateInterpretation 결정론 풀이", desc:"격국 분류·용신·기신 결정. LLM 미관여.", meta:"front:5850"},
      {n:9, t:"1.0s",  title:"buildSajuPrompt — 만월 아씨 페르소나 + 결정론 데이터 주입", desc:"4주 한자 + 십성표·운성표·장간표·오행분포·대운 8순환을 LLM에 인계. ADR-014 단정 회피 규칙.", meta:"front:5950", adr:["ADR-014"], star:true},
      {n:10,t:"1~12s", title:"POST /api/llm/chat — Gemini 2.5 Flash Lite 자연어", desc:"Bizrouter google/gemini-2.5-flash-lite. 스트리밍 text/plain 청크. 사주 데이터는 결정론, Gemini는 어조 변환만.", meta:"callFreeAI · 90% 지연 발생", star:true},
      {n:11,t:"12s",   title:"적대적 비판 루프 (옵션)", desc:"1차 응답 → 비판 에이전트 검토 (단정·미신·인과) → 재생성. 일부 모드만.", meta:"web/server.py LLM 후처리", warn:true},
      {n:12,t:"12.1s", title:"캐시 + Analytics 적재", desc:"prompt hash → LLM 응답 캐시. MBTI counts → /metrics (Prometheus 호환).", meta:"ADR-013", adr:["ADR-013"]},
      {n:13,t:"12.2s", title:"위기 신호 탐지 + 법적 면책 부착", desc:'"죽고싶다·자살" → 1393·1577-0199. 의료·법률·투자 자문 면책. 사주→MBTI 단정 회피.', meta:"crisis_alert + legal_notice · ADR-006·014", adr:["ADR-006","ADR-014"], warn:true},
      {n:14,t:"12s",   title:"렌더링 — 4주 카드 + 십성·운성표 + 오행 차트 + 대운 타임라인", desc:"만월 아씨 사극 본문 + 격국·용신 + 8 대운 80년 + 세운 ±10년 + 성명 보완도.", meta:"renderSajuResult · step-result", ok:true},
    ],
    foot: "관상(서버 100%) vs 사주(클라이언트 80%) — 결정론이 본질, LLM은 어조 변환"
    },
  },
  mbti: {
    myers: {
    title: "MBTI 프로필러 파이프라인",
    hint: "/api/profile/{type} · Jung·Myers·Keirsey·Socionics 4학파 통합",
    tagClass: "mbti",
    steps: [
      {n:1, t:"0s",    title:"사용자 입력 MBTI 4자 (INTJ·ENFP 등)", desc:"또는 사주에서 자동 추정 (ADR-014 사주-MBTI 예외).", meta:"16 유형"},
      {n:2, t:"0.05s", title:"프로필 룩업", desc:"Jung 8 인지기능 (Ni·Ne·Si·Se·Ti·Te·Fi·Fe) + Keirsey 4기질 + Socionics 16유형 매핑.", meta:"engine/mbti/profiles · ADR-024", adr:["ADR-024"], star:true},
      {n:3, t:"0.1s",  title:"trait map 산출", desc:"우세 인지기능 4종 + 약점 인지기능 + 4기질 분류 (Guardian/Artisan/Idealist/Rational).", meta:"socionics v2 16×16 매트릭스"},
      {n:4, t:"0.15s", title:"성격 특성 dict 응답", desc:"강점 N건 + 약점 N건 + 직업 적성 카테고리 + 관계 스타일.", meta:"통계 기반, 단정 회피"},
      {n:5, t:"0.2s",  title:"법적 면책 (인과 단정 회피)", desc:"MBTI는 통계적 경향. 단정 표현 금지. ADR-014 사주-MBTI 예외 적용.", meta:"ADR-006·014", adr:["ADR-006","ADR-014"], warn:true},
      {n:6, t:"0.25s", title:"응답 dict 반환", desc:"trait map + 강·약점 + 면책. 사주 fusion에서 추가 데이터로 사용 가능.", ok:true},
    ],
    foot: "MBTI는 결정론 룩업 — 같은 4자 = 같은 응답. LLM 호출 0회."
    },
  },
  dream: {
    classic: {
    title: "꿈 해석 파이프라인 (HvDC + Hobson + 14 핵심 에이전트)",
    hint: "/api/dream/interpret_v2 · 멀티에이전트 14 핵심 + 6 보조",
    tagClass: "dream",
    steps: [
      {n:1, t:"0s",    title:"꿈 텍스트 입력", desc:"사용자 자유 서술 (예: '하늘을 날아다니는 꿈을 꿨다').", meta:"max 2000자"},
      {n:2, t:"0.1s",  title:"HvDC 코딩 (Hall + Van de Castle)", desc:"등장인물·상호작용·감정·환경·물체 5축 분류. DreamBank 22,000건 정규화 기반.", meta:"dream_lex/hvdc"},
      {n:3, t:"0.3s",  title:"Hobson 신경생리 분류", desc:"AIM 모델 (Activation·Input·Modulation). REM 단계 특성 매칭.", meta:"dream_lex/hobson"},
      {n:4, t:"0.5s",  title:"학파 lexicon 4분 매핑 (HvDC·Hobson·Freud v2·DreamNet v4)", desc:"Freud 정신분석 v2 (ADR-023) + DreamNet 그래프 v4 (ADR-021). 30+ dream_lex 학파 모듈.", meta:"ADR-021·023", adr:["ADR-021","ADR-023"]},
      {n:5, t:"1s",    title:"A1~A14 핵심 에이전트 병렬 분석", desc:"A1 Hall·A2 Freud·A3 Jung·A8 Freud v2·A12 사회학·…·B6 DreamNet v4. asyncio.gather 병렬.", meta:"engine/agents/ · 14 핵심", star:true},
      {n:6, t:"3s",    title:"6 보조 에이전트 (감정·언어·상징·신경·임상·문화)", desc:"DreamBank 통계 + 한국어 꿈 norms (HvDC korean v2). 임상 PSQI·ISI 연동.", meta:"engine/agents/ · 6 보조"},
      {n:7, t:"4s",    title:"멀티에이전트 융합 + LLM 자연어 변환", desc:"20개 에이전트 dict → buildDreamPrompt → callFreeAI Gemini.", meta:"몽이 도령 페르소나", star:true},
      {n:8, t:"10~15s",title:"Gemini Flash Lite 자연어 풀이", desc:"한국 사극 도사 어조 + 학파별 인용 + 단정 회피 + 임상 권고.", meta:"/api/llm/chat", star:true},
      {n:9, t:"15s",   title:"위기 신호 + 면책 + 임상 권고 라우팅", desc:"악몽·외상 키워드 탐지 → PSQI 권유 + 1393. 임상 의심 시 ISI/STAI-K 진입.", meta:"ADR-006 + 임상 스크리닝", warn:true},
      {n:10,t:"15s",   title:"렌더링 — 몽이 도령 본문 + DreamNet 그래프 시각화", desc:"꿈 상징 노드 + 학파별 해석 카드 + 임상 권고 + 일기 저장.", ok:true},
    ],
    foot: "본 시스템에서 가장 복잡한 도메인 — 20 에이전트 + 4 학파 + 임상 측정 통합"
    },
  },
  divination: {
    classic: {
    title: "점복 파이프라인 (타로 · 주역 · 화패)",
    hint: "/api/tarot · /iching · /hwapae · 결정론 난수 + 카드 의미 매핑",
    tagClass: "divination",
    steps: [
      {n:1, t:"0s",    title:"사용자 입력 (카드 종류·스프레드·질문)", desc:"타로 22 메이저·56 마이너 / 주역 64괘 / 화투 48패.", meta:"카드 풀 선택"},
      {n:2, t:"0.1s",  title:"seed 결정 (사용자 + timestamp + UUID)", desc:"결정론 시드 → 같은 seed = 같은 카드 (재현 가능).", meta:"hashlib.sha256"},
      {n:3, t:"0.2s",  title:"카드 추출 (Fisher-Yates 셔플)", desc:"스프레드 위치별 카드 + 정·역방향. 타로 켈틱 10장 / 주역 6효 / 화패 6패.", meta:"engine/divination/hwapae 364줄"},
      {n:4, t:"0.3s",  title:"카드 의미 매핑 (학파 통설 dict)", desc:"타로 RWS·Thoth / 주역 점사·괘사·효사 / 화투 6핵심 패 (ADR-025 한국 화투).", meta:"ADR-025", adr:["ADR-025"], star:true},
      {n:5, t:"0.4s",  title:"위치 가중치 + 카드 상호작용", desc:"켈틱 10위치별 의미 (현재·도전·과거·미래·…) / 주역 변효·호괘.", meta:"결정론 룩업"},
      {n:6, t:"0.5s",  title:"buildDivinationPrompt — 화선 낭자 페르소나", desc:"카드 + 위치 + 의미 + 질문 컨텍스트 → Gemini 자연어 변환 입력.", meta:"front prompt builder"},
      {n:7, t:"1~10s", title:"Gemini 자연어 풀이", desc:"화선 낭자 한국 무가 어조. 카드 결정론 데이터 인용, 운명 단정 회피.", meta:"/api/llm/chat", star:true},
      {n:8, t:"10s",   title:"렌더링 — 카드 그림 + 위치 + 의미 + 본문", desc:"화선 낭자 사극 본문 + 카드 SVG/이미지 + 면책.", ok:true},
    ],
    foot: "타로·주역·화패는 결정론 분류 + LLM 자연어. 운명 단정 회피 ADR-006."
    },
  },
  clinical: {
    phq9: {
    title: "임상 스크리닝 파이프라인",
    hint: "/api/clinical/screening · PHQ-9·GAD-7·ISI·PSQI·BDI-K·CES-D·STAI-K·IRT",
    tagClass: "clinical",
    steps: [
      {n:1, t:"0s",    title:"사용자 선택 척도", desc:"우울 (PHQ-9·BDI-K·CES-D) / 불안 (GAD-7·STAI-K) / 수면 (ISI·PSQI) / IRT (꿈 외상).", meta:"engine/clinical 8건"},
      {n:2, t:"0~5분", title:"문항 응답 수집 (대화형)", desc:"PHQ-9 9문항 4점 · GAD-7 7문항 · ISI 7문항 · 각 척도 표준 점수 산출.", meta:"front 대화형 UI"},
      {n:3, t:"5분",   title:"표준 점수 계산", desc:"PHQ-9 0~27 (5/10/15/20 cutoff). GAD-7 0~21. ISI 0~28.", meta:"결정론 룩업", star:true},
      {n:4, t:"5분",   title:"중증도 분류 + 권고 메시지", desc:"경도·중등도·중증·심각. cutoff별 권고: 자가관리·상담·치료·응급.", meta:"학술 가이드라인", warn:true},
      {n:5, t:"5분",   title:"위기 신호 탐지 (강도 의심)", desc:"PHQ-9 9번 문항 (자해) 양성 → 1393·1577-0199 + 119 자동 부착.", meta:"crisis_alert", warn:true},
      {n:6, t:"5분",   title:"트렌드 저장 + 그래프", desc:"diary/clinical_log 적재 → /api/clinical/trend 시계열.", meta:"engine/storage"},
      {n:7, t:"5분",   title:"렌더링 — 점수 + 카테고리 + 권고 + 트렌드", desc:"본 시스템 유일한 의학 척도 도메인. 진단 X, 자기 점검 도구.", ok:true},
    ],
    foot: "임상 척도는 LLM 0회 호출 — 100% 결정론. ADR-006 자문 거절 정신 유지."
    },
  },
  face: {
    classic: {
    title: "운학 도사 관상 풀이 파이프라인",
    hint: "/api/face/reading · Opus Vision JSON + Gemini 사극 (Stage 1·2)",
    tagClass: "face",
    steps: [
      {n:1, t:"0s",    title:"사용자 사진 캡처 + 클라이언트 전처리", desc:"camera/file 업로드 → 5MB 초과 시 1280px JPEG 0.85 자동 축소 (ADR-035) + MediaPipe 478 키포인트 추출.", meta:"front downsampleDataUrl", adr:["ADR-035"]},
      {n:2, t:"0.2s",  title:"HTTP POST + fetchWithRetry", desc:"5xx 1회 자동 재시도 3초 백오프. payload: image_base64 + age/gender/question + metrics.landmarks.", meta:"front fetchWithRetry"},
      {n:3, t:"0.3s",  title:"L1 파일 무결성 + 7MB 가드", desc:"매직 넘버 PNG/JPEG/HEIC/AVIF 자동 감지 + 크기 초과 시 HTTP 413.", meta:"engine/safety/file_integrity · ADR-011", adr:["ADR-011"]},
      {n:4, t:"0.4s",  title:"위기 신호 탐지", desc:"질문 텍스트 위기 키워드 → 1393·1577-0199 자동 부착 + 조기 반환.", meta:"crisis_alert", warn:true},
      {n:5, t:"0.5s",  title:"결정론 엔진 점수 산출", desc:"face_scoring(12궁·삼정·오관 ADR-004) + face_shape(5형 ADR-022) + facial_feature_classifier(앙월구·복주구·일자구 ADR-034).", meta:"engine/divination 2327줄", adr:["ADR-004","ADR-022","ADR-034"]},
      {n:6, t:"0.6s",  title:"캐시 조회 (24h TTL)", desc:"hash(image + age + gender) → HIT 시 즉시 응답 (~700ms).", meta:"_hash_payload"},
      {n:7, t:"0.7s",  title:"Stage 1 — Opus 4.7 Vision 요청 빌드", desc:"_STAGE1_OBJECTIVE_SYSTEM — 학파 30+ 어휘 + 사상체질 금지 명시. 결정론 점수 미주입.", meta:"ADR-005 Sup 4", adr:["ADR-005"]},
      {n:8, t:"1~15s", title:"Opus Vision JSON 출력", desc:"face_outline·forehead·eyebrow·eye·nose·mouth·chin·cheek·complexion 해부학 명칭만. 학파 용어 0건.", meta:"Bizrouter anthropic/claude-opus-4.7", star:true},
      {n:9, t:"14s",   title:"결정론 점수 요약 (Stage 2 입력 빌드)", desc:"_build_deterministic_scores_summary — 영문 key → 한국어 라벨 변환.", meta:"Phase 19~21"},
      {n:10,t:"15~20s",title:"Stage 2 — Gemini Flash Lite 사극 어조 변환", desc:"사진 미열람. 입력 1(해부학 JSON) + 입력 2(결정론 점수) → 운학 도사 800~1300자.", meta:"google/gemini-2.5-flash-lite", star:true},
      {n:11,t:"20.1s", title:"운명 매핑 후처리 필터", desc:"정규식 5카테고리: 시간 차원·운명 어휘·12궁 매핑·학파 인용·사상체질 자동 제거 (3회차).", meta:"_postprocess_remove_fate_mapping", warn:true},
      {n:12,t:"20.2s", title:"법적 면책 부착 + 응답 dict 조립", desc:"의료·법률·투자 면책 자동. anatomical_description + palace_scores + face_shape + facial_features 노출.", meta:"build_legal_footer"},
      {n:13,t:"20.3s", title:"캐시 저장 + LLM 운영 모니터링 (1%)", desc:"step_archive/face_reading_cache + llm_output_samples/<date>.jsonl + 운명 어휘 카운터.", meta:"ADR-036 (5회차)", adr:["ADR-036"]},
      {n:14,t:"21s",   title:"클라이언트 6종 UI 시각화", desc:"12궁 막대 + 삼정 도넛 + 오관 레이더 + 5형 배지 + 신·기 게이지 + 해부학 카드 + 운학 도사 사극 본문.", meta:"Phase 22 캐릭터화", ok:true},
    ],
    foot: "관상은 본 세션 11 phase 진화 (Phase 12·17~22 + ADR-034·035·036). 운명 매핑 차단 사실성 분리 절대 정합."
    },
  },
  palm: {
    classic: {
    title: "옥선 할미 손금 풀이 파이프라인",
    hint: "/api/palm/reading · 4대선 + 금성대 결정론 + Gemini 자연어",
    tagClass: "palm",
    steps: [
      {n:1, t:"0s",    title:"사용자 손바닥 사진 + 손(좌/우) + 컨텍스트", desc:"같은 5MB 다운샘플 + L1 file_integrity (face와 동일 파이프).", meta:"front file → base64"},
      {n:2, t:"0.5s",  title:"MediaPipe Hand 21 키포인트 추출", desc:"손바닥 + 손가락 5개 각 4키포인트 = 21개. 4대선 추적 baseline.", meta:"브라우저 측 결정론"},
      {n:3, t:"0.8s",  title:"4대선 자동 식별 (생명선·지능선·감정선·운명선)", desc:"손가락 베이스 + 키포인트 → 곡선 후보. 끊김·갈래 검출.", meta:"engine/divination/palm_scoring.py · ADR-030", adr:["ADR-030"], star:true},
      {n:4, t:"1.0s",  title:"금성대 + 부속선 분류 (선택)", desc:"태양선·결혼선·자녀선·여행선 등 — 가시도에 따라 점수.", meta:"보조 분류"},
      {n:5, t:"1.2s",  title:"4대선 결정론 점수 산출", desc:"각 선의 길이·깊이·곡률·끊김 점수. 120/120 골든셋 라벨 100% 일치 (ADR-030).", meta:"palm_scoring 685줄"},
      {n:6, t:"1.5s",  title:"buildPalmPrompt — 옥선 할미 페르소나", desc:"4대선 점수 + 금성대 + 컨텍스트 → 한국 사극 노녀 어조 프롬프트.", meta:"front prompt builder"},
      {n:7, t:"2~12s", title:"Gemini Flash Lite 자연어 풀이", desc:"옥선 할미 어조 + 결정론 점수 인용 + 운명 단정 회피.", meta:"/api/llm/chat", star:true},
      {n:8, t:"12s",   title:"렌더링 — 4대선 SVG 오버레이 + 본문", desc:"손바닥 사진에 4대선 곡선 시각화 + 점수 차트 + 옥선 할미 본문.", ok:true},
    ],
    foot: "손금은 결정론 4대선 점수 + LLM 자연어. 의학 진단 X, ADR-006 자문 거절 정신."
    },
  },
  name: {
    classic: {
    title: "묵향 선생 이름 풀이 파이프라인",
    hint: "/api/name/reading · 대법원 9389 한자 + 음운·자원오행 결정론",
    tagClass: "name",
    steps: [
      {n:1, t:"0s",    title:"사용자 이름 입력 (한글)", desc:"성·이름 자동 분리 (통계청 KOSIS 300위 + γ 보정 ADR-033).", meta:"name_uniqueness", adr:["ADR-029","ADR-033"]},
      {n:2, t:"0.1s",  title:"한자 후보 추출 (대법원 인명용 9389자)", desc:"한글 음 → 한자 후보 다중 (ADR-026 scourt API 9932자 확장 풀).", meta:"name_unihan · ADR-026", adr:["ADR-026"]},
      {n:3, t:"0.2s",  title:"5중 결정론 분석", desc:"① 두음법칙(name_dueum) ② 발음오행(name_baleum) ③ 자원오행(name_saju_ohaeng ADR-027) ④ 81수리(name_strokes) ⑤ 음양배합(name_eumyang).", meta:"5217줄 16 모듈", adr:["ADR-027","ADR-028"], star:true},
      {n:4, t:"0.3s",  title:"음운 결합 규칙 점검", desc:"한국어 음운 변동 Priority 1·2·3 (ADR-028·032). 어색한 결합 점수.", meta:"name_aesthetic + name_baleum"},
      {n:5, t:"0.4s",  title:"불용한자 + 가족 서열 점검", desc:"부모·형제 이름과의 중복·금기 (ADR-010 사실성 분리, 백중숙계).", meta:"name_bulyong · name_sibling_preference", adr:["ADR-010"]},
      {n:6, t:"0.5s",  title:"name_scoring 종합 점수", desc:"5개 영역 가중치 합산. 등급 산출 (대길·길·평·흉).", meta:"name_scoring 결정론"},
      {n:7, t:"0.6s",  title:"buildNamePrompt — 묵향 선생 페르소나", desc:"한자 + 5중 점수 + 음운 결합 → 한국 사극 학자 어조 프롬프트.", meta:"front prompt builder"},
      {n:8, t:"1~10s", title:"Gemini Flash Lite 자연어 풀이", desc:"묵향 선생 어조 + 5중 분석 인용 + 작명 권고 (선택).", meta:"/api/llm/chat", star:true},
      {n:9, t:"10s",   title:"렌더링 — 한자 카드 + 5중 점수 + 본문", desc:"성·이름 한자 + 발음·자원 오행 게이지 + 81수리 + 묵향 선생 본문.", ok:true},
    ],
    foot: "본 시스템 가장 풍부한 결정론 도메인 — 5217줄 16 모듈 + 10 ADR (001·003·010·016·026·027·028·029·032·033)."
    },
  },
  star: {
    classic: {
    title: "성하 공자 별빛 풀이 파이프라인",
    hint: "/api/star/reading · 서양 점성술 + 행성·궁·각도",
    tagClass: "star",
    steps: [
      {n:1, t:"0s",    title:"사용자 생년월일시 + 출생지 좌표", desc:"위경도 → 황도좌표계 변환. 사주와 같은 입력 재활용 가능.", meta:"front 입력 통일"},
      {n:2, t:"0.1s",  title:"행성 위치 계산 (10행성)", desc:"태양·달·수성·금성·화성·목성·토성·천왕성·해왕성·명왕성 황경. NASA JPL 또는 Swiss Ephemeris.", meta:"결정론 천문 계산", star:true},
      {n:3, t:"0.2s",  title:"하우스 시스템 (Placidus/Whole Sign)", desc:"12 하우스 + ASC/MC + IC/DSC. 사용자 좌표 의존.", meta:"하우스 분할"},
      {n:4, t:"0.3s",  title:"행성 간 각도 (aspects)", desc:"합·충·삼분·사분·육분 (0°·180°·120°·90°·60°). orb 허용 범위 ±5~8°.", meta:"각도 결정론"},
      {n:5, t:"0.4s",  title:"별자리·궁·하우스 매핑", desc:"각 행성 → 12 별자리 (양·황소·…·물고기) + 12 하우스 + aspects dict.", meta:"룩업 테이블"},
      {n:6, t:"0.5s",  title:"buildStarPrompt — 성하 공자 페르소나", desc:"행성·궁·각도 dict → 서양 점성술 학파 통설 인용 (마음·관계·직업).", meta:"front prompt builder"},
      {n:7, t:"1~10s", title:"Gemini Flash Lite 자연어 풀이", desc:"성하 공자 (별빛) 어조 + 행성·각도 인용 + 단정 회피.", meta:"/api/llm/chat", star:true},
      {n:8, t:"10s",   title:"렌더링 — 출생 차트 SVG + 본문", desc:"천체 차트 (행성 + 하우스 + 각도) 시각화 + 성하 공자 본문.", ok:true},
    ],
    foot: "⚠ 백엔드 미구현 (설계만) — web/server.py에 /api/star/reading 라우트 없음. 본 파이프라인은 7인 점술가 후속 확장 계획. 다른 8개 도메인은 실제 라우트 가동 중."
    },
  }
};
