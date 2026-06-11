import { ApiClient } from "./api/client.js";
import { HeaderMonitor } from "./components/header-monitor.js";
import { MetricsPanel } from "./components/metrics-panel.js";
import { FusionDemo, DreamDemo, AskDemo } from "./components/demo-runner.js";
import { PipelineModal } from "./components/pipeline-modal.js";

class App {
  constructor() {
    this.api = new ApiClient();
  }

  start() {
    new HeaderMonitor(this.api).start();
    new MetricsPanel(this.api).start();

    const demos = {
      fusion: new FusionDemo(this.api),
      dream:  new DreamDemo(this.api),
      ask:    new AskDemo(this.api),
    };
    document.querySelectorAll("[data-run]").forEach((btn) => {
      const key = btn.getAttribute("data-run");
      if (demos[key]) btn.addEventListener("click", () => demos[key].run());
    });

    new PipelineModal().init();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new App().start());
} else {
  new App().start();
}
