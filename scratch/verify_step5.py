import os
import time
from playwright.sync_api import sync_playwright

out_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 960})
    
    page.goto("http://127.0.0.1:8000", wait_until="networkidle", timeout=15000)
    time.sleep(1.5)
    
    # Scroll to roadmap
    roadmap = page.locator("#roadmap")
    roadmap.scroll_into_view_if_needed()
    time.sleep(0.5)
    
    # Click Step 5 pill
    step5_btn = page.locator("button:has-text('Receive & Use Your ID')")
    if step5_btn.is_visible():
        step5_btn.click()
        time.sleep(1)
        roadmap.screenshot(path=os.path.join(out_dir, "roadmap_step5_card.png"))
        print("Captured roadmap_step5_card.png")
        
    browser.close()
