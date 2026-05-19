"""대시보드 5개 노드 클릭 → 모달 스크린샷 자동 캡처.

본 AI가 모달 시각을 직접 볼 수 있도록 Playwright로 자동 시연.
출력: pw_work/modal_<key>.png + pw_work/modal_check.log
"""
import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
WORK = HERE / "pw_work"
WORK.mkdir(parents=True, exist_ok=True)

log_path = WORK / "modal_check.log"
log_f = open(log_path, "w", encoding="utf-8", buffering=1)
sys.stdout = log_f
sys.stderr = log_f


def log(msg):
    print(msg, flush=True)


PIPELINE_KEYS = ["saju", "mbti", "dream", "divination", "clinical"]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1480, "height": 900})
    page = ctx.new_page()

    page.on("console", lambda m: log(f"[console.{m.type}] {m.text}"))
    page.on("pageerror", lambda e: log(f"[pageerror] {e}"))

    page.goto("http://localhost:8770/index.html",
              wait_until="domcontentloaded", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
    time.sleep(1)
    log("LOADED")

    # 대시보드 전체 1차 스크린샷
    page.screenshot(path=str(WORK / "dashboard_full.png"), full_page=True)
    log("dashboard_full.png saved")

    for key in PIPELINE_KEYS:
        log(f"\n=== Pipeline: {key} ===")
        try:
            # 모달이 떠있으면 ESC로 닫고 진행
            page.keyboard.press("Escape")
            time.sleep(0.3)

            # SVG 안 .pipe-node[data-pipeline=key] 클릭
            sel = f'g.pipe-node[data-pipeline="{key}"]'
            page.locator(sel).first.scroll_into_view_if_needed()
            time.sleep(0.3)
            page.locator(sel).first.click(force=True)
            time.sleep(0.8)

            # 모달 열림 확인
            modal_open = page.locator(".pipe-modal-bg.open").count() > 0
            log(f"  modal_open: {modal_open}")
            if not modal_open:
                log(f"  ⚠️ {key}: 모달 안 열림")
                continue

            # 모달 영역만 스크린샷 (전체 + 모달만)
            page.screenshot(path=str(WORK / f"modal_{key}_full.png"), full_page=False)

            # 모달 SVG 박스 정보
            box = page.locator(".pipe-modal").bounding_box()
            log(f"  pipe-modal box: {box}")

            # 모달 내용 일부 텍스트 검증
            head_txt = page.locator(".pipe-modal-head h3").inner_text()
            log(f"  head: {head_txt}")

            # SVG 내부 요소 수
            svg_g_count = page.locator(".pipe-svg-wrap svg g").count()
            log(f"  svg <g> count: {svg_g_count}")

            # SVG 자체 박스
            svg_box = page.locator(".pipe-svg-wrap svg").bounding_box()
            log(f"  svg box: {svg_box}")

            # 첫 단계 박스 + 마지막 단계 박스 확인
            first_rect = page.locator(".pipe-svg-wrap svg rect").first.bounding_box()
            last_rect = page.locator(".pipe-svg-wrap svg rect").last.bounding_box()
            log(f"  first rect: {first_rect}")
            log(f"  last rect:  {last_rect}")

            # 모달만 isolated 스크린샷
            page.locator(".pipe-modal").screenshot(path=str(WORK / f"modal_{key}_isolated.png"))
            log(f"  saved modal_{key}_full.png + modal_{key}_isolated.png")

            # 닫기
            page.keyboard.press("Escape")
            time.sleep(0.5)

        except Exception as e:
            log(f"  ❌ {key} error: {type(e).__name__}: {e}")

    browser.close()
    log("\nDONE")
