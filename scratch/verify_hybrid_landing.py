import os
import time
from playwright.sync_api import sync_playwright

out_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # 1. Desktop 1440px
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://127.0.0.1:8000", wait_until="networkidle", timeout=15000)
    time.sleep(1.5)
    page.screenshot(path=os.path.join(out_dir, "hybrid_landing_desktop_1440.png"), full_page=False)

    # Screenshot quick services + stats
    qs = page.locator("#quick-services")
    if qs.is_visible():
        qs.screenshot(path=os.path.join(out_dir, "hybrid_quick_services.png"))

    # Screenshot Dual 3D showcase
    sc = page.locator("#showcase")
    if sc.is_visible():
        sc.screenshot(path=os.path.join(out_dir, "hybrid_3d_showcase.png"))

    # 2. Tablet 768px
    page.set_viewport_size({"width": 768, "height": 1024})
    time.sleep(1)
    page.screenshot(path=os.path.join(out_dir, "hybrid_landing_tablet_768.png"), full_page=False)

    # 3. Mobile 375px
    page.set_viewport_size({"width": 375, "height": 812})
    time.sleep(1)
    page.screenshot(path=os.path.join(out_dir, "hybrid_landing_mobile_375.png"), full_page=False)

    browser.close()

print("Verified hybrid landing screenshots successfully saved.")
