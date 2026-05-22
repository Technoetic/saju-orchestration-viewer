// assets/js/data/menus.js
// 9 pipe-node 클릭 시 모달 상단에 표시되는 옵션 메뉴 정의.
// 7 노드(saju·dream·divination·star·face·palm·name)는 운영 front/js/data/contents.js 1:1 미러.
// 2 노드(mbti·clinical)는 viewer 전용 정의 (운영 contents.js에 대응 도사 없음).
// 본 파일 각 항목의 'key' 값은 PIPELINES[<node>][<key>] 조회 키와 일치해야 한다.

export const MENUS = {
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
  dream: {
    master: '몽이 도령',
    masterSub: '호접몽을 거니는 꿈의 길잡이 · 꿈 풀이',
    items: [
      { key:'today',     name:'오늘의 꿈해몽',  glyph:'夢 占', tier:'free',    badges:['hot'], est:'5분',         desc:'어젯밤 꾸신 꿈을 가볍게 풀어드립니다. 한 줄만 적어주셔도 좋아요.' },
      { key:'dict',      name:'꿈 사전',         glyph:'夢 典', tier:'free',    badges:[],      est:'몇 분',       desc:'동양 전통 꿈 사전. 등장한 사물·동물·장소로 검색하실 수 있습니다.' },
      { key:'classic',   name:'정통 꿈 풀이',    glyph:'夢 解', tier:'premium', badges:[],      est:'30~60초',     desc:'14 AI 에이전트·30 도메인 분석으로 꿈의 깊은 의미를 펼쳐드립니다.' },
      { key:'recurring', name:'반복되는 꿈',     glyph:'輪 廻', tier:'premium', badges:['new'], est:'5~10분',      desc:'자주 꾸는 꿈의 의미·무의식 패턴을 깊이 분석해드립니다.' },
      { key:'baby',      name:'태몽 풀이',       glyph:'胎 夢', tier:'premium', badges:[],      est:'5~10분',      desc:'임산부 대상 — 태몽의 의미·아이의 미래를 풀어드립니다.' },
      { key:'nightmare', name:'악몽 분석',       glyph:'惡 夢', tier:'premium', badges:[],      est:'10~15분',     desc:'IRT 악몽 워크플로 — 악몽의 의미 풀이와 심리적 해소법을 안내합니다.' },
      { key:'lucid',     name:'자각몽 가이드',   glyph:'覺 夢', tier:'premium', badges:['new'], est:'7일 프로그램', desc:'Dormio TDI 활용 — 자각몽 입문 7일 가이드 프로그램입니다.' },
    ]
  },
  divination: {
    master: '화선 낭자',
    masterSub: '꽃패 12 풀이 (한국 정통 화투 학파) · 본 시스템 타로·주역 모듈 부재 — 화패 단일',
    items: [
      { key:'today',             name:'오늘의 꽃패',           glyph:'今 牌', tier:'free',    badges:['hot'], est:'5분',     desc:'매일 카드 한 장 — 오늘의 메시지를 꽃패로 풀어드려요.' },
      { key:'heart',             name:'그 사람의 속마음',      glyph:'心 情', tier:'premium', badges:['hot'], est:'5~10분',  desc:'"그 사람은 지금 무슨 생각일까?" — 마음 깊은 곳을 꽃패가 비춰드려요.' },
      { key:'who-likes',         name:'지금 나를 좋아하는 사람', glyph:'戀 慕', tier:'premium', badges:['hot'], est:'5~10분',  desc:'"나를 마음에 둔 사람은 누굴까?" — 짝사랑·썸 시장의 인기 풀이예요.' },
      { key:'reunion-month',     name:'이달의 재회 확률',      glyph:'再 緣', tier:'premium', badges:[],      est:'5~10분',  desc:'헤어진 연인과 이번 달 재회할 가능성을 꽃패로 짚어드려요.' },
      { key:'reunion-today',     name:'오늘의 재회 확률',      glyph:'今 緣', tier:'premium', badges:[],      est:'5분',     desc:'매일 갱신되는 재회 가능성. 오늘만의 흐름을 짚어드려요.' },
      { key:'breakup-thinking',  name:'이별이 고민될 때',      glyph:'別 心', tier:'premium', badges:[],      est:'10~15분', desc:'"정말 우리는 여기까지인 걸까?" — 위기 상황의 마음을 꽃패가 비춰드려요.' },
      { key:'image',             name:'사람들이 보는 내 이미지', glyph:'影 像', tier:'premium', badges:[],      est:'5~10분',  desc:'"나는 어떤 사람으로 보여질까?" — 자기이해와 인간관계의 거울이에요.' },
      { key:'classic',           name:'정통 꽃패 풀이',        glyph:'花 牌', tier:'free',    badges:[],      est:'5~10분',  desc:'78장 정통 화패 — 4가지 스프레드 (1장/3장/5장/10장).' },
      { key:'fate-one',          name:'운명의 한 장',          glyph:'運 一', tier:'premium', badges:[],      est:'10~15분', desc:'평생 운명을 가리키는 단 한 장의 카드. 가장 깊은 풀이.' },
      { key:'decision',          name:'결정의 갈림길',         glyph:'決 路', tier:'premium', badges:['new'], est:'10분',    desc:'"이 선택, 해도 될까?" — 진로·이직·이사 등 큰 결정 앞에서의 답.' },
      { key:'future-fate',       name:'미래의 인연',           glyph:'未 緣', tier:'premium', badges:['hot'], est:'10~15분', desc:'곧 만날 사람 — 외모·성격·만나는 시기·장소를 꽃패가 비춰드려요.' },
      { key:'life-card',         name:'인생 카드',             glyph:'一 生', tier:'premium', badges:['hot'], est:'15~20분', desc:'인생 전체를 보는 10장 스프레드. 과거-현재-미래를 종합한 평생 풀이서.' },
    ]
  },
  star: {
    master: '성하 공자',
    masterSub: '별의 강(銀河)의 귀공자 · 별빛(점성) 풀이',
    items: [
      { key:'today-zodiac',  name:'오늘의 별자리 운세', glyph:'日 星',  tier:'free',    badges:['hot'],         est:'5분',     desc:'12 별자리 × 매일 갱신 — 오늘의 천공 흐름을 가볍게 짚어드립니다.' },
      { key:'big3',          name:'빅3 분석',           glyph:'三 星',  tier:'free',    badges:[],              est:'5~10분',  desc:'태양·달·상승 — 점성술의 가장 친숙한 입문 풀이.' },
      { key:'classic',       name:'정통 별빛 풀이',     glyph:'星 河',  tier:'premium', badges:[],              est:'15~20분', desc:'출생 차트(Natal Chart) — 10 행성 × 12 하우스 종합 점성술.' },
      { key:'love-stars',    name:'별의 연서',          glyph:'戀 星',  tier:'premium', badges:['hot'],         est:'10~15분', desc:'연애 점성술 — 별자리 속 숨겨진 인연의 좌표를 풀어드립니다.' },
      { key:'compatibility', name:'별자리 궁합',        glyph:'合 星',  tier:'premium', badges:[],              est:'10~15분', desc:'12 × 12 = 144 조합 — 빅3 매칭, 상극/조화 분석.' },
      { key:'east28',        name:'동양 28수 풀이',     glyph:'二十八', tier:'premium', badges:['new'],         est:'15~20분', desc:'한국 천상열차분야지도 기반 — 다른 앱에 없는 동양 점성술.' },
      { key:'transit',       name:'행운의 시기',        glyph:'運 行',  tier:'premium', badges:[],              est:'10분',    desc:'현재 행성 흐름(트랜짓) — 좋은 시기·어려운 시기를 예측해드립니다.' },
      { key:'saju-star',     name:'사주 + 별빛 통합 분석', glyph:'日 月', tier:'premium', badges:['hot'],         est:'20분',    desc:'만월 아씨 + 성하 공자 합작 — 동서양 융합 풀이의 강력한 차별화.' },
    ]
  },
  face:       { master: '운학 도사', masterSub: 'Opus Vision + 결정론 관상', items: [] },
  palm:       { master: '옥선 할미', masterSub: '4대선 + 금성대',           items: [] },
  name:       { master: '묵향 선생', masterSub: '대법원 9389 한자 작명',    items: [] },
  mbti:       { master: 'MBTI 프로필러', masterSub: '4학파 룩업 (viewer 전용)', items: [] },
  clinical:   { master: '임상 스크리닝', masterSub: '8 표준 척도 (viewer 전용)', items: [] },
};
