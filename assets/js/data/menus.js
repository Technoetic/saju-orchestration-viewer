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
