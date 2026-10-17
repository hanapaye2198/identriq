import os
import time
from playwright.sync_api import sync_playwright

out_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 960})
    
    page.goto("http://127.0.0.1:8000", wait_until="networkidle", timeout=15000)
    time.sleep(2)
    
    # 1. Capture Showcase with 3D Card
    showcase = page.locator("#showcase")
    if showcase.is_visible():
        showcase.scroll_into_view_if_needed()
        time.sleep(1)
        showcase.screenshot(path=os.path.join(out_dir, "card_template_showcase.png"))
        print("Captured card_template_showcase.png")
        
    # 2. Capture close-up of 3D Card front
    card = page.locator("#showcase .group.relative").first
    if card.is_visible():
        card.screenshot(path=os.path.join(out_dir, "card_template_front_closeup.png"))
        print("Captured card_template_front_closeup.png")
        
        # Hover to test 3D tilt
        box = card.bounding_box()
        if box:
            page.mouse.move(box["x"] + box["width"] * 0.8, box["y"] + box["height"] * 0.2)
            time.sleep(0.5)
            card.screenshot(path=os.path.join(out_dir, "card_template_tilt_hover.png"))
            print("Captured card_template_tilt_hover.png")
            
        # Flip card
        flip_btn = page.locator("button:has-text('Flip to')").first
        if flip_btn.is_visible():
            flip_btn.click()
            time.sleep(0.8)
            card.screenshot(path=os.path.join(out_dir, "card_template_back_closeup.png"))
            print("Captured card_template_back_closeup.png")

    # 3. Capture Roadmap Step 4 with 3D card
    roadmap = page.locator("#roadmap")
    if roadmap.is_visible():
        roadmap.scroll_into_view_if_needed()
        time.sleep(1)
        # Click step 4 if steps are interactive
        step4 = page.locator("button:has-text('Receive and use your ID')")
        if step4.is_visible():
            step4.click()
            time.sleep(0.5)
        roadmap.screenshot(path=os.path.join(out_dir, "roadmap_with_template.png"))
        print("Captured roadmap_with_template.png")

    browser.close()

print("All card verification screenshots saved.")
