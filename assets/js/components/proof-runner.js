import { escapeHtml } from "../utils.js";

export class ProofRunner {
  constructor(api) {
    this.api = api;
    this.btn = document.getElementById("p-run");
    this.engineEl   = document.getElementById("p-engine");
    this.groundedEl = document.getElementById("p-grounded");
    this.nakedEl    = document.getElementById("p-naked");
  }

  setPT(idx, state) {
    const el = document.querySelector(`#p-timeline [data-pt="${idx}"]`);
    if (!el) return;
    el.classList.remove("on", "done", "err");
    if (state) el.classList.add(state);
  }

  resetPT() {
    document.querySelectorAll("#p-timeline .t").forEach((el) => {
      el.classList.remove("on", "done", "err");
    });
  }

  extractEngineKeys(engine) {
    const keys = new Set();
    const push = (v) => {
      if (typeof v === "string" && v.trim()) keys.add(v.trim());
    };
    const a = engine.alias || {};
    push(a.day_master_name);
    push(a.strongest);
    push(a.weakest);
    push(a.headline);
    push(a.day_master_trait);
    push(a.suffix);
    ["day", "month", "year", "hour"].forEach((k) => {
      const v = engine[k];
      if (typeof v === "string") {
        const ko = v.replace(/\([^)]+\)/g, "").trim();
        if (ko) keys.add(ko);
      }
    });
    if (engine.day_master) keys.add(engine.day_master);
    if (engine.pattern) keys.add(engine.pattern);
    (engine.luck_cycle || []).slice(0, 3).forEach((lc) => {
      if (lc.ganzhi) {
        const ko = lc.ganzhi.replace(/\([^)]+\)/g, "").trim();
        if (ko) keys.add(ko);
      }
    });
    Object.keys(engine.wuxing_dist || {}).forEach((k) => keys.add(k));
    Object.keys(engine.ten_gods || {}).forEach((k) => { if (k.length <= 4) keys.add(k); });
    return [...keys].filter((k) => k && k.length >= 1 && k.length <= 12);
  }

  highlightKeys(text, keys, cls) {
    let html = escapeHtml(text);
    const hits = {};
    const sorted = [...keys].sort((a, b) => b.length - a.length);
    sorted.forEach((k) => {
      if (!k) return;
      const ek = escapeHtml(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(ek, "g");
      let count = 0;
      html = html.replace(re, (m) => { count++; return `<span class="${cls}">${m}</span>`; });
      if (count) hits[k] = count;
    });
    return { html, hits, total: Object.values(hits).reduce((a, b) => a + b, 0) };
  }

  renderEngineSummary(engine) {
    const a   = engine.alias || {};
    const wux = engine.wuxing_dist || {};
    const lc  = engine.luck_cycle || [];
    const hot  = (k, v) => `<div><span class="kchip hot">${escapeHtml(k)}</span> ${escapeHtml(String(v))}</div>`;
    const cool = (k, v) => `<div><span class="kchip">${escapeHtml(k)}</span> ${escapeHtml(String(v))}</div>`;
    const wuxLine = Object.entries(wux).map(([k, v]) =>
      `<span class="kchip">${escapeHtml(k)}:${typeof v === "number" ? v.toFixed(2) : v}</span>`
    ).join(" ");
    const lcLine = lc.slice(0, 4).map((x) =>
      `<span class="kchip">${escapeHtml((x.ganzhi || "").replace(/\([^)]+\)/g, "").trim())}·${x.start_age}세</span>`
    ).join(" ");
    return [
      hot("day_master",   engine.day_master || a.day_master_name || ""),
      hot("strongest 오행", a.strongest || ""),
      cool("weakest 오행", a.weakest || ""),
      cool("pattern",     engine.pattern || ""),
      cool("day(일주)",    engine.day || ""),
      cool("month",       engine.month || ""),
      cool("year",        engine.year || ""),
      cool("hour",        engine.hour || ""),
      `<div style="margin-top:8px"><span class="kchip">wuxing_dist</span> ${wuxLine}</div>`,
      `<div style="margin-top:6px"><span class="kchip">luck_cycle</span> ${lcLine}</div>`,
      a.summary ? `<div style="margin-top:10px;color:#a6e0aa;font-family:'Noto Serif KR',serif;font-size:12.5px;line-height:1.6">${escapeHtml(a.summary)}</div>` : "",
    ].join("");
  }

  buildEngineBrief(engine, mbti) {
    const a = engine.alias || {};
    const wuxStr = Object.entries(engine.wuxing_dist || {})
      .map(([k, v]) => `${k}:${typeof v === "number" ? v.toFixed(2) : v}`).join(", ");
    const lcStr = (engine.luck_cycle || []).slice(0, 3)
      .map((x) => (x.ganzhi || "").replace(/\([^)]+\)/g, "").trim() + `(${x.start_age}세~)`).join(", ");
    return (
      `[이 사람의 명식 (결정론적 엔진 산출)]\n` +
      `- 일간(day_master): ${engine.day_master || a.day_master_name || ""}\n` +
      `- 일주(day): ${engine.day || ""}, 월주: ${engine.month || ""}, 년주: ${engine.year || ""}, 시주: ${engine.hour || ""}\n` +
      `- 가장 강한 오행: ${a.strongest || ""}, 가장 약한 오행: ${a.weakest || ""}\n` +
      `- 격(pattern): ${engine.pattern || ""}\n` +
      `- 오행분포: ${wuxStr}\n` +
      `- 대운 흐름: ${lcStr}\n` +
      `- 헤드라인: ${a.headline || ""}\n` +
      `- MBTI: ${mbti}\n`
    );
  }

  async run() {
    this.btn.disabled = true;
    this.resetPT();
    const dt     = document.getElementById("p-dt").value.trim();
    const gender = document.getElementById("p-gender").value;
    const mbti   = document.getElementById("p-mbti").value;
    const q      = document.getElementById("p-q").value.trim();

    this.engineEl.innerHTML   = '<span class="placeholder">계산 중…</span>';
    this.groundedEl.innerHTML = '<span class="placeholder">대기 중…</span>';
    this.nakedEl.innerHTML    = '<span class="placeholder">대기 중…</span>';
    ["p-hits-g", "p-hits-n", "p-len-g", "p-len-n"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "–";
    });

    try {
      this.setPT(0, "on");
      const engine = await this.api.postJson("/api/saju", { dt_local: dt, gender });
      this.setPT(0, "done");

      this.setPT(1, "on");
      this.engineEl.innerHTML = this.renderEngineSummary(engine);
      const keys = this.extractEngineKeys(engine);
      this.setPT(1, "done");

      this.setPT(2, "on");
      this.setPT(3, "on");
      this.groundedEl.innerHTML = '<span class="placeholder">LLM 응답 생성 중… (engine.json 컨텍스트 주입)</span>';
      this.nakedEl.innerHTML    = '<span class="placeholder">LLM 응답 생성 중… (엔진 없이 동일 질문)</span>';

      const engineBrief = this.buildEngineBrief(engine, mbti);
      const groundedQ = engineBrief + `\n[질문]\n${q}\n위 명식 데이터를 직접 인용해서 4~6문장으로 답해주세요.`;

      const [gRes, nRes] = await Promise.allSettled([
        this.api.postRaw("/api/saju/ask", {
          question: groundedQ, saju: { dt_local: dt, gender },
        }),
        this.api.postRaw("/api/llm/chat", {
          prompt: q + `\n\n(참고 입력: MBTI ${mbti}, 생년월일시 ${dt}, 성별 ${gender})\n한국어로 4~6문장으로 답하세요. 사주를 모르면 모른다고 하세요.`,
          system: "당신은 사주·운세 해석가입니다. 명식 계산 도구는 없습니다. 사용자가 제공한 정보만 사용하세요.",
          max_tokens: 500,
        }),
      ]);

      let groundedText = "";
      if (gRes.status === "fulfilled") {
        const v = gRes.value;
        groundedText = v.answer || v.text || v._raw || JSON.stringify(v);
        this.setPT(2, "done");
      } else {
        groundedText = "(grounded 호출 실패: " + gRes.reason + ")";
        this.setPT(2, "err");
      }

      let nakedText = "";
      if (nRes.status === "fulfilled") {
        const v = nRes.value;
        nakedText = v.text || v.answer || v.message || v.content || v._raw || JSON.stringify(v);
        this.setPT(3, "done");
      } else {
        nakedText = "(naked LLM 호출 실패: " + nRes.reason + ")";
        this.setPT(3, "err");
      }

      this.setPT(4, "on");
      const gh = this.highlightKeys(groundedText, keys, "gh");
      const nh = this.highlightKeys(nakedText,    keys, "gh");

      this.groundedEl.innerHTML = gh.html;
      this.nakedEl.innerHTML    = nh.html;

      document.getElementById("p-hits-g").textContent = gh.total + " 개";
      document.getElementById("p-hits-n").textContent = nh.total + " 개";
      document.getElementById("p-len-g").textContent  = groundedText.length + " 자";
      document.getElementById("p-len-n").textContent  = nakedText.length + " 자";
      this.setPT(4, "done");
    } catch (e) {
      this.engineEl.innerHTML =
        '<span class="placeholder" style="color:#ff7a7a">ERROR: ' + escapeHtml(e.message) + '</span>';
    } finally {
      this.btn.disabled = false;
    }
  }
}
