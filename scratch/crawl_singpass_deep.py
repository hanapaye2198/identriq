import os
import json
import time
from playwright.sync_api import sync_playwright

out_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b\crawl_results"

SINGPASS_URLS = [
    ("singpass_individuals", "https://www.singpass.gov.sg/main/individuals/"),
    ("singpass_login_ui", "https://portal.singpass.gov.sg/home/ui/login"),
    ("singpass_register_instructions", "https://portal.singpass.gov.sg/home/ui/register/instructions"),
    ("uaepass_services", "https://uaepass.ae/#/services"),
    ("fayda_locations_deep", "https://id.gov.et/locations")
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    page = context.new_page()

    for name, url in SINGPASS_URLS:
        print(f"Crawling {name}: {url}...")
        try:
            page.goto(url, wait_until="networkidle", timeout=25000)
            time.sleep(2)
            shot = os.path.join(out_dir, f"{name}.png")
            page.screenshot(path=shot, full_page=False)

            # Extract key UI design patterns
            info = page.evaluate("""() => {
                const cards = [];
                document.querySelectorAll('[class*="card"], [class*="box"], [class*="feature"], [class*="qr"]').forEach(c => {
                    const text = c.innerText.trim();
                    if (text.length > 10 && text.length < 300) {
                        const s = window.getComputedStyle(c);
                        cards.push({
                            text: text.slice(0, 120),
                            bg: s.backgroundColor,
                            border: s.border,
                            radius: s.borderRadius,
                            shadow: s.boxShadow
                        });
                    }
                });
                return {
                    title: document.title,
                    cards: cards.slice(0, 8)
                };
            }""")
            print(f"Done {name}: {info['title']}")
            with open(os.path.join(out_dir, f"{name}.json"), "w", encoding="utf-8") as f:
                json.dump(info, f, indent=2)
        except Exception as e:
            print(f"Error {name}: {e}")

    browser.close()
