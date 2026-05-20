import { REFRESH_INTERVAL_MS } from "../config.js";

export class MetricsPanel {
  constructor(api) {
    this.api = api;
    this.ids = [
      "m-req", "m-err", "m-p95",
      "m-dream", "m-crisis",
      "m-imgcache", "m-musccache",
      "m-rl", "m-cost",
    ];
    this.el = Object.fromEntries(this.ids.map((id) => [id, document.getElementById(id)]));
  }

  async refresh() {
    try {
      const [m, a] = await Promise.all([
        this.api.getJson("/metrics"),
        this.api.getJson("/api/analytics"),
      ]);
      this.set("m-req",       m.requests_total ?? "–");
      this.set("m-err",       ((m.error_rate ?? 0) * 100).toFixed(2) + "%");
      this.set("m-p95",       (m.p50_ms ?? 0).toFixed(1) + " / " + (m.p95_ms ?? 0).toFixed(1));
      this.set("m-dream",     a.dream_v2_calls ?? 0);
      this.set("m-crisis",    a.dream_v2_crisis_blocked ?? 0);
      this.set("m-imgcache",  ((a.cache_image_hit_rate ?? 0) * 100).toFixed(1) + "%");
      this.set("m-musccache", ((a.cache_music_hit_rate ?? 0) * 100).toFixed(1) + "%");
      this.set("m-rl",        a.rate_limited_ips ?? 0);
      this.set("m-cost",      "$" + (a.estimated_cost_usd ?? 0).toFixed(4));
    } catch {
      // 무시 — 다음 주기에 재시도
    }
  }

  set(id, value) {
    const el = this.el[id];
    if (el) el.textContent = value;
  }

  start() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), REFRESH_INTERVAL_MS);
  }
}
