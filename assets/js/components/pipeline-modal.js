import { PIPELINES } from "../data/pipelines.js";
import { MENUS } from "../data/menus.js";
import { SYSTEM_PROMPTS } from "../data/prompts.js";
import { PIPELINE_TONES, DEFAULT_TONE } from "../config.js";
import { escSvg, escapeHtml, wrapSvgText } from "../utils.js";

const LAYOUT = {
  STEP_BASE_H: 90,
  STEP_GAP: 32,
  X_PAD: 60,
  NUM_X: 130,
  BOX_X: 180,
  BOX_W: 860,
};
LAYOUT.VIEW_W = LAYOUT.BOX_X + LAYOUT.BOX_W + 80;

export class PipelineModal {
  constructor() {
    this.bg   = document.getElementById("pipe-modal-bg");
    this.body = document.getElementById("pipe-modal-body");
    this.boundOnKeydown = (e) => { if (e.key === "Escape") this.close(); };
    this.boundOnBgClick = (e) => { if (e.target === this.bg) this.close(); };
    this.state = { mode: 'menu', nodeKey: null, optionKey: null };
    this.boundOnBackClick = () => this._goBackToMenu();
  }

  init() {
    document.querySelectorAll(".pipe-node").forEach((node) => {
      node.addEventListener("click", () => {
        const key = node.getAttribute("data-pipeline");
        this.open(key);
      });
    });
    document.addEventListener("keydown", this.boundOnKeydown);
    this.bg.addEventListener("click", this.boundOnBgClick);
  }

  open(nodeKey) {
    this.state = { mode: 'menu', nodeKey, optionKey: null };
    this._renderMenu(nodeKey);
    this.bg.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  _renderMenu(nodeKey) {
    const menu = MENUS[nodeKey];
    const tone = PIPELINE_TONES[nodeKey] || DEFAULT_TONE;
    if (!menu) {
      this.body.innerHTML = `<p style="color:#ff7a7a">MENUS["${escapeHtml(nodeKey)}"] 미정의</p>`;
      return;
    }
    const tagClass = nodeKey;
    const cards = (menu.items || []).map(item => this._renderMenuCard(item)).join('');
    const empty = (menu.items || []).length === 0
      ? `<div style="grid-column:1/-1;text-align:center;color:#9b8c63;padding:40px 0">옵션 메뉴 준비 중</div>` : '';

    this.body.innerHTML = `
      <button class="pipe-modal-close" id="pipe-modal-close" aria-label="close">×</button>
      <div class="pipe-modal-head">
        <span class="pipe-modal-tag ${tagClass}">${escapeHtml(nodeKey.toUpperCase())}</span>
        <h3>${escapeHtml(menu.master)}</h3>
        <span class="pipe-modal-hint">${escapeHtml(menu.masterSub || '')}</span>
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

  _renderMenuCard(item) {
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
      <button class="pipe-menu-card" type="button" data-option="${escSvg(item.key)}">
        <div class="pipe-menu-card-badges">${badges.join('')}</div>
        <div class="pipe-menu-card-glyph">${escapeHtml(item.glyph || '')}</div>
        <div class="pipe-menu-card-name">${escapeHtml(item.name)}</div>
        <p class="pipe-menu-card-desc">${escapeHtml(item.desc || '')}</p>
        <div class="pipe-menu-card-meta">
          <span>⏱ ${escapeHtml(item.est || '몇 분')}</span>
          <span>${tierIcon}</span>
        </div>
      </button>
    `;
  }

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

  _renderPipeline(nodeKey, optionKey) {
    const nodeBucket = PIPELINES[nodeKey];
    const data = nodeBucket && nodeBucket[optionKey];
    const tone = PIPELINE_TONES[nodeKey] || DEFAULT_TONE;
    if (!data) {
      this.body.innerHTML = `
        <button class="pipe-modal-close" id="pipe-modal-close" aria-label="close">×</button>
        <button class="pipe-modal-back" id="pipe-modal-back">← 메뉴로</button>
        <div class="pipe-modal-head">
          <span class="pipe-modal-tag ${nodeKey}">${escapeHtml(nodeKey.toUpperCase())}</span>
          <h3>${escapeHtml(optionKey)} (파이프라인 준비 중)</h3>
        </div>
        <p style="padding:40px 0;text-align:center;color:#9b8c63">PIPELINES["${escapeHtml(nodeKey)}"]["${escapeHtml(optionKey)}"] 미정의</p>
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
        <span class="pipe-modal-tag ${data.tagClass || nodeKey}">${escapeHtml(nodeKey.toUpperCase())}</span>
        <h3>${escapeHtml(data.title)}</h3>
        <span class="pipe-modal-hint">${escapeHtml(data.hint || '')}</span>
      </div>
      <div class="pipe-svg-wrap">${svg}</div>
      <div class="pipe-modal-foot">${escapeHtml(data.foot || '')}</div>
    `;
    document.getElementById("pipe-modal-close").addEventListener("click", () => this.close());
    document.getElementById("pipe-modal-back").addEventListener("click", this.boundOnBackClick);

    // 프롬프트 바 클릭 → 자식 모달 (이벤트 위임)
    this.body.querySelectorAll('g.prompt-bar').forEach((g) => {
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        const promptKey = g.getAttribute('data-prompt-key');
        if (promptKey) this._openPromptModal(promptKey);
      });
    });
  }

  _openPromptModal(promptKey) {
    const def = SYSTEM_PROMPTS[promptKey];
    if (!def) return;

    // 신규 자식 모달 DOM 생성 (z-index 부모 위로)
    let host = document.getElementById('prompt-modal-bg');
    if (!host) {
      host = document.createElement('div');
      host.id = 'prompt-modal-bg';
      host.className = 'prompt-modal-bg';
      host.innerHTML = `<div class="prompt-modal" role="dialog" aria-modal="true">
        <button class="prompt-modal-close" aria-label="close">×</button>
        <div class="prompt-modal-body"></div>
      </div>`;
      document.body.appendChild(host);
      host.addEventListener('click', (e) => { if (e.target === host) this._closePromptModal(); });
      host.querySelector('.prompt-modal-close').addEventListener('click', () => this._closePromptModal());
    }

    const body = host.querySelector('.prompt-modal-body');
    body.innerHTML = `
      <div class="prompt-modal-head">
        <span class="prompt-modal-tag">${escapeHtml(promptKey.toUpperCase())}</span>
        <h3>${escapeHtml(def.character)} · 실제 시스템 프롬프트 전문</h3>
        <span class="prompt-modal-source">출처: <code>${escapeHtml(def.source)}</code></span>
      </div>
      <pre class="prompt-modal-pre">${escapeHtml(def.full)}</pre>
      <div class="prompt-modal-foot">이 텍스트가 매 호출마다 LLM에게 그대로 전달됩니다 — 페르소나·금지 규칙·작성 형식이 모두 시스템 프롬프트에 하드코딩되어 있습니다.</div>
    `;

    host.classList.add('open');
    this._promptModalKeydown = (e) => { if (e.key === 'Escape') this._closePromptModal(); };
    document.addEventListener('keydown', this._promptModalKeydown);
  }

  _closePromptModal() {
    const host = document.getElementById('prompt-modal-bg');
    if (host) host.classList.remove('open');
    if (this._promptModalKeydown) {
      document.removeEventListener('keydown', this._promptModalKeydown);
      this._promptModalKeydown = null;
    }
  }

  close() {
    this.bg.classList.remove("open");
    document.body.style.overflow = "";
    this.state = { mode: 'menu', nodeKey: null, optionKey: null };
  }

  _renderSteps(data, tone) {
    let cursorY = 30;
    const groups = data.steps.map((s) => {
      const adrCount = (s.adr || []).length;
      const hasMeta  = !!s.meta;
      const hasPrompt = !!(s.promptKey && SYSTEM_PROMPTS[s.promptKey]);
      const lines    = Math.ceil((s.desc || "").length / 75);
      // 띠 yOff = 이전 컨텐츠(desc + meta + adr) 하단 + 8px 여백
      const promptBarY = 94 + lines * 18 + (hasMeta ? 18 : 0) + (adrCount ? 22 : 0) + 6;
      const h = hasPrompt
        ? promptBarY + 22 + 10  // 띠 22 + 띠 아래 10px 안전 여백
        : LAYOUT.STEP_BASE_H
          + Math.max(0, (lines - 1) * 18)
          + (hasMeta ? 18 : 0)
          + (adrCount ? 18 : 0);

      const { boxStroke, boxFill, dashAttr, numFill, titleFill } = this._stepStyle(s, tone);

      const metaTxt = hasMeta
        ? `<text x="20" y="${78 + lines * 18}" font-size="11" fill="#5f5638" font-family="JetBrains Mono,monospace">${escSvg(s.meta)}</text>`
        : "";

      const adrChips = this._renderAdrChips(s.adr, lines, hasMeta);
      const desc     = wrapSvgText(s.desc || "", 75, 20, 75, 18, "12", "#9b8c63");
      const promptBar = this._renderPromptBar(s, promptBarY);

      const grp = `
        <g transform="translate(${LAYOUT.BOX_X}, ${cursorY})">
          <rect width="${LAYOUT.BOX_W}" height="${h}" rx="10" fill="${boxFill}" stroke="${boxStroke}" stroke-width="${s.star ? 3 : 2}"${dashAttr}/>
          <text x="20" y="32" font-size="15" font-weight="600" fill="${titleFill}">${escSvg(s.title)}</text>
          <text x="20" y="54" font-size="11" font-family="JetBrains Mono,monospace" fill="#9b8c63">t = ${escSvg(s.t)}</text>
          ${desc}
          ${metaTxt}
          ${adrChips}
          ${promptBar}
        </g>
        <g transform="translate(${LAYOUT.NUM_X}, ${cursorY + h / 2})">
          <circle r="20" fill="${numFill}" stroke="#d4af37" stroke-width="2"/>
          <text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#080d1c">${s.n}</text>
        </g>
      `;

      const markerFill = s.star || s.ok ? "var(--gold-bri)" : s.warn ? "#ff7a7a" : tone.main;
      const markerColor = s.star || s.ok ? "var(--gold-bri)" : s.warn ? "#ff7a7a" : "#6e5a26";
      const timeMarker = `
        <circle cx="${LAYOUT.X_PAD}" cy="${cursorY + h / 2}" r="3" fill="${markerFill}"/>
        <text x="${LAYOUT.X_PAD - 12}" y="${cursorY + h / 2 + 4}" text-anchor="end" font-size="10" fill="${markerColor}" font-family="JetBrains Mono,monospace">${escSvg(s.t)}</text>
      `;

      const isLast = s === data.steps[data.steps.length - 1];
      const arrowY1 = cursorY + h + 2;
      const arrowY2 = cursorY + h + LAYOUT.STEP_GAP - 2;
      const arrow = isLast ? "" :
        `<line x1="${LAYOUT.BOX_X + LAYOUT.BOX_W / 2}" y1="${arrowY1}" x2="${LAYOUT.BOX_X + LAYOUT.BOX_W / 2}" y2="${arrowY2}" stroke="${tone.main}" stroke-width="2" opacity="0.5"/>`;

      cursorY += h + LAYOUT.STEP_GAP;
      return timeMarker + grp + arrow;
    }).join("");

    return { stepGroups: groups, totalH: cursorY + 20 };
  }

  _stepStyle(s, tone) {
    const boxStroke = s.star ? "var(--gold-bri)" : s.warn ? "#ff7a7a" : s.ok ? "#8de28d" : tone.main;
    const boxFill   = s.star ? "rgba(244,211,94,0.10)" : s.warn ? "rgba(255,122,122,0.06)" : s.ok ? "rgba(141,226,141,0.08)" : tone.glow;
    const dashAttr  = s.warn ? ' stroke-dasharray="6,4"' : "";
    const numFill   = s.star ? "var(--gold-bri)" : s.warn ? "#ff7a7a" : s.ok ? "#8de28d" : tone.main;
    const titleFill = s.star ? "var(--gold-bri)" : s.warn ? "#ff7a7a" : s.ok ? "#8de28d" : tone.main;
    return { boxStroke, boxFill, dashAttr, numFill, titleFill };
  }

  _renderAdrChips(adr, lines, hasMeta) {
    if (!adr || !adr.length) return "";
    let xOff = 20;
    const yOff = 94 + lines * 18 + (hasMeta ? 18 : 0);
    const chips = adr.map((a) => {
      const w = a.length * 7 + 14;
      const chip = `<g transform="translate(${xOff}, 0)">
        <rect width="${w}" height="16" rx="8" fill="rgba(212,175,55,0.10)" stroke="rgba(212,175,55,0.25)"/>
        <text x="${w / 2}" y="12" font-size="9" fill="#d4af37" font-family="JetBrains Mono,monospace" text-anchor="middle">${a}</text>
      </g>`;
      xOff += w + 6;
      return chip;
    }).join("");
    return `<g transform="translate(0, ${yOff})">${chips}</g>`;
  }

  _renderPromptBar(s, yOff) {
    if (!s.promptKey || !SYSTEM_PROMPTS[s.promptKey]) return "";
    const promptDef = SYSTEM_PROMPTS[s.promptKey];
    // yOff는 호출자가 직접 계산해 넘긴다 (이전 컨텐츠 bottom + 여백)
    const barW = LAYOUT.BOX_W - 40;
    const label = `📜 ${promptDef.character} 시스템 프롬프트 전문 보기`;
    return `<g class="prompt-bar" transform="translate(20, ${yOff})" data-prompt-key="${escSvg(s.promptKey)}" style="cursor:pointer">
      <rect width="${barW}" height="22" rx="11" fill="rgba(244,211,94,0.14)" stroke="var(--gold-bri)" stroke-width="1"/>
      <text x="14" y="15" font-size="11" font-weight="600" fill="var(--gold-bri)" font-family="'Noto Serif KR',serif">${escSvg(label)}</text>
      <text x="${barW - 14}" y="15" text-anchor="end" font-size="11" fill="var(--gold-bri)" font-family="JetBrains Mono,monospace">click →</text>
    </g>`;
  }

  _renderSvg(stepGroups, totalH) {
    return `
      <svg viewBox="0 0 ${LAYOUT.VIEW_W} ${totalH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;font-family:'Noto Serif KR',serif">
        <line x1="${LAYOUT.X_PAD}" y1="20" x2="${LAYOUT.X_PAD}" y2="${totalH - 20}" stroke="#6e5a26" stroke-width="2" opacity="0.4"/>
        <text x="${LAYOUT.X_PAD}" y="14" text-anchor="middle" font-size="10" fill="#9b8c63" font-family="JetBrains Mono,monospace">t = 0</text>
        ${stepGroups}
      </svg>
    `;
  }
}
