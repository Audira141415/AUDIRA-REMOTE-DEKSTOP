from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    # Test across viewports
    for width in [1024, 1100, 1200, 1280, 1366, 1440]:
        print(f"\n=================== TESTING LOCAL AT VIEWPORT {width} ===================")
        page = browser.new_page(viewport={'width': width, 'height': 768})
        page.goto('file:///f:/AUDIRA-REMOTE-DEKSTOP/web/index.html')
        page.wait_for_timeout(500)
        
        # Check if mobile toggle or nav links are visible
        is_mobile = width <= 1220
        toggle_visible = page.locator('#mobileNavToggle').is_visible()
        print(f"Is mobile expected: {is_mobile}, toggle visible: {toggle_visible}")
        
        if is_mobile:
            # Test clicking mobile hamburger toggle
            print("Clicking mobileNavToggle...")
            page.locator('#mobileNavToggle').click()
            page.wait_for_timeout(300)
            is_open = page.locator('.nav-links').is_visible()
            print(f"Drawer is visible: {is_open}")
            
            # Click Pricing link in drawer
            print("Clicking Pricing in mobile drawer...")
            pricing = page.locator('.nav-links a[href="#pricing"]').first
            pricing.click()
            page.wait_for_timeout(1000)
            y = page.evaluate('window.scrollY')
            print(f"scrollY after clicking Pricing: {y} (Pricing section position: {page.evaluate('document.getElementById(\"pricing\").getBoundingClientRect().top')})")
        else:
            # Desktop view: test hit tests for each link
            res = page.evaluate('''() => {
                const links = Array.from(document.querySelectorAll('.nav-links a')).map(a => {
                    const r = a.getBoundingClientRect();
                    return { text: a.textContent.trim(), href: a.getAttribute('href'), x: r.x, y: r.y, w: r.width, h: r.height };
                });
                return links.map(l => {
                    const cx = l.x + l.w / 2;
                    const cy = l.y + l.h / 2;
                    const el = document.elementFromPoint(cx, cy);
                    const hit = el ? (el.textContent.trim() === l.text || el.closest('a')?.textContent.trim() === l.text) : false;
                    return { text: l.text, hit, elTag: el ? el.tagName : 'none' };
                });
            }''')
            
            all_ok = True
            for r in res:
                if not r['hit']:
                    print(f"  FAILED: '{r['text']}' blocked by <{r['elTag']}>")
                    all_ok = False
            if all_ok:
                print("  ALL desktop navigation links are 100% clickable and unblocked!")
                
            # Test clicking Features
            print("Clicking Features link...")
            page.locator('.nav-links a[href="#features"]').click()
            page.wait_for_timeout(800)
            print(f"scrollY after Features: {page.evaluate('window.scrollY')}")
            
            # Test clicking Architecture
            print("Clicking Architecture link...")
            page.locator('.nav-links a[href="#architecture"]').click()
            page.wait_for_timeout(800)
            print(f"scrollY after Architecture: {page.evaluate('window.scrollY')}")

            # Test clicking Compare
            print("Clicking Compare link...")
            page.locator('.nav-links a[href="#comparison"]').click()
            page.wait_for_timeout(800)
            print(f"scrollY after Compare: {page.evaluate('window.scrollY')}")

            # Test clicking Downloads
            print("Clicking Downloads link...")
            page.locator('.nav-links a[href="#downloads"]').click()
            page.wait_for_timeout(800)
            print(f"scrollY after Downloads: {page.evaluate('window.scrollY')}")
            
            # Test clicking Home
            print("Clicking Home link...")
            page.locator('.nav-links a[data-i18n="navHome"]').click()
            page.wait_for_timeout(800)
            print(f"scrollY after Home: {page.evaluate('window.scrollY')}")

        page.close()
    browser.close()
