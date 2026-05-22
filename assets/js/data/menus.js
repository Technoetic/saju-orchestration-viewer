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
  dream:      { master: '몽이 도령', masterSub: '꿈해몽 + HvDC 멀티에이전트', items: [] },
  divination: { master: '화선 낭자', masterSub: '꽃패·타로·주역',           items: [] },
  star:       { master: '성하 공자', masterSub: '서양 점성술 + 동양 28수',   items: [] },
  face:       { master: '운학 도사', masterSub: 'Opus Vision + 결정론 관상', items: [] },
  palm:       { master: '옥선 할미', masterSub: '4대선 + 금성대',           items: [] },
  name:       { master: '묵향 선생', masterSub: '대법원 9389 한자 작명',    items: [] },
  mbti:       { master: 'MBTI 프로필러', masterSub: '4학파 룩업 (viewer 전용)', items: [] },
  clinical:   { master: '임상 스크리닝', masterSub: '8 표준 척도 (viewer 전용)', items: [] },
};
