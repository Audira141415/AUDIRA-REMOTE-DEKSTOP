from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1366, 'height': 768})
    page.goto('file:///f:/AUDIRA-REMOTE-DEKSTOP/web/index.html')
    page.wait_for_timeout(500)
    
    # 1. Test Language toggle
    print("Testing Language Toggle...")
    initial_lang = page.locator('#langLabel').text_content().strip()
    page.locator('#langToggle').click()
    new_lang = page.locator('#langLabel').text_content().strip()
    print(f"Language changed from {initial_lang} to {new_lang}")
    page.locator('#langToggle').click() # switch back
    
    # 2. Test Theme toggle
    print("Testing Theme Toggle...")
    initial_theme = page.evaluate('document.documentElement.getAttribute("data-theme")')
    page.locator('#themeToggle').click()
    new_theme = page.evaluate('document.documentElement.getAttribute("data-theme")')
    print(f"Theme changed from {initial_theme} to {new_theme}")
    page.locator('#themeToggle').click() # switch back
    
    # 3. Test Console Login button
    print("Testing Console Login button...")
    page.locator('#openLoginBtn').click()
    page.wait_for_timeout(300)
    modal_open = page.locator('#loginModal').is_visible()
    print(f"Login modal opened: {modal_open}")
    # Close modal via Escape
    page.keyboard.press('Escape')
    page.wait_for_timeout(300)
    modal_open = page.locator('#loginModal').is_visible()
    print(f"Login modal closed: {not modal_open}")
    
    # 4. Test each nav link click and scroll target
    links = [
        ('Features', 'a[href="#features"]'),
        ('Architecture', 'a[href="#architecture"]'),
        ('Compare', 'a[href="#comparison"]'),
        ('Self-Host', 'a[href="#selfhost"]'),
        ('Pricing', 'a[href="#pricing"]'),
        ('Downloads', 'a[href="#downloads"]'),
        ('FAQ', 'a[href="#faq"]'),
        ('Home', 'a[data-i18n="navHome"]')
    ]
    
    for name, sel in links:
        print(f"\nClicking {name} ({sel})...")
        link_el = page.locator(sel).first
        link_el.click()
        page.wait_for_timeout(1000)
        y = page.evaluate('window.scrollY')
        active_text = page.evaluate('document.querySelector(".nav-links .nav-link.active")?.textContent')
        print(f"  scrollY: {y}, active nav item: '{active_text}'")

    browser.close()
    print("\nALL HEADER INTERACTIONS AND NAVIGATION LINKS FUNCTION TEST COMPLETE!")
