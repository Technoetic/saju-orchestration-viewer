"""GitHub Pages 라이브에서 9개 노드 + 4개 신규 모달 검증."""
import sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
WORK = HERE / "pw_work"
WORK.mkdir(exist_ok=True)
log = open(WORK / "live_check.log", "w", encoding="utf-8", buffering=1)
sys.stdout = log

URL = "https://technoetic.github.io/saju-orchestration-viewer/"
NEW_KEYS = ["face", "palm", "name", "star"]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1480, "height": 1200})
    page = ctx.new_page()
    page.goto(URL, wait_until="domcontentloaded", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
    time.sleep(2)
    print("LIVE LOADED:", URL)

    # 대시보드 전체
    page.screenshot(path=str(WORK / "live_dashboard.png"), full_page=False)
    print("saved live_dashboard.png")

    # 9개 노드 카운트
    n = page.locator("g.pipe-node").count()
    print(f"pipe-node count: {n}")

    # 4개 신규 모달 자동 캡처
    for key in NEW_KEYS:
        page.keyboard.press("Escape")
        time.sleep(0.3)
        sel = f'g.pipe-node[data-pipeline="{key}"]'
        page.locator(sel).first.click(force=True)
        time.sleep(0.8)
        open_now = page.locator(".pipe-modal-bg.open").count() > 0
        print(f"  {key}: modal_open={open_now}")
        if open_now:
            head = page.locator(".pipe-modal-head h3").inner_text()
            print(f"    head: {head}")
            page.locator(".pipe-modal").screenshot(path=str(WORK / f"live_modal_{key}.png"))
            print(f"    saved live_modal_{key}.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

    browser.close()
    print("DONE")
