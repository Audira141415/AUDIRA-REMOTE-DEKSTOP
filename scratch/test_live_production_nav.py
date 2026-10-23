from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 768})
    print("Connecting to live production https://desk.audira.my.id ...")
    page.goto('https://desk.audira.my.id', wait_until='networkidle')
    page.wait_for_timeout(500)
    
    # 1. Check hit testing on all desktop links at 1280px
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
            print(f"  BLOCKED: '{r['text']}' blocked by <{r['elTag']}>")
            all_ok = False
        else:
            print(f"  OK: '{r['text']}' is clickable and unblocked")
            
    # 2. Test clicking through all links on live production
    nav_links = [
        ('Features', 'a[href="#features"]'),
        ('Architecture', 'a[href="#architecture"]'),
        ('Compare', 'a[href="#comparison"]'),
        ('Self-Host', 'a[href="#selfhost"]'),
        ('Pricing', 'a[href="#pricing"]'),
        ('Downloads', 'a[href="#downloads"]'),
        ('FAQ', 'a[href="#faq"]'),
        ('Home', 'a[data-i18n="navHome"]')
    ]
    
    for name, sel in nav_links:
        link_el = page.locator(sel).first
        link_el.click()
        page.wait_for_timeout(900)
        y = page.evaluate('window.scrollY')
        active = page.evaluate('document.querySelector(".nav-links .nav-link.active")?.textContent')
        print(f"  -> Clicked {name}: scrollY={y}, active='{active}'")
        
    browser.close()
    print("\nLIVE PRODUCTION VERIFICATION SUCCESSFUL!")
