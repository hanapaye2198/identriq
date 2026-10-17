import os
import time
from playwright.sync_api import sync_playwright

out_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # 1. Desktop 1440x900 - First glance hero occupying 100vh
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://127.0.0.1:8000", wait_until="networkidle", timeout=15000)
    time.sleep(1.5)
    page.screenshot(path=os.path.join(out_dir, "fayda_style_hero_1440.png"), full_page=False)

    # 2. Scroll down to roadmap
    page.evaluate("window.scrollTo(0, 950)")
    time.sleep(1)
    page.screenshot(path=os.path.join(out_dir, "fayda_scrolled_roadmap_1440.png"), full_page=False)

    # 3. Scroll down to 3D showcase
    page.evaluate("document.getElementById('showcase').scrollIntoView()")
    time.sleep(1)
    page.screenshot(path=os.path.join(out_dir, "fayda_scrolled_3d_showcase_1440.png"), full_page=False)

    # 4. Mobile 375x812
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto("http://127.0.0.1:8000", wait_until="networkidle", timeout=15000)
    time.sleep(1)
    page.screenshot(path=os.path.join(out_dir, "fayda_style_hero_mobile_375.png"), full_page=False)

    browser.close()

print("Fayda hero verification screenshots successfully captured!")
