"""화살표 marker 부근 확대 캡처."""
import sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
WORK = HERE / "pw_work"
log = open(WORK / "zoom.log", "w", encoding="utf-8", buffering=1)
sys.stdout = log

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1480, "height": 900})
    page = ctx.new_page()
    page.goto("http://localhost:8770/index.html", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # 사주 노드 클릭
    page.locator('g.pipe-node[data-pipeline="saju"]').first.click(force=True)
    time.sleep(0.8)

    # 모달 안 SVG 첫 번째 화살표 line 위치
    svg = page.locator(".pipe-svg-wrap svg")
    print("SVG box:", svg.bounding_box())

    # 화살표 + 시간축이 만나는 부분 = 좌측 시간축 (x ≈ 192 + 70 = 262 화면 기준)
    # 첫 박스 하단 ~ 두 번째 박스 상단 사이 영역 캡처
    # SVG 내부 첫 박스 끝 = y ≈ 279 (화면 좌표)
    # arrow 영역 = y 279~309
    page.screenshot(
        path=str(WORK / "zoom_arrows.png"),
        clip={"x": 150, "y": 180, "width": 600, "height": 600},
    )
    print("saved zoom_arrows.png")

    # 좌측 시간축 + 화살표 marker 만나는 곳 확대 — 단계 1·2 화살표 부근
    page.screenshot(
        path=str(WORK / "zoom_left_axis.png"),
        clip={"x": 150, "y": 80, "width": 500, "height": 700},
    )
    print("saved zoom_left_axis.png")

    browser.close()
    print("DONE")
