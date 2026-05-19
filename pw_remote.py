import os, sys, time, json
from playwright.sync_api import sync_playwright

work_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pw_work")
os.makedirs(work_dir, exist_ok=True)
log_file = open(os.path.join(work_dir, "output.log"), "w", encoding="utf-8", buffering=1)
sys.stdout = log_file
sys.stderr = log_file

def log(msg):
    print(msg, flush=True)

cmd_file = os.path.join(work_dir, "commands.json")
result_file = os.path.join(work_dir, "result.json")
console_file = os.path.join(work_dir, "console.log")

with open(cmd_file, "w", encoding="utf-8") as f:
    json.dump([], f)

console_log = open(console_file, "w", encoding="utf-8", buffering=1)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(accept_downloads=True, viewport={"width": 1480, "height": 900})
    page = context.new_page()

    page.on("console", lambda msg: console_log.write(f"[{msg.type}] {msg.text}\n"))
    page.on("pageerror", lambda exc: console_log.write(f"[pageerror] {exc}\n"))

    page.goto("http://localhost:8765/index.html", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
    time.sleep(2)
    log("READY")
    page.screenshot(path=os.path.join(work_dir, "snap_0.png"), full_page=True)

    snap_count = 1
    for tick in range(3600):
        time.sleep(0.5)
        try:
            with open(cmd_file, "r", encoding="utf-8") as f:
                cmds = json.load(f)
        except Exception:
            cmds = []
        if not cmds:
            continue
        cmd = cmds.pop(0)
        with open(cmd_file, "w", encoding="utf-8") as f:
            json.dump(cmds, f, ensure_ascii=False)

        result = {"action": cmd.get("action"), "success": True, "data": None}
        try:
            action = cmd["action"]
            if action == "goto":
                page.goto(cmd["url"], wait_until="domcontentloaded", timeout=30000)
                time.sleep(2)
            elif action == "click":
                page.locator(cmd["selector"]).first.click()
                time.sleep(1)
            elif action == "fill":
                page.locator(cmd["selector"]).first.fill(cmd["value"])
            elif action == "screenshot":
                pass
            elif action == "scroll":
                amt = cmd.get("amount", 500)
                if cmd.get("direction") == "up":
                    amt = -amt
                page.evaluate(f"window.scrollBy(0, {amt})")
                time.sleep(1)
            elif action == "wait":
                page.wait_for_selector(cmd["selector"], timeout=cmd.get("timeout", 10000))
            elif action == "wait_ms":
                time.sleep(cmd.get("ms", 1000) / 1000.0)
            elif action == "evaluate":
                result["data"] = page.evaluate(cmd["script"])
            elif action == "get_content":
                html = page.content()
                with open(os.path.join(work_dir, "page_content.html"), "w", encoding="utf-8") as hf:
                    hf.write(html)
                result["data"] = "saved to page_content.html"
            elif action == "exit":
                page.screenshot(path=os.path.join(work_dir, f"snap_{snap_count}.png"), full_page=True)
                browser.close()
                log("EXIT")
                sys.exit(0)
            else:
                result["success"] = False
                result["data"] = f"unknown action: {action}"
        except Exception as e:
            result["success"] = False
            result["data"] = str(e)

        full = cmd.get("full_page", True)
        page.screenshot(path=os.path.join(work_dir, f"snap_{snap_count}.png"), full_page=full)
        result["screenshot"] = f"snap_{snap_count}.png"
        snap_count += 1

        with open(result_file, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        log(f"CMD: {cmd} -> {result['success']}")

    browser.close()
    log("DONE")
