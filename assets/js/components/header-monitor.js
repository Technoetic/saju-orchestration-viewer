import { REFRESH_INTERVAL_MS } from "../config.js";

export class HeaderMonitor {
  constructor(api) {
    this.api = api;
    this.elStatus = document.getElementById("h-status");
    this.elReq    = document.getElementById("h-req");
    this.elAvg    = document.getElementById("h-avg");
    this.elP95    = document.getElementById("h-p95");
  }

  async refresh() {
    try {
      const [h, m] = await Promise.all([
        this.api.getJson("/api/health"),
        this.api.getJson("/metrics"),
      ]);
      this.elStatus.textContent = h.status === "ok" ? "OPERATIONAL" : "DEGRADED";
      this.elReq.textContent    = m.requests_total ?? "–";
      this.elAvg.textContent    = (m.avg_duration_ms ?? 0).toFixed(1);
      this.elP95.textContent    = (m.p95_ms ?? 0).toFixed(1);
    } catch {
      this.elStatus.textContent = "OFFLINE";
    }
  }

  start() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), REFRESH_INTERVAL_MS);
  }
}
