from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    # Test common viewport sizes: 1366 (laptop), 1280 (desktop small), 1024 (tablet/small laptop), 1440 (standard)
    for width in [1024, 1100, 1200, 1280, 1366, 1440]:
        print(f"\n=================== VIEWPORT WIDTH {width} ===================")
        page = browser.new_page(viewport={'width': width, 'height': 768})
        page.goto('https://desk.audira.my.id', wait_until='networkidle')
        
        # Check elements in header
        res = page.evaluate('''() => {
            const header = document.querySelector('.site-header');
            const nav = document.querySelector('.site-nav');
            const navLinks = document.querySelector('.nav-links');
            const navActions = document.querySelector('.nav-actions');
            const links = Array.from(document.querySelectorAll('.nav-links a')).map(a => {
                const r = a.getBoundingClientRect();
                return { text: a.textContent.trim(), x: r.x, y: r.y, w: r.width, h: r.height, r: r.right };
            });
            const actionsRect = navActions ? navActions.getBoundingClientRect() : null;
            const navLinksRect = navLinks ? navLinks.getBoundingClientRect() : null;
            const headerRect = header.getBoundingClientRect();
            
            // Check elementFromPoint for each link center
            const hitTests = links.map(l => {
                const cx = l.x + l.w / 2;
                const cy = l.y + l.h / 2;
                const el = document.elementFromPoint(cx, cy);
                return {
                    text: l.text,
                    cx, cy,
                    elementTag: el ? el.tagName : 'null',
                    elementClass: el ? el.className : '',
                    elementId: el ? el.id : '',
                    elementText: el ? el.textContent.substring(0, 30) : '',
                    hitCorrect: el ? (el.textContent.trim() === l.text || el.closest('a')?.textContent.trim() === l.text) : false
                };
            });

            return {
                headerH: headerRect.height,
                navLinksW: navLinksRect.width,
                navActionsX: actionsRect.x,
                links,
                hitTests
            };
        }''')
        
        print(f"Header height: {res['headerH']}, navActions X: {res['navActionsX']}")
        for hit in res['hitTests']:
            status = "OK" if hit['hitCorrect'] else f"BLOCKED by <{hit['elementTag']} class='{hit['elementClass']}' id='{hit['elementId']}'> text='{hit['elementText']}'"
            print(f"  Link '{hit['text']}': at ({hit['cx']:.1f}, {hit['cy']:.1f}) -> {status}")
            
        page.close()
    browser.close()
