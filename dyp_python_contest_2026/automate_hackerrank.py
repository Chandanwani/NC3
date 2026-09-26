"""
DYP Python Coding Challenge 2026 - HackerRank Automation Helper
---------------------------------------------------------------
Requirements (optional, only if using automated browser):
    pip install playwright
    playwright install chromium

Usage:
    python automate_hackerrank.py
"""

import sys
import os

def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright is not installed.")
        print("To use browser automation, run:")
        print("    pip install playwright")
        print("    playwright install chromium")
        print("\nAlternatively, follow the step-by-step instructions in:")
        print("    hackerrank_setup_guide.md")
        sys.exit(1)

    print("Launching Chromium browser for HackerRank setup...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to HackerRank Contest Administration...")
        page.goto("https://www.hackerrank.com/administration/contests/create")

        print("\n=======================================================")
        print("ACTION REQUIRED IN BROWSER:")
        print("1. Log in to your HackerRank account in the opened window.")
        print("2. Once logged in, you will be on the Contest Creation page.")
        print("3. Refer to 'hackerrank_setup_guide.md' and 'contest_overview.md'")
        print("   to configure the contest, add the 10 MCQs, and upload the 5 zip packages.")
        print("=======================================================\n")

        input("Press Enter here in terminal when you are done to close the browser session: ")
        browser.close()

if __name__ == "__main__":
    main()
