import { ApiClient } from "./api/client.js";
import { HeaderMonitor } from "./components/header-monitor.js";
import { PipelineModal } from "./components/pipeline-modal.js";

class App {
  constructor() {
    this.api = new ApiClient();
  }

  start() {
    new HeaderMonitor(this.api).start();

    new PipelineModal().init();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new App().start());
} else {
  new App().start();
}
