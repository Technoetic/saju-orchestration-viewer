import { PIPELINES } from "../data/pipelines.js";
import { PIPELINE_TONES, DEFAULT_TONE } from "../config.js";
import { escSvg, wrapSvgText } from "../utils.js";

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

  open(key) {
    const data = PIPELINES[key];
    if (!data) return;
    const tone = PIPELINE_TONES[key] || DEFAULT_TONE;

    const { stepGroups, totalH } = this._renderSteps(data, tone);
    const svg = this._renderSvg(stepGroups, totalH);

    this.body.innerHTML = `
      <button class="pipe-modal-close" id="pipe-modal-close" aria-label="close">×</button>
      <div class="pipe-modal-head">
        <span class="pipe-modal-tag ${data.tagClass}">${key.toUpperCase()}</span>
        <h3>${data.title}</h3>
        <span class="pipe-modal-hint">${data.hint}</span>
      </div>
      <div class="pipe-svg-wrap">${svg}</div>
      <div class="pipe-modal-foot">${data.foot}</div>
    `;
    this.bg.classList.add("open");
    document.body.style.overflow = "hidden";

    document.getElementById("pipe-modal-close").addEventListener("click", () => this.close());
  }

  close() {
    this.bg.classList.remove("open");
    document.body.style.overflow = "";
  }

  _renderSteps(data, tone) {
    let cursorY = 30;
    const groups = data.steps.map((s) => {
      const adrCount = (s.adr || []).length;
      const hasMeta  = !!s.meta;
      const lines    = Math.ceil((s.desc || "").length / 75);
      const h = LAYOUT.STEP_BASE_H + Math.max(0, (lines - 1) * 18) + (hasMeta ? 18 : 0) + (adrCount ? 18 : 0);

      const { boxStroke, boxFill, dashAttr, numFill, titleFill } = this._stepStyle(s, tone);

      const metaTxt = hasMeta
        ? `<text x="20" y="${78 + lines * 18}" font-size="11" fill="#5f5638" font-family="JetBrains Mono,monospace">${escSvg(s.meta)}</text>`
        : "";

      const adrChips = this._renderAdrChips(s.adr, lines, hasMeta);
      const desc     = wrapSvgText(s.desc || "", 75, 20, 75, 18, "12", "#9b8c63");

      const grp = `
        <g transform="translate(${LAYOUT.BOX_X}, ${cursorY})">
          <rect width="${LAYOUT.BOX_W}" height="${h}" rx="10" fill="${boxFill}" stroke="${boxStroke}" stroke-width="${s.star ? 3 : 2}"${dashAttr}/>
          <text x="20" y="32" font-size="15" font-weight="600" fill="${titleFill}">${escSvg(s.title)}</text>
          <text x="20" y="54" font-size="11" font-family="JetBrains Mono,monospace" fill="#9b8c63">t = ${escSvg(s.t)}</text>
          ${desc}
          ${metaTxt}
          ${adrChips}
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
