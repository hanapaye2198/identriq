import sys
import os
import json
import time
from playwright.sync_api import sync_playwright

TARGETS = [
    {
        "name": "singpass",
        "url": "https://www.singpass.gov.sg",
        "notes": "Polish reference, QR, verification, app showcase"
    },
    {
        "name": "uaepass",
        "url": "https://uaepass.ae",
        "notes": "Digital ID card, app presentation, sleek government identity"
    },
    {
        "name": "fayda",
        "url": "https://id.gov.et",
        "notes": "MOSIP pre-registration and center locator"
    },
    {
        "name": "philsys",
        "url": "https://philsys.gov.ph",
        "notes": "Content structure: Registration, Use Cases, National ID"
    },
    {
        "name": "govuk",
        "url": "https://design-system.service.gov.uk",
        "notes": "One-question-per-page, clear forms, accessibility"
    }
]

out_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b\crawl_results"
os.makedirs(out_dir, exist_ok=True)

results = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    page = context.new_page()

    for target in TARGETS:
        name = target["name"]
        url = target["url"]
        print(f"\n--- Crawling {name}: {url} ---")
        try:
            resp = page.goto(url, wait_until="domcontentloaded", timeout=25000)
            time.sleep(3) # allow dynamic hydration/rendering

            title = page.title()
            screenshot_path = os.path.join(out_dir, f"{name}_desktop.png")
            page.screenshot(path=screenshot_path, full_page=False)

            # Mobile screenshot
            page.set_viewport_size({"width": 375, "height": 812})
            time.sleep(1)
            mobile_path = os.path.join(out_dir, f"{name}_mobile.png")
            page.screenshot(path=mobile_path, full_page=False)
            page.set_viewport_size({"width": 1440, "height": 900})

            # Extract typography, colors, structure
            analysis = page.evaluate("""() => {
                const colors = new Set();
                const bgColors = new Set();
                const fontFamilies = new Set();
                const headings = [];
                const buttons = [];
                const sections = [];

                // Grab headings
                document.querySelectorAll('h1, h2, h3').forEach(h => {
                    headings.push({
                        tag: h.tagName.toLowerCase(),
                        text: h.innerText.trim().slice(0, 100)
                    });
                });

                // Grab buttons / main CTAs
                document.querySelectorAll('a, button').forEach(el => {
                    const text = el.innerText.trim();
                    if (text.length > 2 && text.length < 40 && el.offsetParent !== null) {
                        const style = window.getComputedStyle(el);
                        if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.borderRadius !== '0px') {
                            buttons.push({
                                text: text,
                                bg: style.backgroundColor,
                                color: style.color,
                                radius: style.borderRadius
                            });
                        }
                    }
                });

                // Scan elements for styles
                document.querySelectorAll('body, header, nav, section, main, h1, h2, p, button, a').forEach(el => {
                    const s = window.getComputedStyle(el);
                    if (s.color) colors.add(s.color);
                    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgColors.add(s.backgroundColor);
                    if (s.fontFamily) fontFamilies.add(s.fontFamily.split(',')[0].replace(/['"]/g, '').trim());
                });

                // Section structure
                document.querySelectorAll('section, main > div, header, footer').forEach(sec => {
                    const h = sec.querySelector('h1, h2, h3');
                    sections.push({
                        id: sec.id || null,
                        classes: sec.className.slice(0, 80),
                        heading: h ? h.innerText.trim().slice(0, 80) : null
                    });
                });

                return {
                    colors: Array.from(colors).slice(0, 15),
                    bgColors: Array.from(bgColors).slice(0, 15),
                    fontFamilies: Array.from(fontFamilies).slice(0, 8),
                    headings: headings.slice(0, 15),
                    buttons: buttons.slice(0, 8),
                    sections: sections.slice(0, 10)
                };
            }""")

            results[name] = {
                "url": url,
                "title": title,
                "screenshot_desktop": screenshot_path,
                "screenshot_mobile": mobile_path,
                "analysis": analysis
            }
            print(f"Success: {name} | Title: {title}")
        except Exception as e:
            print(f"Error crawling {name}: {e}")
            results[name] = {"url": url, "error": str(e)}

    # Check fayda locations specifically
    print("\n--- Crawling Fayda Locations ---")
    try:
        page.goto("https://id.gov.et/locations", wait_until="domcontentloaded", timeout=25000)
        time.sleep(3)
        loc_path = os.path.join(out_dir, "fayda_locations.png")
        page.screenshot(path=loc_path, full_page=False)
        results["fayda_locations"] = {
            "title": page.title(),
            "screenshot": loc_path
        }
        print("Success: Fayda locations")
    except Exception as e:
        print(f"Error fayda locations: {e}")

    browser.close()

with open(os.path.join(out_dir, "benchmark_report.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\nAll done! Saved to benchmark_report.json")
