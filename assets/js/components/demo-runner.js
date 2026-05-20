import { sleep } from "../utils.js";
import { EdgeFlow } from "./edge-flow.js";

export class DemoRunner {
  constructor({ name, api, edges }) {
    this.name = name;
    this.api = api;
    this.edges = edges;
    this.out = document.getElementById(`result-${name}`);
    this.btn = document.querySelector(`[data-run="${name}"]`);
  }

  setStage(idx, state, ms) {
    const el = document.querySelector(`#stages-${this.name} [data-s="${idx}"]`);
    if (!el) return;
    el.classList.remove("active", "done", "err");
    el.classList.add(state);
    if (ms != null) el.querySelector(".ms").textContent = "+" + ms + "ms";
  }

  resetStages() {
    document.querySelectorAll(`#stages-${this.name} .stage`).forEach((s) => {
      s.classList.remove("active", "done", "err");
      s.querySelector(".ms").textContent = "";
    });
  }

  ms(t0) {
    return Math.round(performance.now() - t0);
  }

  setError(stageIdx, err) {
    this.setStage(stageIdx, "err");
    this.out.classList.add("json");
    this.out.textContent = "ERROR: " + err.message;
  }

  async run() {
    this.resetStages();
    this.out.textContent = "";
    this.btn.disabled = true;
    EdgeFlow.highlight(this.edges, true);
    try {
      await this.execute();
    } finally {
      EdgeFlow.highlight(this.edges, false);
      this.btn.disabled = false;
    }
  }

  // 서브클래스에서 구현
  async execute() {
    throw new Error("execute() not implemented");
  }
}

export class FusionDemo extends DemoRunner {
  constructor(api) {
    super({ name: "fusion", api, edges: ["e-saju", "e-mbti"] });
  }

  async execute() {
    const t0 = performance.now();
    try {
      this.setStage(0, "active");
      const dt     = document.getElementById("f-dt").value.trim();
      const gender = document.getElementById("f-gender").value;
      const mbti   = document.getElementById("f-mbti").value;
      if (!dt) throw new Error("dt_local 필요");
      this.setStage(0, "done", this.ms(t0));

      for (const idx of [1, 2, 3]) {
        this.setStage(idx, "active");
        await sleep(idx === 1 ? 120 : 80);
        this.setStage(idx, "done", this.ms(t0));
      }

      this.setStage(4, "active");
      const data = await this.api.postJson("/api/saju/fusion", {
        saju: { dt_local: dt, gender }, mbti,
      });
      this.setStage(4, "done", this.ms(t0));

      this.setStage(5, "active");
      await sleep(60);
      this.setStage(5, "done", this.ms(t0));

      this.out.classList.remove("json");
      this.out.textContent = data.text || JSON.stringify(data, null, 2);
    } catch (e) {
      this.setError(4, e);
    }
  }
}

export class DreamDemo extends DemoRunner {
  constructor(api) {
    super({ name: "dream", api, edges: ["e-dream", "e-clinical"] });
  }

  async execute() {
    const t0 = performance.now();
    try {
      const txt = document.getElementById("d-text").value.trim();
      if (!txt) throw new Error("dream_text 비어있음");

      for (let i = 0; i < 4; i++) {
        this.setStage(i, "active");
        await sleep(90 + i * 40);
        this.setStage(i, "done", this.ms(t0));
      }

      this.setStage(4, "active");
      const data = await this.api.postJson("/api/dream/interpret_v2", { dream_text: txt });
      this.setStage(4, "done", this.ms(t0));

      this.setStage(5, "active");
      await sleep(60);
      this.setStage(5, "done", this.ms(t0));

      this.out.classList.remove("json");
      this.out.textContent = data.text || data.interpretation || JSON.stringify(data, null, 2);
    } catch (e) {
      this.setError(4, e);
    }
  }
}

export class AskDemo extends DemoRunner {
  constructor(api) {
    super({ name: "ask", api, edges: ["e-saju"] });
  }

  async execute() {
    const t0 = performance.now();
    try {
      const q      = document.getElementById("a-q").value.trim();
      const dt     = document.getElementById("a-dt").value.trim();
      const gender = document.getElementById("a-gender").value;
      if (!q) throw new Error("질문 필요");

      for (let i = 0; i < 3; i++) {
        this.setStage(i, "active");
        await sleep(80 + i * 30);
        this.setStage(i, "done", this.ms(t0));
      }

      this.setStage(3, "active");
      const data = await this.api.postJson("/api/saju/ask", {
        question: q, saju: { dt_local: dt, gender },
      });
      this.setStage(3, "done", this.ms(t0));

      for (const idx of [4, 5]) {
        this.setStage(idx, "active");
        await sleep(50);
        this.setStage(idx, "done", this.ms(t0));
      }

      this.out.classList.remove("json");
      const tail = data.legal_notice ? "\n\n" + data.legal_notice : "";
      this.out.textContent =
        (data.answer || JSON.stringify(data, null, 2)) + tail +
        (data.turns_used ? `\n\n[turns_used: ${data.turns_used}/${data.turns_max}]` : "");
    } catch (e) {
      this.setError(3, e);
    }
  }
}
