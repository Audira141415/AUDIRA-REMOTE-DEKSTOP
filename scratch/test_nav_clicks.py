import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    logs = []
    page.on('console', lambda msg: logs.append(f'[{msg.type}] {msg.text}'))
    page.on('pageerror', lambda err: logs.append(f'[PAGE ERROR] {err}'))
    
    print('Navigating to https://desk.audira.my.id ...')
    page.goto('https://desk.audira.my.id', wait_until='networkidle')
    print('Console logs:')
    for l in logs:
        print('  ', l)
        
    initial_y = page.evaluate('window.scrollY')
    print(f'Initial scrollY: {initial_y}')
    
    nav_selectors = [
        ('Features', 'a[href="#features"]'),
        ('Architecture', 'a[href="#architecture"]'),
        ('Compare', 'a[href="#comparison"]'),
        ('Self-Host', 'a[href="#selfhost"]'),
        ('Pricing', 'a[href="#pricing"]'),
        ('Downloads', 'a[href="#downloads"]'),
        ('FAQ', 'a[href="#faq"]'),
        ('Home', '.nav-links a[data-i18n="navHome"]')
    ]
    
    for name, sel in nav_selectors:
        print(f'\n--- Testing click on {name} ({sel}) ---')
        el = page.locator(sel).first
        if not el.is_visible():
            print(f'WARNING: {name} is NOT visible!')
            continue
        box = el.bounding_box()
        print(f'Bounding box: {box}')
        el.click()
        page.wait_for_timeout(1000)
        y = page.evaluate('window.scrollY')
        hash_val = page.evaluate('window.location.hash')
        print(f'scrollY after click: {y}, hash: {hash_val}')

    browser.close()
