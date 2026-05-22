"""기존 노드 → 단일 파이프라인 모달 동작의 baseline 스크린샷 캡처.

본 스크립트는 2단계 모달(노드 → 옵션 → 파이프라인) 리팩토링 전,
9개 도메인 노드 클릭 시 즉시 표시되는 파이프라인 모달의 외형을 보존한다.
리팩토링 후 옵션 선택 시 동일 결과인지 시각 비교 용도.

출력: pw_work/baseline_<node>.png × 9
"""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

HERE = Path(__file__).parent
NODES = ['saju', 'mbti', 'dream', 'divination', 'clinical',
         'face', 'palm', 'name', 'star']


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1400, 'height': 1800})
        await page.goto('http://localhost:9876/')
        await page.wait_for_selector('.pipe-node')
        for key in NODES:
            await page.click(f'[data-pipeline="{key}"]')
            await page.wait_for_selector('.pipe-modal-bg.open', timeout=3000)
            await page.wait_for_timeout(400)
            await page.screenshot(
                path=str(HERE / f'baseline_{key}.png'), full_page=True)
            await page.click('.pipe-modal-close')
            await page.wait_for_timeout(200)
        await browser.close()


asyncio.run(main())
