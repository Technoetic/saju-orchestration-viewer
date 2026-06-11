import { PipelineModal } from "./components/pipeline-modal.js";

function start() {
  new PipelineModal().init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
