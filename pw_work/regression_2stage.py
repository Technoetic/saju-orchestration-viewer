"""
2단계 모달 회귀 검증 — 9 노드 × ~67 옵션 자동 캡처.

전제: `python -m http.server 9876` 가동 중 (또는 BASE_URL 환경변수로 다른 포트 지정).
출력:
- pw_work/menu_<node>.png      9장 (메뉴 그리드)
- pw_work/pipe_<node>_<opt>.png ~67장 (파이프라인 SVG)
- stdout: 노드별 카드 수 + 총 옵션 수

회귀 비교 baseline: pw_work/baseline_<node>.png (Task 1 결과)
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

HERE = Path(__file__).parent
BASE_URL = os.environ.get('BASE_URL', 'http://localhost:9876/')
NODES = ['saju', 'mbti', 'dream', 'divination', 'clinical', 'face', 'palm', 'name', 'star']
VIEWPORT_W = 1400
VIEWPORT_H = 1800
MODAL_OPEN_TIMEOUT_MS = 3000
MODAL_SETTLE_MS = 400
CLOSE_SETTLE_MS = 200
PIPE_SVG_TIMEOUT_MS = 3000


def main():
    HERE.mkdir(exist_ok=True)
    expected_counts = {}
    report = []
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': VIEWPORT_W, 'height': VIEWPORT_H})

        try:
            page.goto(BASE_URL, wait_until='domcontentloaded', timeout=8000)
        except PWTimeout:
            print(f'[ERROR] Cannot reach {BASE_URL} — start `python -m http.server 9876` first.', file=sys.stderr)
            browser.close()
            sys.exit(2)

        page.wait_for_selector('.pipe-node', timeout=5000)

        for node in NODES:
            try:
                page.click(f'[data-pipeline="{node}"]')
                page.wait_for_selector('.pipe-modal-bg.open', timeout=MODAL_OPEN_TIMEOUT_MS)
                page.wait_for_selector('.pipe-menu-card', timeout=MODAL_OPEN_TIMEOUT_MS)
                page.wait_for_timeout(MODAL_SETTLE_MS)
                cards = page.query_selector_all('.pipe-menu-card')
                n_cards = len(cards)
                expected_counts[node] = n_cards
                page.screenshot(path=str(HERE / f'menu_{node}.png'), full_page=True)

                opt_keys = [c.get_attribute('data-option') for c in cards]
                for opt in opt_keys:
                    try:
                        page.click(f'.pipe-menu-card[data-option="{opt}"]')
                        page.wait_for_selector('.pipe-svg-wrap svg', timeout=PIPE_SVG_TIMEOUT_MS)
                        page.wait_for_timeout(MODAL_SETTLE_MS)
                        page.screenshot(path=str(HERE / f'pipe_{node}_{opt}.png'), full_page=True)
                        page.click('#pipe-modal-back')
                        page.wait_for_selector('.pipe-menu-card', timeout=MODAL_OPEN_TIMEOUT_MS)
                    except (PWTimeout, Exception) as e:
                        failures.append(f'{node}/{opt}: {type(e).__name__}: {e}')
                        # 모달이 비정상이면 닫고 다음 노드로
                        try:
                            page.click('#pipe-modal-close')
                            page.wait_for_timeout(CLOSE_SETTLE_MS)
                        except Exception:
                            pass
                        break

                page.click('#pipe-modal-close')
                page.wait_for_timeout(CLOSE_SETTLE_MS)
                report.append(f'{node}: {n_cards} options')
            except (PWTimeout, Exception) as e:
                failures.append(f'{node} (menu): {type(e).__name__}: {e}')
                report.append(f'{node}: FAILED ({type(e).__name__})')

        browser.close()

    total = sum(expected_counts.values())
    print('=' * 60)
    for line in report:
        print(line)
    print('=' * 60)
    print(f'Total options captured: {total}')
    if failures:
        print(f'\nFAILURES ({len(failures)}):')
        for f in failures:
            print(f'  ! {f}')
        sys.exit(1)
    else:
        print('All nodes + options OK')


if __name__ == '__main__':
    main()
