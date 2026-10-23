from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 768})
    page.goto('file:///f:/AUDIRA-REMOTE-DEKSTOP/web/index.html')
    page.evaluate('window.scrollTo(0, 5000)')
    page.wait_for_timeout(200)
    print('Scrolled to:', page.evaluate('window.scrollY'))
    page.locator('.nav-links a[data-i18n="navHome"]').click()
    page.wait_for_timeout(2000)
    print('Final scrollY after Home click:', page.evaluate('window.scrollY'))
    browser.close()
